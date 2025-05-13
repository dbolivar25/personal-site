import Link from "next/link";
import { memo, useMemo } from "react";
import { formatDate } from "@/app/lib/date";
import { getProjects, sortProjectsByDate, ProjectData } from "@/app/lib/mdx/utils";

// Memoized project item component to avoid unnecessary re-renders
interface ProjectItemProps {
  project: ProjectData;
}

const ProjectItem = memo(({ project }: ProjectItemProps) => {
  const formattedDate = useMemo(() => 
    formatDate(project.metadata.publishedAt, false),
    [project.metadata.publishedAt]
  );

  return (
    <Link
      key={project.slug}
      className="flex flex-col space-y-1 mb-4 hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded-md transition-colors"
      href={`/portfolio/${project.slug}`}
    >
      <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
        <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
          {formattedDate}
        </p>
        <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
          {project.metadata.title}
        </p>
      </div>
    </Link>
  );
});

ProjectItem.displayName = 'ProjectItem';

// Memoized Projects component
export const Projects = memo(() => {
  // Get projects data - this will now be cached
  const allProjects = getProjects();
  
  // Sort projects in a memoized function to avoid recalculation on each render
  const sortedProjects = useMemo(() => 
    sortProjectsByDate(allProjects),
    [allProjects]
  );

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {sortedProjects.map((project) => (
        <ProjectItem key={project.slug} project={project} />
      ))}
      
      {sortedProjects.length === 0 && (
        <p className="text-neutral-600 dark:text-neutral-400 py-4">
          No projects found. Check back later!
        </p>
      )}
    </div>
  );
});

Projects.displayName = 'Projects';