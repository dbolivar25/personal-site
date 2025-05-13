# TypeScript Improvements

## Type Definitions for Utility Functions

### Issue
Many utility functions in `utils.ts` lack proper type definitions, leading to potential type errors:

```typescript
// Current implementation
function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}
```

### Recommendation
Add comprehensive type definitions for all functions and their parameters:

```typescript
// Properly typed interfaces
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

// Properly typed functions
function getMDXFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string): { metadata: ProjectMetadata; content: string } {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string): ProjectData[] {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getProjects(): ProjectData[] {
  return getMDXData(path.join(process.cwd(), "app", "portfolio", "projects"));
}
```

### Benefits
- Clear interface definitions
- Better IDE support with autocomplete
- Catches potential errors at compile time
- Self-documenting code

## Eliminate Non-null Assertions

### Issue
The code uses non-null assertions (`!`) which can lead to runtime errors if the assumption is wrong:

```typescript
// Current code with non-null assertion
function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1]; // Non-null assertion
  // ...
}
```

### Recommendation
Replace with proper null checks and error handling:

```typescript
function parseFrontmatter(fileContent: string): { metadata: ProjectMetadata; content: string } {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  
  if (!match || match.length < 2) {
    throw new Error('Invalid MDX file: Frontmatter not found or malformed');
  }
  
  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<ProjectMetadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    
    if (key && value) {
      metadata[key.trim() as keyof ProjectMetadata] = value;
    }
  });

  // Validate required metadata fields
  if (!metadata.title || !metadata.publishedAt || !metadata.summary) {
    throw new Error('Invalid MDX frontmatter: Missing required fields');
  }

  return { 
    metadata: metadata as ProjectMetadata, 
    content 
  };
}
```

### Benefits
- Safer code with proper error handling
- Explicit validation of required fields
- No unexpected null reference exceptions

## Type-Safe Component Props

### Issue
Many components use untyped props, which can lead to errors:

```typescript
// Current implementation
export function CustomMarkdown({ content }: CustomMarkdownProps) {
  const components = {
    // Wrapper div
    div: ({ children }) => (
      <div className="markdown-content prose dark:prose-invert max-w-none">
        {children}
      </div>
    ),
    // Handle headers with anchor links
    h1: ({ children }) => {
      const slug = slugify(String(children));
      return (
        <h1 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h1>
      );
    },
    // ...
  };
}
```

### Recommendation
Add type definitions for all component props:

```typescript
// Props interfaces
interface HeaderComponentProps {
  children: React.ReactNode;
}

interface LinkComponentProps {
  href?: string;
  children: React.ReactNode;
}

interface ImageComponentProps {
  src?: string;
  alt?: string;
}

interface CodeComponentProps {
  className?: string;
  children: React.ReactNode;
}

// Component implementation
export function CustomMarkdown({ content }: { content: string }): JSX.Element {
  const components = {
    div: ({ children }: { children: React.ReactNode }): JSX.Element => (
      <div className="markdown-content prose dark:prose-invert max-w-none">
        {children}
      </div>
    ),
    h1: ({ children }: HeaderComponentProps): JSX.Element => {
      const slug = slugify(String(children));
      return (
        <h1 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h1>
      );
    },
    // Other components with typed props...
  };

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
```

### Benefits
- Clear documentation of expected props
- IDE autocomplete for props
- Catches misuse of components at compile time

## Type-Safe Page Components

### Issue
The dynamic page components lack proper type definitions:

```typescript
// Current implementation
export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  let project = getProjects().find((project) => project.slug === slug);
  if (!project) {
    return;
  }
  // ...
}

export default async function Portfolio({ params }) {
  const slug = (await params).slug;
  let project = getProjects().find((project) => project.slug === slug);
  // ...
}
```

### Recommendation
Add type definitions for page components and their parameters:

```typescript
import { Metadata } from 'next';

interface ProjectPageParams {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProjectPageParams): Promise<Metadata | undefined> {
  const { slug } = params;
  const project = getProjects().find((project) => project.slug === slug);
  
  if (!project) {
    return undefined;
  }
  
  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = project.metadata;
  
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/portfolio/${project.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageParams): Promise<JSX.Element> {
  const { slug } = params;
  const project = getProjects().find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  // Rest of the component...
}
```

### Benefits
- Clear parameter typing
- Proper return type definitions
- Better error catching at compile time
- Self-documenting code

## Enable Strict Type Checking

### Issue
TypeScript's `strict` mode is disabled in the configuration, which allows many potential type issues to go undetected.

### Recommendation
Enable strict mode in `tsconfig.json` and fix any resulting errors:

```json
{
  "compilerOptions": {
    "strict": true,
    // Other options...
  }
}
```

This will enable several checks including:
- `noImplicitAny`
- `noImplicitThis`
- `alwaysStrict`
- `strictBindCallApply`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictPropertyInitialization`

### Benefits
- Catches more potential bugs at compile time
- Forces better coding practices
- Improves maintainability and reduces runtime errors