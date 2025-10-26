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
}
