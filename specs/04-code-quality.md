# Code Quality Improvements

## Error Handling

### Issue
The codebase lacks proper error handling, particularly in data loading and parsing operations:

```typescript
// Current implementation with minimal error handling
function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1]; // Will crash if match is null
  // ...
}

// Page component with basic error handling
export default async function Portfolio({ params }) {
  const slug = (await params).slug;
  let project = getProjects().find((project) => project.slug === slug);

  if (!project) {
    notFound(); // Only handles missing project
  }
  // No handling for other potential errors
}
```

### Recommendation
Implement comprehensive error handling:

```typescript
// Error boundary component
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Component error:', error, errorInfo);
    // Could also log to an error tracking service
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Robust error handling in utilities
function parseFrontmatter(fileContent: string): { metadata: ProjectMetadata; content: string } {
  try {
    const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
    const match = frontmatterRegex.exec(fileContent);
    
    if (!match || match.length < 2) {
      throw new Error('Invalid MDX file: Frontmatter not found or malformed');
    }
    
    // Rest of the parsing logic...
  } catch (error) {
    console.error(`Error parsing frontmatter: ${error}`);
    // Provide default values or re-throw depending on requirements
    return {
      metadata: {
        title: 'Error loading content',
        publishedAt: new Date().toISOString(),
        summary: 'There was an error loading this content.',
      },
      content: '# Error\n\nUnable to load content. Please try again later.',
    };
  }
}

// Use error boundaries in layout
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={...}>
      <body className="...">
        <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
          <main className="...">
            <Navbar />
            {children}
            <Footer />
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Benefits
- Prevents application crashes
- Provides graceful fallbacks for errors
- Better debugging through error logging
- Improved user experience during errors

## Code Organization and Conventions

### Issue
The codebase lacks consistent organization patterns and naming conventions:

- Inconsistent function naming (camelCase vs PascalCase)
- Mixture of default and named exports
- No clear separation of concerns in some files
- Inconsistent component organization

### Recommendation
Establish clear conventions and refactor the code:

```typescript
// Standard export pattern for components
// components/ui/Button.tsx
import type { ButtonProps } from './types';

export function Button({ children, ...props }: ButtonProps): JSX.Element {
  // Component implementation
}

// Consistent organization by feature
// features/projects/ProjectCard.tsx
import type { ProjectCardProps } from './types';
import { formatDate } from '@/lib/utils/date';

export function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  return (
    // Component implementation
  );
}

// Centralized type definitions
// types/project.ts
export interface ProjectMetadata {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
}

export interface ProjectData {
  metadata: ProjectMetadata;
  slug: string;
  content: string;
}

// Utility functions grouped by domain
// lib/utils/mdx.ts
export function parseFrontmatter(fileContent: string): {...}
export function getMDXFiles(dir: string): string[] {...}

// lib/utils/date.ts
export function formatDate(date: string, includeRelative?: boolean): string {...}
```

Recommended folder structure:

```
app/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── layout/          # Layout components
│       ├── Footer.tsx
│       └── Navbar.tsx
├── features/            # Feature-specific components
│   └── projects/
│       ├── ProjectCard.tsx
│       └── ProjectList.tsx
├── lib/                 # Shared utilities
│   └── utils/
│       ├── date.ts
│       └── mdx.ts
├── types/               # TypeScript type definitions
│   ├── project.ts
│   └── common.ts
```

### Benefits
- Easier code navigation
- Clear separation of concerns
- Improved maintainability
- Consistent patterns for future development

## Testing Strategy

### Issue
The codebase lacks tests, making it difficult to ensure functionality works as expected.

### Recommendation
Implement a comprehensive testing strategy:

```typescript
// Example component test
// __tests__/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Example utility test
// __tests__/lib/utils/date.test.ts
import { formatDate } from '@/lib/utils/date';

describe('formatDate utility', () => {
  it('formats date without relative time', () => {
    const date = '2023-01-01';
    expect(formatDate(date)).toBe('January 1, 2023');
  });

  it('formats date with relative time', () => {
    const date = '2023-01-01';
    // Mock current date to get consistent test results
    jest.useFakeTimers().setSystemTime(new Date('2023-01-15'));
    expect(formatDate(date, true)).toMatch(/January 1, 2023 \(\d+d ago\)/);
    jest.useRealTimers();
  });
});

// Example page test
// __tests__/pages/portfolio.test.tsx
import { render, screen } from '@testing-library/react';
import Portfolio from '@/app/portfolio/page';
import { getProjects } from '@/lib/utils/mdx';

// Mock the getProjects function
jest.mock('@/lib/utils/mdx', () => ({
  getProjects: jest.fn(),
}));

describe('Portfolio page', () => {
  it('renders projects list', () => {
    (getProjects as jest.Mock).mockReturnValue([
      {
        slug: 'test-project',
        metadata: {
          title: 'Test Project',
          publishedAt: '2023-01-01',
          summary: 'A test project',
        },
        content: 'Test content',
      },
    ]);

    render(<Portfolio />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

Test coverage should include:
1. Unit tests for utility functions
2. Component tests for UI elements
3. Integration tests for page components
4. End-to-end tests for critical user flows

### Benefits
- Ensures functionality works as expected
- Prevents regressions when making changes
- Documents expected behavior
- Facilitates refactoring with confidence

## Maintainability Improvements

### Issue
Several aspects of the codebase make long-term maintenance challenging:

- Repetitive code patterns
- Direct string manipulation in templates
- Lack of dependency injection patterns
- Hardcoded values

### Recommendation
Apply maintainability improvements:

```typescript
// Environment configuration
// .env.local (gitignored)
NEXT_PUBLIC_SITE_URL=https://danielbolivar.vercel.app

// env.ts
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

// Constants file for reusable values
// constants/site.ts
export const SITE_CONFIG = {
  title: 'Daniel Bolivar',
  description: 'My personal site and portfolio.',
  author: 'Daniel Bolivar',
  social: {
    github: 'https://github.com/dbolivar25',
    linkedin: 'https://www.linkedin.com/in/daniel-bolivar-3667481ab/',
  },
};

// Dependency injection pattern for services
// services/mdx/index.ts
export interface MDXService {
  getProjects(): ProjectData[];
  getProjectBySlug(slug: string): ProjectData | undefined;
}

export class FilesystemMDXService implements MDXService {
  private projectsPath: string;
  
  constructor(projectsPath?: string) {
    this.projectsPath = projectsPath || path.join(process.cwd(), 'app', 'portfolio', 'projects');
  }
  
  getProjects(): ProjectData[] {
    // Implementation
  }
  
  getProjectBySlug(slug: string): ProjectData | undefined {
    return this.getProjects().find(project => project.slug === slug);
  }
}

// Factory for creating services (useful for testing)
// services/index.ts
import { MDXService, FilesystemMDXService } from './mdx';

let mdxService: MDXService | null = null;

export function getMDXService(): MDXService {
  if (!mdxService) {
    mdxService = new FilesystemMDXService();
  }
  return mdxService;
}

// Usage in components
import { getMDXService } from '@/services';

export function Projects() {
  const mdxService = getMDXService();
  const projects = mdxService.getProjects();
  
  // Component implementation
}
```

### Benefits
- Easier to adapt to changing requirements
- More testable code through dependency injection
- Clear separation of configuration and implementation
- Reduced code duplication

## Documentation

### Issue
The codebase lacks documentation, making it difficult for new developers to understand the system.

### Recommendation
Add comprehensive documentation:

1. **JSDoc comments** for functions and components:

```typescript
/**
 * Formats a date string into a human-readable format
 * 
 * @param date - The date string to format (YYYY-MM-DD)
 * @param includeRelative - Whether to include relative time (e.g., "2 days ago")
 * @returns Formatted date string
 */
export function formatDate(date: string, includeRelative = false): string {
  // Implementation
}

/**
 * Displays a list of projects sorted by publish date
 * 
 * @returns JSX Element with project list
 */
export function Projects(): JSX.Element {
  // Implementation
}
```

2. **README files** for each major directory:

```markdown
# Components

This directory contains reusable UI components for the website.

## Structure

- `ui/`: Basic UI components (buttons, cards, etc.)
- `layout/`: Components used for page layout (navbar, footer, etc.)
- `mdx/`: Components for rendering MDX content

## Usage Guidelines

1. Place components in the appropriate subdirectory based on their purpose
2. Export components using named exports
3. Keep components focused on a single responsibility
4. For complex components, split into smaller components
```

3. **API documentation** for public interfaces:

```typescript
/**
 * @interface ProjectData
 * @description Represents a project in the portfolio
 */
export interface ProjectData {
  /**
   * Project metadata from frontmatter
   */
  metadata: ProjectMetadata;
  
  /**
   * URL-friendly slug derived from filename
   */
  slug: string;
  
  /**
   * Markdown content of the project
   */
  content: string;
}
```

### Benefits
- Faster onboarding for new developers
- Better understanding of code purpose and design
- Self-documenting codebase
- Easier maintenance over time