# Testing Strategy

## Current State

The project currently has no testing infrastructure or tests.

## Recommended Testing Approach

Implementing a comprehensive testing strategy will improve code reliability and maintainability. This document outlines a pragmatic approach to adding tests with minimal overhead.

## 1. Testing Infrastructure

### Setup Jest with React Testing Library

```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/_*.{js,jsx,ts,tsx}',
    '!app/**/layout.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

```typescript
// jest.setup.js
import '@testing-library/jest-dom';
```

### Add Test Scripts

Add the following to package.json:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## 2. Testing Layers

### Unit Tests

Focus on testing individual functions and utilities:

```typescript
// __tests__/lib/utils/date.test.ts
import { formatDate } from '@/app/portfolio/utils';

describe('formatDate', () => {
  // Mock the current date for consistent tests
  const mockDate = new Date('2023-01-15');
  const originalDate = global.Date;
  
  beforeAll(() => {
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as typeof global.Date;
  });
  
  afterAll(() => {
    global.Date = originalDate;
  });

  it('formats date correctly without relative time', () => {
    expect(formatDate('2023-01-01')).toBe('January 1, 2023');
  });

  it('formats date correctly with relative time', () => {
    expect(formatDate('2023-01-01', true)).toBe('January 1, 2023 (14d ago)');
  });
  
  it('handles dates without time component', () => {
    expect(formatDate('2023-01-01')).toBe('January 1, 2023');
  });
  
  it('handles dates with time component', () => {
    expect(formatDate('2023-01-01T12:00:00')).toBe('January 1, 2023');
  });
});
```

### Component Tests

Test React components in isolation:

```typescript
// __tests__/app/components/projects.test.tsx
import { render, screen } from '@testing-library/react';
import { Projects } from '@/app/components/projects';
import * as utils from '@/app/portfolio/utils';

// Mock the getProjects function
jest.mock('@/app/portfolio/utils', () => ({
  ...jest.requireActual('@/app/portfolio/utils'),
  getProjects: jest.fn(),
  formatDate: jest.fn(date => date),
}));

describe('Projects component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders projects sorted by date', () => {
    // Mock implementation
    (utils.getProjects as jest.Mock).mockReturnValue([
      {
        slug: 'older-project',
        metadata: {
          title: 'Older Project',
          publishedAt: '2022-01-01',
          summary: 'This is an older project',
        },
      },
      {
        slug: 'newer-project',
        metadata: {
          title: 'Newer Project',
          publishedAt: '2023-01-01',
          summary: 'This is a newer project',
        },
      },
    ]);
    
    render(<Projects />);
    
    const projectElements = screen.getAllByRole('link');
    expect(projectElements).toHaveLength(2);
    
    // Check if newer project appears first
    expect(projectElements[0]).toHaveTextContent('Newer Project');
    expect(projectElements[1]).toHaveTextContent('Older Project');
  });
  
  it('renders empty state when no projects', () => {
    (utils.getProjects as jest.Mock).mockReturnValue([]);
    
    render(<Projects />);
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
```

### Integration Tests

Test multiple components working together:

```typescript
// __tests__/app/portfolio/page.test.tsx
import { render, screen } from '@testing-library/react';
import PortfolioPage from '@/app/portfolio/page';
import * as utils from '@/app/portfolio/utils';

// Mock the Projects component and utils
jest.mock('@/app/components/projects', () => ({
  Projects: () => <div data-testid="projects-component">Projects Mock</div>,
}));

jest.mock('@/app/portfolio/utils');

describe('Portfolio page', () => {
  it('renders the page with correct title and Projects component', () => {
    render(<PortfolioPage />);
    
    expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    expect(screen.getByTestId('projects-component')).toBeInTheDocument();
  });
});
```

### End-to-End Tests with Playwright

For critical user flows:

```typescript
// e2e/basic-navigation.spec.ts
import { test, expect } from '@playwright/test';

test('basic navigation', async ({ page }) => {
  // Start from the home page
  await page.goto('/');
  
  // The home page should contain an h1 with "Welcome"
  await expect(page.locator('h1')).toContainText('Welcome');
  
  // Navigate to Portfolio
  await page.click('text=portfolio');
  
  // The portfolio page should contain "My Portfolio"
  await expect(page.locator('h1')).toContainText('My Portfolio');
  
  // Verify projects are displayed
  await expect(page.locator('a[href^="/portfolio/"]')).toHaveCount.greaterThan(0);
  
  // Click on the first project
  await page.click('a[href^="/portfolio/"]:first-child');
  
  // Verify project page loads with content
  await expect(page.locator('article.prose')).toBeVisible();
});
```

## 3. Test Coverage Targets

Aim for the following coverage targets:

| Type      | Target Coverage |
|-----------|----------------|
| Utils     | 90%+           |
| Components| 80%+           |
| Pages     | 70%+           |
| E2E flows | Key user journeys |

## 4. Testing MDX Content

Use snapshot testing for MDX components:

```typescript
// __tests__/app/components/mdx.test.tsx
import { render } from '@testing-library/react';
import { CustomMarkdown } from '@/app/components/mdx';

describe('CustomMarkdown component', () => {
  it('renders markdown content correctly', () => {
    const { container } = render(
      <CustomMarkdown content="# Test Heading\n\nTest paragraph" />
    );
    
    expect(container).toMatchSnapshot();
  });
  
  it('renders code blocks with syntax highlighting', () => {
    const { container } = render(
      <CustomMarkdown content="```javascript\nconst test = 'hello';\n```" />
    );
    
    expect(container).toMatchSnapshot();
  });
});
```

## 5. Mock Strategies

### File System Mocks

For testing functions that interact with the file system:

```typescript
// __mocks__/fs.js
const fs = jest.createMockFromModule('fs');

// Mock file system data
let mockFiles = {};

// Helper to set up mock file structure
function __setMockFiles(newMockFiles) {
  mockFiles = { ...newMockFiles };
}

// Mock implementation of readFileSync
function readFileSync(filePath, options) {
  if (mockFiles[filePath]) {
    return mockFiles[filePath];
  }
  throw new Error(`File not found: ${filePath}`);
}

// Mock implementation of readdirSync
function readdirSync(directoryPath) {
  const directoryFiles = Object.keys(mockFiles)
    .filter(filePath => filePath.startsWith(directoryPath))
    .map(filePath => filePath.replace(`${directoryPath}/`, ''));
  
  return directoryFiles;
}

fs.__setMockFiles = __setMockFiles;
fs.readFileSync = readFileSync;
fs.readdirSync = readdirSync;

module.exports = fs;
```

### Testing MDX Data Functions

```typescript
// __tests__/app/portfolio/utils.test.ts
import { getProjects, parseFrontmatter } from '@/app/portfolio/utils';
import path from 'path';
import fs from 'fs';

// Mock fs module
jest.mock('fs');

describe('MDX utility functions', () => {
  beforeEach(() => {
    // Set up mock file system
    const mockFileSystem = {
      [path.join(process.cwd(), 'app', 'portfolio', 'projects', 'test-project.mdx')]:
        '---\ntitle: Test Project\npublishedAt: 2023-01-01\nsummary: Test summary\n---\n\n# Test Content',
      [path.join(process.cwd(), 'app', 'portfolio', 'projects', 'another-project.mdx')]:
        '---\ntitle: Another Project\npublishedAt: 2023-02-01\nsummary: Another summary\n---\n\n# Another Content',
    };
    
    fs.__setMockFiles(mockFileSystem);
  });
  
  describe('parseFrontmatter', () => {
    it('extracts metadata and content correctly', () => {
      const fileContent = '---\ntitle: Test\npublishedAt: 2023-01-01\nsummary: Summary\n---\n\nContent';
      const result = parseFrontmatter(fileContent);
      
      expect(result).toEqual({
        metadata: {
          title: 'Test',
          publishedAt: '2023-01-01',
          summary: 'Summary',
        },
        content: 'Content',
      });
    });
  });
  
  describe('getProjects', () => {
    it('returns all projects with correct data', () => {
      const projects = getProjects();
      
      expect(projects).toHaveLength(2);
      expect(projects[0].slug).toBe('test-project');
      expect(projects[0].metadata.title).toBe('Test Project');
      expect(projects[1].slug).toBe('another-project');
      expect(projects[1].metadata.title).toBe('Another Project');
    });
  });
});
```

## 6. Continuous Integration

Set up GitHub Actions for automated testing:

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Run lint
      run: pnpm lint
      
    - name: Run type check
      run: pnpm typecheck
      
    - name: Run unit and integration tests
      run: pnpm test
      
    - name: Run E2E tests
      run: pnpm test:e2e
```

## Implementation Priority

1. Set up testing infrastructure
2. Add tests for utility functions
3. Add component tests for critical components
4. Add integration tests for key pages
5. Add E2E tests for critical user flows