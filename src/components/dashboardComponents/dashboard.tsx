"use client";

import { useQueryWithStatus } from "@/app/Providers";
import { BlogGenerationModal } from "@/components/blogComponents/blog-generation-modal";
import { MasonryView } from "@/components/commitComponents/masonry-view";
import { FloatingActionBar } from "@/components/layoutComponents/floating-action-bar";
import { PageHeader } from "@/components/layoutComponents/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { BlogGenerationFormData, Commit } from "@/types/index";
import { useMutation } from "convex/react";
import { ChevronLeft, ChevronRight, Github, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function DashboardPage() {
  const [selectedCommits, setSelectedCommits] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [previousCursors, setPreviousCursors] = React.useState<string[]>([]);
  const router = useRouter();
  const {
    data: commitsData,
    isPending: isCommitsPending,
    error: commitsError,
  } = useQueryWithStatus(api.schema.commit.getCommits, {
    paginationOpts: {
      cursor: cursor,
      numItems: 9,
    },
  });

  // Mutation for generating blog
  const generateBlog = useMutation(api.schema.blog.createBlog);

  // Extract commits from paginated response
  const commits = commitsData?.page ?? [];

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

  const handleNext = () => {
    if (commitsData && !commitsData.isDone && commitsData.continueCursor) {
      setPreviousCursors([...previousCursors, cursor || ""]);
      setCursor(commitsData.continueCursor);
    }
  };

  const handlePrevious = () => {
    if (previousCursors.length > 0) {
      const previousCursor = previousCursors[previousCursors.length - 1];
      setCursor(previousCursor === "" ? null : previousCursor);
      setPreviousCursors(previousCursors.slice(0, -1));
    }
  };

  const hasNext = commitsData && !commitsData.isDone;
  const hasPrevious = previousCursors.length > 0;

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

      {/* Pagination Controls */}
      {(hasNext || hasPrevious) && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious} disabled={!hasPrevious || isCommitsPending}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasNext || isCommitsPending}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Floating Action Bar */}
      <FloatingActionBar selectedCount={selectedCommits.size} onClearSelection={handleClearSelection} onGenerateBlog={handleGenerateBlog} />

      {/* Blog Generation Modal */}
      <BlogGenerationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedCommitCount={selectedCommits.size} onSubmit={handleSubmitBlogGeneration} />
    </div>
  );
}
