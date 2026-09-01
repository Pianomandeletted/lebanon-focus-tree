import { PageHeader } from "@/components/nav/PageHeader";
import { PathCategoryList } from "@/components/nav/PathCategoryList";

export default function PoliticsPage() {
  return (
    <div>
      <PageHeader
        title="Politics"
        subtitle="Every political faction and party path in Lebanon's national focus tree."
      />
      <PathCategoryList category="faction" />
    </div>
  );
}
