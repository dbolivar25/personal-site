import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { highlight } from "sugar-high";
import React, { useMemo, memo } from "react";

/**
 * Convert a string to a URL-friendly slug
 */
function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

interface CustomMarkdownProps {
  content: string;
}

// Create a placeholder blur data URL for images
const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdgJc8ZbIjwAAAABJRU5ErkJggg==";

// Memoized heading components to avoid recreating on every render
const H1 = memo(({ children }: { children: React.ReactNode }) => {
  const slug = slugify(String(children));
  return (
    <h1 id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </h1>
  );
});
H1.displayName = 'H1';

const H2 = memo(({ children }: { children: React.ReactNode }) => {
  const slug = slugify(String(children));
  return (
    <h2 id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </h2>
  );
});
H2.displayName = 'H2';

const H3 = memo(({ children }: { children: React.ReactNode }) => {
  const slug = slugify(String(children));
  return (
    <h3 id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </h3>
  );
});
H3.displayName = 'H3';

const H4 = memo(({ children }: { children: React.ReactNode }) => {
  const slug = slugify(String(children));
  return (
    <h4 id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </h4>
  );
});
H4.displayName = 'H4';

const H5 = memo(({ children }: { children: React.ReactNode }) => {
  const slug = slugify(String(children));
  return (
    <h5 id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </h5>
  );
});
H5.displayName = 'H5';

const H6 = memo(({ children }: { children: React.ReactNode }) => {
  const slug = slugify(String(children));
  return (
    <h6 id={slug}>
      <a href={`#${slug}`} className="anchor" />
      {children}
    </h6>
  );
});
H6.displayName = 'H6';

// Memoized link component
interface LinkProps {
  href?: string;
  children: React.ReactNode;
}

const LinkComponent = memo(({ href, children }: LinkProps) => {
  if (!href) return null;

  if (href.startsWith("/")) {
    return <Link href={href}>{children}</Link>;
  }

  if (href.startsWith("#")) {
    return <a href={href}>{children}</a>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
});
LinkComponent.displayName = 'LinkComponent';

// Memoized image component
interface ImageProps {
  src?: string;
  alt?: string;
}

const ImageComponent = memo(({ src, alt }: ImageProps) => {
  if (!src) return null;

  const isTopImage = src.includes("top-image") || src.includes("header") || src.includes("banner");

  return (
    <Image
      src={src}
      alt={alt || ""}
      width={1200}
      height={630}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 640px, 1200px"
      priority={isTopImage}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className="rounded-lg w-full h-auto"
    />
  );
});
ImageComponent.displayName = 'ImageComponent';

// Memoized code component
interface CodeProps {
  className?: string;
  children: React.ReactNode;
}

const CodeComponent = memo(({ className, children }: CodeProps) => {
  // Using the className but not the language value directly
  const highlightedCode = highlight(String(children));

  return (
    <code
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
});
CodeComponent.displayName = 'CodeComponent';

// Export the memoized CustomMarkdown component
export const CustomMarkdown = memo(({ content }: CustomMarkdownProps) => {
  // Memoize the components object to prevent recreation on every render
  const components = useMemo(() => {
    // Need to type components properly for ReactMarkdown
    // Using a more specific type would be better, but ReactMarkdown component types are complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customComponents: any = {
      div: ({ children }: { children: React.ReactNode }) => (
        <div className="markdown-content prose dark:prose-invert max-w-none">
          {children}
        </div>
      ),
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6,
      a: LinkComponent,
      img: ImageComponent,
      code: CodeComponent,
    };
    
    return customComponents;
  }, []);

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
});
CustomMarkdown.displayName = 'CustomMarkdown';