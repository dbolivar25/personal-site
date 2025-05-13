import { Cache } from './cache';

// Cache for formatted dates
const dateFormatCache = new Cache<string>(1000 * 60 * 60); // 1 hour TTL

// Format cache keys
const FORMAT_CACHE_KEY_PREFIX = 'date-format:';

/**
 * Format a date string with optional relative time
 * @param date Date string to format
 * @param includeRelative Whether to include relative time
 * @returns Formatted date string
 */
export function formatDate(date: string, includeRelative = false): string {
  try {
    // Generate cache key based on inputs
    const cacheKey = `${FORMAT_CACHE_KEY_PREFIX}${date}:${includeRelative}`;
    
    // Check cache first
    const cachedDate = dateFormatCache.get(cacheKey);
    if (cachedDate) {
      return cachedDate;
    }
    
    const currentDate = new Date();
    
    // Ensure consistent date format
    const parsedDate = date.includes("T") 
      ? new Date(date) 
      : new Date(`${date}T00:00:00`);
    
    // Validate date
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    
    const yearsAgo = currentDate.getFullYear() - parsedDate.getFullYear();
    const monthsAgo = currentDate.getMonth() - parsedDate.getMonth();
    const daysAgo = currentDate.getDate() - parsedDate.getDate();

    let relativeDate = "";

    if (yearsAgo > 0) {
      relativeDate = `${yearsAgo}y ago`;
    } else if (monthsAgo > 0) {
      relativeDate = `${monthsAgo}mo ago`;
    } else if (daysAgo > 0) {
      relativeDate = `${daysAgo}d ago`;
    } else {
      relativeDate = "Today";
    }

    const fullDate = parsedDate.toLocaleString("en-us", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const result = includeRelative 
      ? `${fullDate} (${relativeDate})`
      : fullDate;
    
    // Cache the result
    dateFormatCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error formatting date ${date}:`, error);
    return date; // Return original string if formatting fails
  }
}