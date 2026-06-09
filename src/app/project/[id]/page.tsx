import { getProjectByIdAction } from "../../../../actions/project.actions";
import { CanvasToolbar } from "@/components/project/CanvasToolbar";
import { CanvasWorkspace } from "@/components/project/CanvasWorkspace";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getProjectByIdAction(id);

  if (!res.success || !res.data) {
    redirect("/dashboard");
  }

  const project = res.data;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-black">
      <CanvasToolbar project={project} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <CanvasWorkspace projectId={project.id} />
      </main>
    </div>
  );
}
