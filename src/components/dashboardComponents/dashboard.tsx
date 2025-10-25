"use client";

import { useQueryWithStatus } from "@/app/Providers";

import { BlogGenerationModal } from "@/components/blogComponents/blog-generation-modal";
import { FloatingActionBar } from "@/components/floating-action-bar";
import { RepositorySection } from "@/components/repositoryComponents/repository-section";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { BlogGenerationFormData, Commit, Repository } from "@/types/index";
import { useMutation } from "convex/react";
import { Github, Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function DashboardPage({ repos }: { repos: Repository[] }) {
  const [selectedCommits, setSelectedCommits] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Fetch data from Convex
  const { data: commits, isPending: isCommitsPending, error: commitsError } = useQueryWithStatus(api.schema.commit.getCommits);

  // Mutation for generating blog
  const generateBlog = useMutation(api.schema.blog.createBlog);

  // Group commits by repository
  const commitsByRepo = React.useMemo(() => {
    if (!commits || !repos) return new Map<string, Commit[]>();

    const grouped = new Map<string, Commit[]>();
    repos.forEach((repo) => {
      grouped.set(repo._id, []);
    });

    commits.forEach((commit) => {
      const repoCommits = grouped.get(commit.repoId);
      if (repoCommits) {
        repoCommits.push(commit);
      }
    });

    return grouped;
  }, [commits, repos]);

  // Filter commits based on search
  const filteredCommitsByRepo = React.useMemo(() => {
    if (!searchQuery.trim()) return commitsByRepo;

    const filtered = new Map<string, Commit[]>();
    commitsByRepo.forEach((commits, repoId) => {
      const matchingCommits = commits.filter(
        (commit) =>
          commit.commitMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          commit.commitSha.toLowerCase().includes(searchQuery.toLowerCase()) ||
          commit.commitAuthor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingCommits.length > 0) {
        filtered.set(repoId, matchingCommits);
      }
    });
    return filtered;
  }, [commitsByRepo, searchQuery]);

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

  const handleSelectAll = (repoId: string, commitIds: string[]) => {
    setSelectedCommits((prev) => {
      const next = new Set(prev);
      const allSelected = commitIds.every((id) => next.has(id));

      if (allSelected) {
        // Deselect all
        commitIds.forEach((id) => next.delete(id));
      } else {
        // Select all
        commitIds.forEach((id) => next.add(id));
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

      await generateBlog({
        commitIds,
        platform: data.platform,
        title: data.title,
        options: {
          toneType: data.toneType || data.customTone,
          length: data.length,
        },
      });

      toast.success("Blog generation started!");
      handleClearSelection();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error generating blog:", error);
      toast.error("Failed to generate blog. Please try again.");
      throw error;
    }
  };

  // Loading state
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

  // Empty state - no repos connected
  if (!repos || repos.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <EmptyState
          icon={<Github className="h-10 w-10" />}
          title="No repositories connected"
          description="Connect your GitHub account to start analyzing commits and generating blog posts"
          action={{
            label: "Connect GitHub",
            onClick: () => {
              window.location.href = "/settings";
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Select commits to generate blog posts optimized for your audience</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search commits by message, SHA, or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Repository Sections */}
      {filteredCommitsByRepo.size === 0 ? (
        <EmptyState icon={<Search className="h-10 w-10" />} title="No commits found" description={searchQuery ? "Try adjusting your search query" : "No commits available in your repositories"} />
      ) : (
        <div className="space-y-6">
          {Array.from(filteredCommitsByRepo.entries()).map(([repoId, commits]) => {
            const repository = repos.find((r) => r._id === repoId);
            if (!repository) return null;

            return <RepositorySection key={repoId} repository={repository} commits={commits} selectedCommits={selectedCommits} onSelectCommit={handleSelectCommit} onSelectAll={handleSelectAll} />;
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
