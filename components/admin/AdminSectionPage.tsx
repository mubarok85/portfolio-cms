import AdminShell from "./AdminShell";

type AdminSectionPageProps = {
  title: string;
  description: string;
};

export default function AdminSectionPage({
  title,
  description,
}: AdminSectionPageProps) {
  return (
    <AdminShell
      title={title}
      description={description}
    >
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-bold">
          {title} Editor.
        </h2>

        <p className="mt-4 leading-7 text-gray-400">
          This section is ready. The database form will be connected in the
          next step.
        </p>
      </div>
    </AdminShell>
  );
}