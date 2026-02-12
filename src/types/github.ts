export interface GitHubCommit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
}
export interface GithubRepoForInstallation {
  id: number;
  full_name: string;
}
export interface GitHubRepository {
  name: string;
  owner: {
    login: string;
  };
}

export interface GitHubInstallation {
  id: number;
}

export interface GitHubWebhookPayload {
  action?: "added" | "removed" | "deleted" | "created";
  installation: GitHubInstallation;
  repository?: GitHubRepository;
  commits?: GitHubCommit[];
  repositories_added?: GithubRepoForInstallation[];
  repositories_removed?: GithubRepoForInstallation[];
  after?: string; // commit SHA for push events
  ref?: string; // e.g. refs/heads/main for push events
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: string;
  merged: boolean;
  merged_at: string | null;
  base: { ref: string };
  head: { ref: string };
  html_url: string;
}

export interface GitHubPullRequestPayload {
  action: string;
  number: number;
  pull_request: GitHubPullRequest;
  repository: GitHubRepository & { html_url?: string; full_name?: string };
  installation: GitHubInstallation;
}
