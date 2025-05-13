import { Projects } from "app/components/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Check out my projects.",
};

export default function PortfolioPage(): JSX.Element {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        My Portfolio
      </h1>
      <Projects />
    </section>
  );
}
