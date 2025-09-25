import { ProtectedRoute } from "@/components/auth/protected-route";
import { EditorClient } from "@/components/editor/editor-client";

export default function EditorPage({ params }: { params: { pageId: string } }) {

  return (
    <ProtectedRoute>
      <EditorClient pageId={params.pageId} />
    </ProtectedRoute>
  );
}
