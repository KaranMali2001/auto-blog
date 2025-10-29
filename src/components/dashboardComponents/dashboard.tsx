"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { BlogGenerationModal } from "@/components/blogComponents/blog-generation-modal";
import { MasonryView } from "@/components/commitComponents/masonry-view";
import { FloatingActionBar } from "@/components/layoutComponents/floating-action-bar";
import { PageHeader } from "@/components/layoutComponents/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { BlogGenerationFormData, Commit } from "@/types/index";
import { useMutation } from "convex/react";
import { Github, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function DashboardPage() {
  const [selectedCommits, setSelectedCommits] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const router = useRouter();
  const { data: commits, isPending: isCommitsPending, error: commitsError } = useQueryWithStatus(api.schema.commit.getCommits);

  // Mutation for generating blog
  const generateBlog = useMutation(api.schema.blog.createBlog);

  // Filter commits based on search
  const filteredCommits = React.useMemo(() => {
    if (!commits) return [];
    if (!searchQuery.trim()) return commits;

    return commits.filter(
      (commit) =>
        commit.commitMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commit.commitSha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commit.commitAuthor?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [commits, searchQuery]);

  // Get repositories map for lookup

  // Handlers
  const handleSelectCommit = (commitId: string) => {
    setSelectedCommits((prev) => {
      const next = new Set(prev);
      if (next.has(commitId)) {
        next.delete(commitId);
      } else {
        next.add(commitId);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedCommits(new Set());
  };

  const handleGenerateBlog = () => {
    if (selectedCommits.size === 0) {
      toast.error("Please select at least one commit");
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitBlogGeneration = async (data: BlogGenerationFormData) => {
    try {
      const commitIds = Array.from(selectedCommits) as Id<"commits">[];

      const blogId = await generateBlog({
        commitIds,
        platform: data.platform,
        title: data.title,
        options: {
          toneType: data.toneType || data.customTone,
          length: data.length,
        },
      });

      toast.success("Blog generation started!");
      setTimeout(() => {
        router.push(`/blogs/${blogId}`);
      }, 1000);
      handleClearSelection();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error generating blog:", error);
      toast.error("Failed to generate blog. Please try again.");
      throw error;
    }
  };

  const handleCommitClick = (commit: Commit) => {
    router.push(`/commits/${commit._id}`);
  };

  // Only block on commits - repos can load progressively
  if (isCommitsPending) {
    return <Spinner centered title="Loading commits..." />;
  }

  // Error state
  if (commitsError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState
          title="Error Loading Dashboard"
          message={commitsError?.message || "An unexpected error occurred. Please try again."}
          action={{
            label: "Reload Page",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  // No commits available
  if (!commits || commits.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <EmptyState icon={<Github className="h-10 w-10" />} title="No commits found" description="No commits available in your repositories" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <PageHeader title="Dashboard" description="Select commits to generate blog posts optimized for your audience" />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search commits by message, SHA, or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Masonry Grid */}
      {filteredCommits.length === 0 ? (
        <EmptyState icon={<Search className="h-10 w-10" />} title="No commits found" description={searchQuery ? "Try adjusting your search query" : "No commits available in your repositories"} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCommits.map((commit) => {
            return <MasonryView key={commit._id} commit={commit} selected={selectedCommits.has(commit._id)} onSelect={handleSelectCommit} onClick={() => handleCommitClick(commit)} />;
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      <FloatingActionBar selectedCount={selectedCommits.size} onClearSelection={handleClearSelection} onGenerateBlog={handleGenerateBlog} />

      {/* Blog Generation Modal */}
      <BlogGenerationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedCommitCount={selectedCommits.size} onSubmit={handleSubmitBlogGeneration} />
    </div>
  );
}
