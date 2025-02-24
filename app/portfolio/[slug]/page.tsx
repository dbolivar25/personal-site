import { notFound } from "next/navigation";
import { CustomMarkdown } from "app/components/mdx";
import { formatDate, getProjects } from "app/portfolio/utils";
import { baseUrl } from "app/sitemap";

export async function generateStaticParams() {
  let posts = getProjects();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  let project = getProjects().find((project) => project.slug === slug);
  if (!project) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = project.metadata;
  let ogImage = image
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

export default async function Portfolio({ params }) {
  const slug = (await params).slug;
  let project = getProjects().find((project) => project.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: project.metadata.title,
            datePublished: project.metadata.publishedAt,
            dateModified: project.metadata.publishedAt,
            description: project.metadata.summary,
            image: project.metadata.image
              ? `${baseUrl}${project.metadata.image}`
              : `/og?title=${encodeURIComponent(project.metadata.title)}`,
            url: `${baseUrl}/portfolio/${project.slug}`,
            author: {
              "@type": "Person",
              name: "My Portfolio",
            },
          }),
        }}
      />
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
}
