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
  action: "updated" | "deleted";
  installation: GitHubInstallation;
  repository: GitHubRepository;
  commits: GitHubCommit[];
  repositories: GithubRepoForInstallation[];
}
