import { PageHeader } from "@/components/nav/PageHeader";
import { PathCategoryList } from "@/components/nav/PathCategoryList";

export default function DiplomacyPage() {
  return (
    <div>
      <PageHeader
        title="Diplomacy"
        subtitle="Lebanon's foreign-policy branches, radiating from the central Diplomacy focus. Russia is deliberately the largest branch."
      />
      <PathCategoryList category="diplomacy" />
    </div>
  );
}
