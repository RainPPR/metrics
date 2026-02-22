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
        createdAt
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
  
  // Helper: Calculate Max Streak from Calendar
  let maxStreak = 0;
  let currentStreak = 0;
  outData.users.forEach(u => {
    if (u.calendar && u.calendar.weeks) {
      u.calendar.weeks.forEach(w => {
        w.contributionDays.forEach(d => {
          if (d.contributionCount > 0) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
            currentStreak = 0;
          }
        });
      });
    }
  });

  // 1. Contributions Volume
  if (outData.totalStats.stars >= 100) {
    achievements.push({
      id: 'star-collector',
      title: 'Recognition Index',
      description: `Accumulated ${outData.totalStats.stars} stargazers across repositories, reflecting project visibility and community utility.`,
      icon: 'Star',
      level: outData.totalStats.stars >= 1000 ? 'Gold' : (outData.totalStats.stars >= 500 ? 'Silver' : 'Bronze')
    });
  }

  // 2. Commit Volume
  if (outData.totalStats.commits >= 500) {
    achievements.push({
      id: 'commit-machine',
      title: 'Production Cycle',
      description: `Logged ${outData.totalStats.commits} technical commits. Demonstrates consistent development and maintenance cycles.`,
      icon: 'Cpu',
      level: outData.totalStats.commits >= 5000 ? 'Gold' : 'Silver'
    });
  }

  // 3. Tech Versatility
  if (outData.languageStats.length >= 3) {
    const topLangs = outData.languageStats.slice(0, 3).map(l => l.name);
    achievements.push({
      id: 'multi-linguist',
      title: 'Domain Proficiency',
      description: `Proficient in ${topLangs.join(', ')} and ${outData.languageStats.length} additional languages. Covers diverse engineering domains.`,
      icon: 'Zap',
      level: outData.languageStats.length >= 10 ? 'Gold' : 'Silver'
    });
  }

  // 4. Streak Record (NEW)
  if (maxStreak >= 7) {
    achievements.push({
      id: 'streak-master',
      title: 'Reliability Streak',
      description: `Maintained continuous contribution for ${maxStreak} days. Indicates high reliability and steady progress.`,
      icon: 'Award',
      level: maxStreak >= 30 ? 'Gold' : (maxStreak >= 14 ? 'Silver' : 'Bronze')
    });
  }

  // 5. Portfolio Scale
  if (outData.repos.length >= 20) {
    achievements.push({
      id: 'project-explorer',
      title: 'Infrastructure Scale',
      description: `Managing a portfolio of ${outData.repos.length} repositories, covering multiple technical architectures.`,
      icon: 'Rocket',
      level: outData.repos.length >= 50 ? 'Gold' : 'Silver'
    });
  }

  // 6. Community Engagement
  const totalFollowers = outData.users.reduce((acc, u) => acc + (u.followers || 0), 0);
  if (totalFollowers >= 10) {
    achievements.push({
      id: 'impact-center',
      title: 'Recognition Breadth',
      description: `Directly followed by ${totalFollowers} developers. Reflects consistent social-technical engagement.`,
      icon: 'Users',
      level: totalFollowers >= 50 ? 'Gold' : 'Bronze'
    });
  }

  // 7. Temporal Distribution
  if (outData.totalStats.commits > 1000) {
    achievements.push({
      id: 'night-owl',
      title: 'Temporal Range',
      description: `Commit history shows wide temporal distribution, including late-night maintenance peak cycles.`,
      icon: 'Moon',
      level: 'Silver'
    });
  }

  outData.achievements = achievements;
  outData.totalStats.repoCount = outData.repos.length;

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
