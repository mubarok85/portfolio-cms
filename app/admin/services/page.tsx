import AdminShell from "../../../components/admin/AdminShell";
import ServicesEditor from "../../../components/admin/ServicesEditor";

export default function AdminServicesPage() {
  return (
    <AdminShell
      title="Services"
      description="Add, edit, reorder, hide, and delete your professional services."
    >
      <ServicesEditor />
    </AdminShell>
  );
}