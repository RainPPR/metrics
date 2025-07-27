import { useState, useEffect, useMemo, FC, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Star, GitFork, Eye, ArrowUp, ArrowDown, Code, LayoutGrid, List, Sun, Moon, RefreshCw, ServerCrash, Github } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- TYPES --- //
interface RepoOwner {
  login: string;
  avatar_url: string;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: RepoOwner;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  pushed_at: string;
  language: string | null;
}

type ViewMode = 'card' | 'list';
type Theme = 'light' | 'dark';
type SortKey = 'stargazers_count' | 'pushed_at' | 'name';
type SortOrder = 'asc' | 'desc';

// --- CONFIGURATION --- //
const GITHUB_USERS = ['RainPPR', 'RaineMtF'];
const GITHUB_ORGS = ['RaineBlog'];
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// --- HELPER & UI COMPONENTS --- //

const StatIcon: FC<{ icon: ReactNode; value: number | string; label: string }> = ({ icon, value, label }) => (
  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400" title={label}>
    {icon}
    <span className="text-sm font-medium">{value}</span>
  </div>
);

const RepoCard: FC<{ repo: Repo }> = ({ repo }) => (
  <div className="flex h-full flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center gap-4 mb-4">
      <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700" />
      <div>
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {repo.name}
        </a>
        <p className="text-sm text-slate-500 dark:text-slate-400">by {repo.owner.login}</p>
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">
      {repo.description || 'No description available.'}
    </p>
    <div className="mt-auto">
        {repo.language && (
            <div className="flex items-center gap-2 mb-4">
                <span className={`h-3 w-3 rounded-full bg-blue-500`}></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{repo.language}</span>
            </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-4">
                <StatIcon icon={<Star size={16} />} value={repo.stargazers_count} label="Stars" />
                <StatIcon icon={<GitFork size={16} />} value={repo.forks_count} label="Forks" />
                <StatIcon icon={<Eye size={16} />} value={repo.watchers_count} label="Watchers" />
            </div>
             <p>Updated {formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })}</p>
        </div>
    </div>
  </div>
);

const RepoListItem: FC<{ repo: Repo }> = ({ repo }) => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors duration-200">
    <div className="flex items-center gap-4 truncate">
      <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hidden sm:block" />
      <div className="truncate">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block">
          {repo.full_name}
        </a>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {repo.description || 'No description'}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
      {repo.language && <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden lg:block">{repo.language}</span>}
      <div className="hidden md:flex items-center gap-4">
        <StatIcon icon={<Star size={16} />} value={repo.stargazers_count} label="Stars" />
        <StatIcon icon={<GitFork size={16} />} value={repo.forks_count} label="Forks" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-500 w-32 text-right hidden sm:block">{formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })}</p>
    </div>
  </div>
);

const SkeletonCard: FC = () => (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div className="flex-1">
                <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-2"></div>
                <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            </div>
        </div>
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-2"></div>
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-4"></div>
        <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
                <div className="h-5 w-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="h-5 w-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            </div>
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        </div>
    </div>
);

// --- MAIN COMPONENT --- //
const GitHubShowcasePage = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [theme, setTheme] = useState<Theme>('light');
  const [sortKey, setSortKey] = useState<SortKey>('stargazers_count');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const savedTheme = localStorage.getItem('gh-showcase-theme') as Theme | null;
    const savedViewMode = localStorage.getItem('gh-showcase-view') as ViewMode | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    if (savedViewMode) setViewMode(savedViewMode);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gh-showcase-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('gh-showcase-view', viewMode);
  }, [viewMode]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    if (!forceRefresh) {
      const cachedData = localStorage.getItem('gh-repo-cache');
      const cachedTimestamp = localStorage.getItem('gh-repo-timestamp');
      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10);
        if (age < CACHE_DURATION_MS) {
          console.log('Loading data from cache.');
          setRepos(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }
    }

    console.log('Fetching fresh data from GitHub API.');
    try {
      const fetchPromises = [
        ...GITHUB_USERS.map(user => fetch(`https://api.github.com/users/${user}/repos?per_page=100`)),
        ...GITHUB_ORGS.map(org => fetch(`https://api.github.com/orgs/${org}/repos?per_page=100`))
      ];

      const responses = await Promise.all(fetchPromises);
      
      for (const res of responses) {
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
          }
          throw new Error(`Failed to fetch data: ${res.statusText}`);
        }
      }

      const data = await Promise.all(responses.map(res => res.json()));
      const allRepos = data.flat();

      const uniqueRepos = Array.from(new Map(allRepos.map(repo => [repo.id, repo])).values());
      
      setRepos(uniqueRepos);
      localStorage.setItem('gh-repo-cache', JSON.stringify(uniqueRepos));
      localStorage.setItem('gh-repo-timestamp', Date.now().toString());
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedRepos = useMemo(() => {
    return [...repos].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [repos, sortKey, sortOrder]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const controlButtonClasses = "p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors";
  const activeControlButtonClasses = "bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-2">
            <Github className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-50 dark:to-slate-400 bg-clip-text text-transparent">
              GitHub Repository Showcase
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A curated collection of projects from {GITHUB_USERS.join(', ')} and the {GITHUB_ORGS.join(', ')} organization.
          </p>
        </header>

        <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md mb-8 py-4 px-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort by:</label>
              <select 
                id="sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="stargazers_count">Stars</option>
                <option value="pushed_at">Last Update</option>
                <option value="name">Name</option>
              </select>
              <button onClick={toggleSortOrder} className={controlButtonClasses} title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                {sortOrder === 'asc' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchData(true)} className={controlButtonClasses} title="Force Refresh Data">
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
              </button>
              <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-md flex">
                <button onClick={() => setViewMode('card')} className={`${controlButtonClasses} ${viewMode === 'card' ? activeControlButtonClasses : ''}`} title="Card View">
                  <LayoutGrid size={20} />
                </button>
                <button onClick={() => setViewMode('list')} className={`${controlButtonClasses} ${viewMode === 'list' ? activeControlButtonClasses : ''}`} title="List View">
                  <List size={20} />
                </button>
              </div>
              <button onClick={toggleTheme} className={controlButtonClasses} title="Toggle Theme">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>

        {
          loading ? (
            <div className={`grid gap-6 ${viewMode === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <ServerCrash className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-lg font-semibold text-red-800 dark:text-red-300">Failed to load repositories</h3>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRepos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
              {sortedRepos.map(repo => <RepoListItem key={repo.id} repo={repo} />)}
            </div>
          )
        }

      </main>
      <footer className="text-center py-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Powered by React, Tailwind CSS, and the GitHub API.</p>
      </footer>
    </div>
  );
};

export default GitHubShowcasePage;
