import Link from "next/link";

interface NavItem {
  path: string;
}

type NavItems = {
  [key: string]: NavItem;
};

const navItems: NavItems = {
  "daniel bolivar": {
    path: "/",
  },
  home: {
    path: "/",
  },
  portfolio: {
    path: "/portfolio",
  },
};

export function Navbar(): JSX.Element {
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([name, { path }]) => {
              return (
                <Link
                  key={name}
                  href={path}
                  className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
