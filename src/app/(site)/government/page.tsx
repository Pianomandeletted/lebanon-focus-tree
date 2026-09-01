import { PageHeader } from "@/components/nav/PageHeader";

export default function GovernmentPage() {
  return (
    <div>
      <PageHeader
        title="Government"
        subtitle="An overview of Lebanon's governing structure within the Roblox Lebanon project."
      />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-16 text-ink-300 md:px-6">
        <p>
          Lebanon operates under a confessional power-sharing system, with the presidency, premiership, and
          parliamentary speakership distributed across the country&apos;s communities. The paths under Government
          Reforms, Constitutional Development, and Elections in the focus tree track how that structure evolves
          over the course of the project.
        </p>
        <p>
          Visit the Focus Tree and explore the &quot;Internal Administration&quot;, &quot;Constitutional
          Development&quot;, and &quot;Government Reforms&quot; branches to see current progress.
        </p>
      </div>
    </div>
  );
}
