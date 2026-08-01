import AdminShell from "../../../components/admin/AdminShell";
import ExperienceEditor from "../../../components/admin/ExperienceEditor";

export default function AdminExperiencePage() {
  return (
    <AdminShell
      title="Experience"
      description="Add, edit, reorder, hide, and delete your professional experience."
    >
      <ExperienceEditor />
    </AdminShell>
  );
}