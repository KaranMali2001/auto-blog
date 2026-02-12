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
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function DashboardPage() {
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    data: commitsData,
    isPending: isCommitsPending,
    error: commitsError,
  } = useQueryWithStatus(api.schema.commit.getCommits, {
    paginationOpts: {
      cursor: cursor,
      numItems: 12,
    },
  });

  // Mutation for generating blog
  const generateBlog = useMutation(api.schema.blog.createBlog);

  // Smooth scroll to top on pagination change
  useEffect(() => {
    if (cursor !== null && !isCommitsPending && commitsData?.page) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // Reset transition after scroll completes
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [cursor, commitsData?.page, isCommitsPending]);

  // Extract commits from paginated response
  const commits = commitsData?.page ?? [];

  // Filter commits based on search
  const filteredCommits = useMemo(() => {
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
    setIsModalOpen(true);
  };

  const handleSubmitBlogGeneration = async (data: BlogGenerationFormData) => {
    try {
      const commitIds = Array.from(selectedCommits) as Id<"commits">[];

      const needsCommits = data.platform !== "medium" || data.mediumSource === "commits";
      if (needsCommits && commitIds.length === 0) {
        toast.error("Please select at least one commit");
        throw new Error("No commits selected");
      }

      const blogId = await generateBlog({
        commitIds,
        platform: data.platform,
        title: data.title,
        options: {
          toneType: data.toneType || data.customTone,
          length: data.length,
        },
        mediumSource: data.mediumSource,
        mediumRepoId: data.mediumRepoId,
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
      setIsTransitioning(true);
      setPreviousCursors([...previousCursors, cursor || ""]);
      setCursor(commitsData.continueCursor);
    }
  };

  const handlePrevious = () => {
    if (previousCursors.length > 0) {
      setIsTransitioning(true);
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
      <div ref={contentRef} className={`transition-opacity duration-200 ease-in-out ${isTransitioning ? "opacity-70" : "opacity-100"}`}>
        {filteredCommits.length === 0 ? (
          <EmptyState icon={<Search className="h-10 w-10" />} title="No commits found" description={searchQuery ? "Try adjusting your search query" : "No commits available in your repositories"} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCommits.map((commit) => {
              return <MasonryView key={commit._id} commit={commit} selected={selectedCommits.has(commit._id)} onSelect={handleSelectCommit} onClick={() => handleCommitClick(commit)} />;
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {(hasNext || hasPrevious) && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious} disabled={!hasPrevious || isCommitsPending || isTransitioning} className="transition-all duration-200 disabled:opacity-50">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasNext || isCommitsPending || isTransitioning} className="transition-all duration-200 disabled:opacity-50">
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
