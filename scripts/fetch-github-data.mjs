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
          console.log(`[TokenPool] Validated token for: ${login}`);
        }
      } catch (err) {
        // Silent fail for init validation - we still use the token as fallback
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
  // Return data even if there are errors, so we can check fallback fields
  return json;
}

const INFO_QUERY = `
query info($login: String!) {
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
      }
    }
  }
  organization(login: $login) {
    login
    name
    avatarUrl
    description
    repositories(first: 100, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
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
      const response = await fetchGraphQL(INFO_QUERY, { login }, token);
      const data = response.data || {};
      const target = data.user || data.organization;
      
      if (!target) {
        console.warn(`[Warn] Could not find account "${login}". GraphQL errors:`, response.errors);
        continue;
      }

      const isOrg = !!data.organization;
      const userRepos = target.repositories.nodes || [];

      if (!isOrg) {
         const contribs = target.contributionsCollection;
         outData.totalStats.commits += contribs.totalCommitContributions;
         outData.totalStats.prs += contribs.totalPullRequestContributions;
         outData.totalStats.issues += contribs.totalIssueContributions;
         
         outData.users.push({
           login: target.login,
           name: target.name,
           avatarUrl: target.avatarUrl,
           bio: target.bio,
           followers: target.followers.totalCount,
           calendar: contribs.contributionCalendar
         });
      } else {
         // Organizations don't have contribution calendar in the same way
         // We still push them to users list but with empty calendar or skip UI-wise
         outData.users.push({
           login: target.login,
           name: target.name,
           avatarUrl: target.avatarUrl,
           bio: target.description,
           followers: 0,
           calendar: { totalContributions: 0, weeks: [] }
         });
      }
      
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
      
      const mappedRepos = userRepos.map(r => ({ ...r, owner: login }));
      outData.repos.push(...mappedRepos);
      
      const userPages = extractPages(mappedRepos, login);
      outData.pages.push(...userPages);

      // Fetch contributors
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

  // Language stats conversion - DO THIS BEFORE ACHIEVEMENTS
  outData.languageStats = Object.keys(outData.languageStats)
    .map(name => ({ name, ...outData.languageStats[name] }))
    .sort((a, b) => b.size - a.size);

  // Achievements Analysis
  const achievements = [];
  
  if (outData.totalStats.stars >= 100) {
    achievements.push({
      id: 'star-collector',
      title: 'Star Collector',
      description: `Gathered over ${outData.totalStats.stars} stars across all projects.`,
      icon: 'Star'
    });
  }

  if (outData.totalStats.commits >= 500) {
    achievements.push({
      id: 'commit-machine',
      title: 'Code Machine',
      description: `Pushed more than 500 commits. Engineering excellence!`,
      icon: 'Cpu'
    });
  }

  if (outData.languageStats.length >= 3) {
    const topLangs = outData.languageStats.slice(0, 3).map(l => l.name);
    achievements.push({
      id: 'multi-linguist',
      title: 'Polyglot Developer',
      description: `Expertly mastering ${topLangs.join(', ')} and more.`,
      icon: 'Zap'
    });
  }

  outData.achievements = achievements;

  // Convert contributors map to array
  outData.contributors = Array.from(contributorMap.values())
    .sort((a, b) => b.commits - a.commits); 
  
  outData.repos.sort((a, b) => b.stargazerCount - a.stargazerCount);

  const outputPath = path.join(PUBLIC_DIR, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(outData, null, 2), 'utf-8');
  console.log(`[Success] Data written to ${outputPath}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
