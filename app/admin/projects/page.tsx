import AdminShell from "../../../components/admin/AdminShell";
import ProjectsEditor from "../../../components/admin/ProjectsEditor";

export default function AdminProjectsPage() {
  return (
    <AdminShell
      title="Projects"
      description="Add, edit, reorder, feature, hide, and delete portfolio projects."
    >
      <ProjectsEditor />
    </AdminShell>
  );
}