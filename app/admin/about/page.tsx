import AboutEditor from "../../../components/admin/AboutEditor";
import AdminShell from "../../../components/admin/AdminShell";

export default function AdminAboutPage() {
  return (
    <AdminShell
      title="About Section"
      description="Manage your biography, expertise, skills, and profile image."
    >
      <AboutEditor />
    </AdminShell>
  );
}