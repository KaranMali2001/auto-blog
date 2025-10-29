import { CommitDetailPage } from "@/components/commitComponents/commit-detail";

export default async function CommitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommitDetailPage commitId={id} />;
}
