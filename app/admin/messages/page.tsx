import AdminShell from "../../../components/admin/AdminShell";
import MessagesEditor from "../../../components/admin/MessagesEditor";

export default function AdminMessagesPage() {
  return (
    <AdminShell
      title="Contact Messages"
      description="Review, reply to, mark, and delete messages received from your portfolio."
    >
      <MessagesEditor />
    </AdminShell>
  );
}