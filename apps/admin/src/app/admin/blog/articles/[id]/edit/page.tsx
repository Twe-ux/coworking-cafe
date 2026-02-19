"use client";

import { EditArticleClient } from "./EditArticleClient";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  return <EditArticleClient articleId={params.id} />;
}
