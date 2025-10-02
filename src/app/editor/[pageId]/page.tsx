'use client';

import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EditorClient } from "@/components/editor/editor-client";

export default function EditorPage({ params }: { params: { pageId: string } }) {
  // Use React.use() to resolve the params object in a Client Component
  const resolvedParams = React.use(params);
  const { pageId } = resolvedParams;

  return (
    <ProtectedRoute>
      <EditorClient pageId={pageId} />
    </ProtectedRoute>
  );
}
