import { Cache } from '@/app/lib/cache';
import { ProjectData } from '@/app/portfolio/utils';

// Create a singleton MDX cache
const MDX_CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const projectsCache = new Cache<ProjectData[]>(MDX_CACHE_TTL);
const projectBySlugCache = new Cache<ProjectData | null>(MDX_CACHE_TTL);

// Cache keys
const PROJECTS_CACHE_KEY = 'all-projects';
const PROJECT_BY_SLUG_KEY_PREFIX = 'project-by-slug:';

/**
 * Get or set projects in the cache
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @returns Cached or freshly fetched projects
 */
export function getCachedProjects(fetchFn: () => ProjectData[]): ProjectData[] {
  // Check cache first
  const cachedProjects = projectsCache.get(PROJECTS_CACHE_KEY);
  if (cachedProjects) {
    return cachedProjects;
  }
  
  // Fetch fresh data
  const projects = fetchFn();
  
  // Cache the result
  projectsCache.set(PROJECTS_CACHE_KEY, projects);
  
  return projects;
}

/**
 * Get or set a project by slug in the cache
 * @param slug Project slug
 * @param fetchFn Function to fetch the project if not in cache
 * @returns Cached or freshly fetched project
 */
export function getCachedProjectBySlug(
  slug: string,
  fetchFn: (slug: string) => ProjectData | null
): ProjectData | null {
  const cacheKey = `${PROJECT_BY_SLUG_KEY_PREFIX}${slug}`;
  
  // Check cache first
  const cachedProject = projectBySlugCache.get(cacheKey);
  if (cachedProject !== undefined) {
    return cachedProject;
  }
  
  // Fetch fresh data
  const project = fetchFn(slug);
  
  // Cache the result
  projectBySlugCache.set(cacheKey, project);
  
  return project;
}

/**
 * Invalidate all caches
 */
export function invalidateCaches(): void {
  projectsCache.clear();
  projectBySlugCache.clear();
}

/**
 * Invalidate project caches for a specific slug
 * @param slug Project slug
 */
export function invalidateProjectCache(slug: string): void {
  projectBySlugCache.delete(`${PROJECT_BY_SLUG_KEY_PREFIX}${slug}`);
  projectsCache.delete(PROJECTS_CACHE_KEY);
}