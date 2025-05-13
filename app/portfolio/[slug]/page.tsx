import { notFound } from "next/navigation";
import { CustomMarkdown } from "app/components/mdx";
import { formatDate, getProjectBySlug, getProjects, ProjectData } from "app/portfolio/utils";
import { baseUrl } from "app/sitemap";
import { Metadata } from "next";

interface ProjectPageParams {
  params: {
    slug: string;
  };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getProjects();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageParams): Promise<Metadata | undefined> {
  try {
    const { slug } = params;
    const project = getProjectBySlug(slug);
    
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
  } catch (error) {
    console.error(`Error generating metadata for ${params.slug}:`, error);
    return {
      title: "Project",
      description: "View project details"
    };
  }
}

export default function ProjectPage({ params }: ProjectPageParams): JSX.Element {
  try {
    const { slug } = params;
    const project = getProjectBySlug(slug);

    if (!project) {
      notFound();
    }

    return (
      <section>
        <ProjectSchema project={project} />
        <h1 className="title font-semibold text-2xl tracking-tighter">
          {project.metadata.title}
        </h1>
        <div className="flex justify-between items-center mt-2 mb-8 text-sm">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(project.metadata.publishedAt)}
          </p>
        </div>
        <article className="prose">
          <CustomMarkdown content={project.content} />
        </article>
      </section>
    );
  } catch (error) {
    console.error(`Error rendering project page for ${params.slug}:`, error);
    return (
      <section>
        <h1 className="title font-semibold text-2xl tracking-tighter">
          Error Loading Project
        </h1>
        <p className="text-red-500">
          There was an error loading this project. Please try again later.
        </p>
      </section>
    );
  }
}

// Separated schema markup component for better organization
function ProjectSchema({ project }: { project: ProjectData }): JSX.Element {
  try {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: project.metadata.title,
      datePublished: project.metadata.publishedAt,
      dateModified: project.metadata.publishedAt,
      description: project.metadata.summary,
      image: project.metadata.image
        ? `${baseUrl}${project.metadata.image}`
        : `${baseUrl}/og?title=${encodeURIComponent(project.metadata.title)}`,
      url: `${baseUrl}/portfolio/${project.slug}`,
      author: {
        "@type": "Person",
        name: "Daniel Bolivar",
      },
    };

    return (
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />
    );
  } catch (error) {
    console.error("Error rendering project schema:", error);
    return <></>;
  }
}