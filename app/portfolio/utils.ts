import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

class MDXParseError extends Error {
  constructor(message: string, public readonly filePath?: string) {
    super(message);
    this.name = "MDXParseError";
  }
}

/**
 * Parse frontmatter and content from MDX content
 */
function parseFrontmatter(fileContent: string): { metadata: ProjectMetadata; content: string } {
  try {
    // Use gray-matter for more reliable parsing
    const { data, content } = matter(fileContent);
    
    // Validate required fields
    if (!data.title || !data.publishedAt || !data.summary) {
      throw new Error("Missing required frontmatter fields (title, publishedAt, or summary)");
    }
    
    return { 
      metadata: data as ProjectMetadata, 
      content 
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new MDXParseError(`Failed to parse frontmatter: ${error.message}`);
    }
    throw new MDXParseError("Failed to parse frontmatter: Unknown error");
  }
}

/**
 * Get all MDX files in a directory
 */
function getMDXFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

/**
 * Read and parse an MDX file
 */
function readMDXFile(filePath: string): { metadata: ProjectMetadata; content: string } {
  try {
    const rawContent = fs.readFileSync(filePath, "utf-8");
    return parseFrontmatter(rawContent);
  } catch (error) {
    if (error instanceof MDXParseError) {
      throw new MDXParseError(error.message, filePath);
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to read MDX file ${filePath}: ${error.message}`);
    }
    
    throw new Error(`Failed to read MDX file ${filePath}: Unknown error`);
  }
}

/**
 * Get all MDX data from a directory
 */
function getMDXData(dir: string): ProjectData[] {
  try {
    const mdxFiles = getMDXFiles(dir);
    const validProjects: ProjectData[] = [];
    
    for (const file of mdxFiles) {
      try {
        const filePath = path.join(dir, file);
        const { metadata, content } = readMDXFile(filePath);
        const slug = path.basename(file, path.extname(file));
        
        validProjects.push({
          metadata,
          slug,
          content,
        });
      } catch (error) {
        console.error(`Skipping file ${file}:`, error);
        // Continue processing other files even if one fails
      }
    }
    
    return validProjects;
  } catch (error) {
    console.error(`Error getting MDX data from ${dir}:`, error);
    return []; // Return empty array rather than crashing
  }
}

/**
 * Get all projects
 */
export function getProjects(): ProjectData[] {
  try {
    return getMDXData(path.join(process.cwd(), "app", "portfolio", "projects"));
  } catch (error) {
    console.error("Error getting projects:", error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get a specific project by slug
 */
export function getProjectBySlug(slug: string): ProjectData | null {
  try {
    const projects = getProjects();
    const project = projects.find((p) => p.slug === slug);
    return project || null;
  } catch (error) {
    console.error(`Error getting project with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Format a date string
 */
export function formatDate(date: string, includeRelative = false): string {
  try {
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

    if (!includeRelative) {
      return fullDate;
    }

    return `${fullDate} (${relativeDate})`;
  } catch (error) {
    console.error(`Error formatting date ${date}:`, error);
    return date; // Return original string if formatting fails
  }
}