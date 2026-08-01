import AdminShell from "../../../components/admin/AdminShell";
import SettingsEditor from "../../../components/admin/SettingsEditor";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Settings"
      description="Manage website information, contact details, social links, and footer content."
    >
      <SettingsEditor />
    </AdminShell>
  );
}