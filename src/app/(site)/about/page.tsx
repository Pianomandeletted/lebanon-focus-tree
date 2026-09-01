import { PageHeader } from "@/components/nav/PageHeader";

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="About" subtitle="What Roblox Lebanon is, and how this site works." />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 text-ink-300 md:px-6">
        <p>
          Roblox Lebanon is a fictional national-strategy project built and run on Roblox. This site is its
          companion interface: a living focus tree that tracks the political, military, diplomatic, and
          development paths available to the nation, styled after the national-focus systems in strategy games
          like Hearts of Iron IV, but with its own visual identity.
        </p>
        <p>
          Every branch, focus, and connection on the tree is stored in a database and managed through an
          administrator panel, so the tree can keep growing without the site being rebuilt.
        </p>
      </div>
    </div>
  );
}
