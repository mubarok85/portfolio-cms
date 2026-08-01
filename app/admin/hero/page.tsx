import AdminShell from "../../../components/admin/AdminShell";
import HeroEditor from "../../../components/admin/HeroEditor";

export default function AdminHeroPage() {
  return (
    <AdminShell
      title="Hero Section"
      description="Manage the hero heading, buttons, profile image, resume, statistics, and availability."
    >
      <HeroEditor />
    </AdminShell>
  );
}