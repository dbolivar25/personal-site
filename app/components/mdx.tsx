import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { highlight } from "sugar-high";
import React from "react";

function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

interface CustomMarkdownProps {
  content: string;
}

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
    h2: ({ children }) => {
      const slug = slugify(String(children));
      return (
        <h2 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const slug = slugify(String(children));
      return (
        <h3 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const slug = slugify(String(children));
      return (
        <h4 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h4>
      );
    },
    h5: ({ children }) => {
      const slug = slugify(String(children));
      return (
        <h5 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h5>
      );
    },
    h6: ({ children }) => {
      const slug = slugify(String(children));
      return (
        <h6 id={slug}>
          <a href={`#${slug}`} className="anchor" />
          {children}
        </h6>
      );
    },
    // Handle links
    a: ({ href, children }) => {
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
    },
    // Handle images
    img: ({ src, alt }) => {
      if (!src) return null;

      // For external images, use a placeholder or default size
      // You might want to adjust these values based on your needs
      return (
        <Image
          src={src}
          alt={alt || ""}
          width={800}
          height={400}
          className="rounded-lg"
        />
      );
    },
    // Handle code blocks with syntax highlighting
    code: ({ className, children }) => {
      const language = className ? className.replace("language-", "") : "";
      const highlightedCode = highlight(String(children));

      return (
        <code
          className={className}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      );
    },
  };

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
