import AppHeader from "@/components/AppHeader";
import CateringSubTabs from "@/components/CateringSubTabs";

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppHeader
        eyebrow="Agent"
        title="Catering"
        meta="Intent signals → quote → reply · 4 actions today"
      />
      <CateringSubTabs />
      {children}
    </div>
  );
}
