import { BlogDetailPage } from "@/components/blogComponents/blog-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogDetailPage blogId={id} />;
}
