# Performance Optimization

## MDX Data Loading

### Issue
The current implementation reads MDX files from the filesystem on every request, with no caching mechanism:

```typescript
// Current approach in utils.ts
export function getProjects() {
  return getMDXData(path.join(process.cwd(), "app", "portfolio", "projects"));
}
```

Multiple components call this function independently, causing redundant file system operations.

### Recommendation
Implement a caching mechanism and centralize data fetching:

```typescript
// cache.ts
let projectsCache: ProjectData[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export function getProjects(): ProjectData[] {
  const now = Date.now();
  
  // Return cached data if valid
  if (projectsCache && now - lastFetchTime < CACHE_TTL) {
    return projectsCache;
  }
  
  // Fetch fresh data
  projectsCache = getMDXData(path.join(process.cwd(), "app", "portfolio", "projects"));
  lastFetchTime = now;
  
  return projectsCache;
}
```

For Next.js app router, use React Server Components more effectively:

```typescript
// Centralized data fetching for projects
import { cache } from 'react';

export const getProjects = cache(() => {
  return getMDXData(path.join(process.cwd(), "app", "portfolio", "projects"));
});
```

### Benefits
- Eliminates redundant file reads
- Reduces server load
- Improves page load times

## Image Optimization

### Issue
The current image implementation in mdx.tsx uses fixed dimensions and lacks proper optimization:

```typescript
return (
  <Image
    src={src}
    alt={alt || ""}
    width={800}
    height={400}
    className="rounded-lg"
  />
);
```

### Recommendation
Implement responsive images with proper sizing and loading strategies:

```typescript
return (
  <Image
    src={src}
    alt={alt || ""}
    width={800}
    height={400}
    sizes="(max-width: 768px) 100vw, 800px"
    priority={priority} // Pass this for above-the-fold images
    placeholder="blur"
    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJc8ZbIjwAAAABJRU5ErkJggg=="
    className="rounded-lg"
  />
);
```

Add proper image configuration in next.config.js as described in the configuration document.

### Benefits
- Faster image loading
- Reduced layout shift
- Better responsive behavior
- Optimized for different devices

## React Component Optimization

### Issue
Components re-render unnecessarily, and expensive calculations run on every render:

```typescript
// In Projects.tsx
let allProjects = getProjects();

return (
  <div>
    {allProjects
      .sort((a, b) => {
        if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
          return -1;
        }
        return 1;
      })
      .map((project) => (
        // Component rendering
      ))}
  </div>
);
```

### Recommendation
Apply memoization and move expensive operations outside render:

```typescript
// Optimized Projects component
import { useMemo } from 'react';

export function Projects() {
  const allProjects = getProjects();
  
  // Memoize sorted projects
  const sortedProjects = useMemo(() => {
    return [...allProjects].sort((a, b) => {
      return new Date(b.metadata.publishedAt).getTime() - 
             new Date(a.metadata.publishedAt).getTime();
    });
  }, [allProjects]);
  
  return (
    <div>
      {sortedProjects.map((project) => (
        // Component rendering
      ))}
    </div>
  );
}
```

### Benefits
- Reduced render time
- Fewer unnecessary calculations
- Better overall responsiveness

## Bundle Size Optimization

### Issue
The site includes full packages and doesn't leverage code splitting:

```typescript
import ReactMarkdown from "react-markdown";
import { highlight } from "sugar-high";
```

### Recommendation
Implement dynamic imports for non-critical components and lazy loading:

```typescript
// Lazy load components
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-40 rounded-lg" />,
});

// Import only what's needed from libraries
import { highlight } from "sugar-high/dist/light"; // If available as separate export
```

Also, add next-bundle-analyzer to identify heavy packages:

```javascript
// In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // other config options
});
```

### Benefits
- Smaller initial page load
- Faster time-to-interactive
- Better user experience

## Frontmatter Parsing Optimization

### Issue
The current frontmatter parsing is manual and inefficient:

```typescript
function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, "").trim();
  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    metadata[key.trim() as keyof Metadata] = value;
  });

  return { metadata: metadata as Metadata, content };
}
```

### Recommendation
Use the established `gray-matter` library for better performance and reliability:

```typescript
import matter from 'gray-matter';

function parseFrontmatter(fileContent: string) {
  const { data, content } = matter(fileContent);
  return { 
    metadata: data as Metadata, 
    content 
  };
}
```

### Benefits
- More reliable parsing
- Better handling of edge cases
- Improved performance
- Reduced code maintenance

## Date Formatting Optimization

### Issue
Date calculations are performed repeatedly during rendering:

```typescript
export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  // Date calculations...
}
```

### Recommendation
Implement date caching and optimize calculations:

```typescript
// Using a date formatting library like date-fns
import { format, formatDistance } from 'date-fns';

// Cache for formatted dates
const dateCache = new Map<string, { full: string, relative: string }>();

export function formatDate(dateString: string, includeRelative = false): string {
  // Check cache first
  const cacheKey = `${dateString}-${includeRelative}`;
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)![includeRelative ? 'full+relative' : 'full'];
  }
  
  // Ensure consistent date format
  const date = dateString.includes("T") 
    ? new Date(dateString) 
    : new Date(`${dateString}T00:00:00`);
  
  // Format date
  const fullDate = format(date, 'MMMM d, yyyy');
  const relativeDate = formatDistance(date, new Date(), { addSuffix: true });
  
  // Cache result
  dateCache.set(cacheKey, {
    'full': fullDate,
    'full+relative': `${fullDate} (${relativeDate})`
  });
  
  return includeRelative ? `${fullDate} (${relativeDate})` : fullDate;
}
```

### Benefits
- Reduced redundant calculations
- Consistent date formatting
- Better performance during rendering