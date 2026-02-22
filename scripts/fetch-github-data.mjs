import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const USERDEFS = ['RainPPR', 'RaineMtF', 'raineblog', 'rainewhk'];

class TokenPool {
  constructor(rawTokens) {
    const tokens = rawTokens.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
    this.tokens = Array.from(new Set(tokens));
    this.tokenOwners = new Map(); 
    this.ownerToTokens = new Map(); 
    this.roundRobinIndex = 0;
  }

  async init() {
    console.log(`[TokenPool] Initializing with ${this.tokens.length} tokens...`);
    for (const token of this.tokens) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Metrics-Dashboard'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const login = data.login;
          this.tokenOwners.set(token, login);
          if (!this.ownerToTokens.has(login)) {
            this.ownerToTokens.set(login, []);
          }
          this.ownerToTokens.get(login).push(token);
          console.log(`[TokenPool] Valid token for user: ${login}`);
        } else {
          console.warn(`[TokenPool] Token failed validation: ${res.status}`);
        }
      } catch (err) {
        console.error(`[TokenPool] Error validating token:`, err.message);
      }
    }
  }

  getTokenForUser(targetUser) {
    if (this.ownerToTokens.has(targetUser) && this.ownerToTokens.get(targetUser).length > 0) {
      return this.ownerToTokens.get(targetUser)[0];
    }
    return this.getAnyToken();
  }

  getAnyToken() {
    if (this.tokens.length === 0) return null;
    const t = this.tokens[this.roundRobinIndex];
    this.roundRobinIndex = (this.roundRobinIndex + 1) % this.tokens.length;
    return t;
  }
}

async function fetchGraphQL(query, variables, token) {
  if (!token) throw new Error("No available token for GraphQL request.");
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Metrics-Dashboard'
    },
    body: JSON.stringify({ query, variables })
  });
  
  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("GraphQL error");
  }
  return json.data;
}

const USER_QUERY = `
query userInfo($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    followers { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        pushedAt
        isPrivate
        primaryLanguage {
          name
          color
        }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges {
            size
            node {
              name
              color
            }
          }
          totalSize
        }
        repositoryTopics(first: 5) {
          nodes {
            topic { name }
          }
        }
      }
    }
  }
}
`;

async function fetchRestAPI(endpoint, token) {
  if (!token) return null;
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Metrics-Dashboard',
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) return null;
  return res.json();
}

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function extractPages(repos, owner) {
  const pages = [];
  for (const repo of repos) {
    const url = repo.homepageUrl;
    if (url && (url.includes('github.io') || url.includes('vercel.app') || url.includes('netlify.app') || url.startsWith('http'))) {
      pages.push({ ...repo, owner });
    } else if (repo.name.includes('github.io')) {
      pages.push({ ...repo, owner });
    }
  }
  return pages;
}

async function run() {
  const rawTokens = process.env.TOKENS_POOL || '';
  const pool = new TokenPool(rawTokens);
  await pool.init();

  if (pool.tokens.length === 0) {
    console.warn("⚠️ WARNING: No valid GitHub tokens found. GraphQL will fail.");
  }

  const outData = {
    users: [],
    repos: [],
    pages: [],
    languageStats: {},
    totalStats: {
      stars: 0,
      commits: 0,
      prs: 0,
      issues: 0
    },
    updatedAt: new Date().toISOString()
  };

  const contributorMap = new Map(); // login -> { avatarUrl, commits, repos: [] }

  for (const login of USERDEFS) {
    console.log(`[Fetch] Fetching data for ${login}...`);
    const token = pool.getTokenForUser(login);
    
    try {
      if (!token) {
        console.log(`Skipping ${login} (no token available).`);
        continue;
      }
      const data = await fetchGraphQL(USER_QUERY, { login }, token);
      const user = data.user;
      
      const contribs = user.contributionsCollection;
      
      // Aggregate stats
      outData.totalStats.commits += contribs.totalCommitContributions;
      outData.totalStats.prs += contribs.totalPullRequestContributions;
      outData.totalStats.issues += contribs.totalIssueContributions;
      
      const userRepos = user.repositories.nodes || [];
      userRepos.forEach(r => outData.totalStats.stars += r.stargazerCount);

      // Language usage
      userRepos.forEach(repo => {
        if (repo.languages && repo.languages.edges) {
          repo.languages.edges.forEach(edge => {
            const langName = edge.node.name;
            if (!outData.languageStats[langName]) {
              outData.languageStats[langName] = { size: 0, color: edge.node.color };
            }
            outData.languageStats[langName].size += edge.size;
          });
        }
      });
      
      outData.users.push({
        login: user.login,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        followers: user.followers.totalCount,
        calendar: contribs.contributionCalendar
      });
      
      const mappedRepos = userRepos.map(r => ({ ...r, owner: login }));
      outData.repos.push(...mappedRepos);
      
      const userPages = extractPages(mappedRepos, login);
      outData.pages.push(...userPages);

      // Fetch contributors for top 5 repos of each user to avoid excessive calls
      for (const repo of userRepos.slice(0, 5)) {
        const contributors = await fetchRestAPI(`/repos/${login}/${repo.name}/contributors?per_page=10`, pool.getAnyToken());
        if (contributors && Array.isArray(contributors)) {
          contributors.forEach(c => {
            if (!contributorMap.has(c.login)) {
              contributorMap.set(c.login, { login: c.login, avatarUrl: c.avatar_url, commits: 0, repos: [] });
            }
            const info = contributorMap.get(c.login);
            info.commits += c.contributions;
            info.repos.push(repo.name);
          });
        }
      }
      
    } catch (e) {
      console.error(`[Error] Failed fetching data for ${login}:`, e.message);
    }
  }

  // Convert contributors map to array and sort by total contributions
  outData.contributors = Array.from(contributorMap.values())
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 50); // Top 50 contributors
  
  // Sort repos by stars
  outData.repos.sort((a, b) => b.stargazerCount - a.stargazerCount);

  // Language stats sorting
  outData.languageStats = Object.keys(outData.languageStats)
    .map(name => ({ name, ...outData.languageStats[name] }))
    .sort((a, b) => b.size - a.size);

  const outputPath = path.join(PUBLIC_DIR, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(outData, null, 2), 'utf-8');
  console.log(`[Success] Data written to ${outputPath}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
