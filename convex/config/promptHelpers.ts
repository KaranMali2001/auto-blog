/**
 * Helper functions to build prompts with dynamic data for LinkedIn and Twitter post generation
 */

// Types for commits and options
export interface CommitData {
  commitMessage: string;
  summarizedCommitDiff?: string | undefined;
  commitAuthor: string;
  repoName: string;
  commitDate: string;
}

export interface PostOptions {
  toneType?: "technical" | "business" | "hiring manager" | string;
  length: "short" | "medium" | "long";
}

/**
 * Generate length guidelines based on user's length preference
 */
function getLengthGuidelines(length: "short" | "medium" | "long", platform: "linkedin" | "twitter"): string {
  if (platform === "linkedin") {
    switch (length) {
      case "short":
        return `**SHORT POST (200-400 words / 2-3 paragraphs)**
- Quick, focused story hitting one main point
- Brief context, key technical detail, impact
- 3-4 minute read
- Use when: Single feature or straightforward update`;

      case "medium":
        return `**MEDIUM POST (400-700 words / 3-5 paragraphs)**
- Balanced narrative with context, technical depth, and impact
- Room for challenges, decisions, and results
- 5-7 minute read
- Use when: Multiple related features or significant technical work`;

      case "long":
        return `**LONG POST (700-1200 words / 5-8 paragraphs)**
- Deep dive with full story arc
- Context, technical decisions, challenges, solutions, impact, learnings
- 8-10 minute read
- Use when: Major features, complex refactors, or comprehensive project updates
- Can include subsections with bold headers and bullet points`;
    }
  } else {
    // Twitter
    switch (length) {
      case "short":
        return `**SHORT THREAD (3-4 tweets)**
- Hook tweet + 2-3 supporting tweets
- High-level overview with one key technical detail
- Fast, punchy, easy to consume
- Use when: Quick update or single feature highlight`;

      case "medium":
        return `**MEDIUM THREAD (5-7 tweets)**
- Hook + context + what you built + technical approach + impact
- Balance between brevity and depth
- Each tweet focuses on one clear idea
- Use when: Multiple features or moderate technical depth`;

      case "long":
        return `**LONG THREAD (8-12 tweets)**
- Full narrative arc across multiple tweets
- Hook + context + detailed features + technical deep dive + challenges + impact + takeaway
- Break complex ideas across multiple tweets
- Use when: Major features, significant projects, or teaching moments`;
    }
  }
}

/**
 * Generate tone guidelines based on user's tone preference
 */
function getToneGuidelines(toneType: string | undefined): string {
  switch (toneType) {
    case "technical":
      return `**TECHNICAL TONE**
- Focus on implementation details, architecture, and engineering decisions
- Use specific technical terminology (libraries, patterns, algorithms)
- Explain the "how" in depth
- Audience: Fellow developers, engineers, technical leads
- Include code concepts, performance metrics, technical trade-offs
- Show your engineering thought process`;

    case "business":
      return `**BUSINESS TONE**
- Emphasize user value, business impact, and outcomes
- Connect technical work to business goals and metrics
- Explain the "why" and "what it enables"
- Audience: Product managers, stakeholders, business professionals
- Focus on user experience, efficiency gains, revenue impact, customer satisfaction
- Less technical jargon, more outcome-focused`;

    case "hiring manager":
      return `**HIRING MANAGER TONE**
- Showcase your skills, problem-solving ability, and leadership
- Demonstrate expertise through technical decisions and ownership
- Highlight collaboration, initiative, and impact
- Audience: Recruiters, hiring managers, potential employers
- Show: technical skills, project ownership, communication, results
- Balance technical competence with soft skills and business awareness`;

    default:
      return `**BALANCED TONE**
- Mix technical details with user/business impact
- Accessible to both technical and non-technical readers
- Explain complex concepts clearly without dumbing down
- Audience: Broad professional network (developers, PMs, stakeholders)
- Show both the "how" and "why"
- Professional but conversational`;
  }
}

/**
 * Format commit summaries into a readable format for the prompt
 */
export function formatCommitSummaries(commits: CommitData[]): string {
  return commits
    .map((commit, index) => {
      return `
## Commit ${index + 1}

**Repository**: ${commit.repoName}
**Author**: ${commit.commitAuthor}
**Date**: ${commit.commitDate}
**Commit Message**: ${commit.commitMessage}

**Commit Summary**:
${commit.summarizedCommitDiff}

---
`;
    })
    .join("\n");
}

export interface RepoContext {
  name: string;
  repoUrl: string;
  description?: string;
  language?: string;
  readmePreview?: string;
}

export interface PrSummaryData {
  prNumber: number;
  title: string;
  repoName: string;
  summarizedPrDiff: string;
}

/**
 * Format PR summaries for the prompt
 */
export function formatPrSummaries(prs: PrSummaryData[]): string {
  if (prs.length === 0) return "";
  return prs
    .map((pr) => {
      return `
## Merged PR #${pr.prNumber}: ${pr.title}

**Repository**: ${pr.repoName}

**PR Summary**:
${pr.summarizedPrDiff}

---
`;
    })
    .join("\n");
}

/**
 * Format repo context for the prompt
 */
export function formatRepoContext(repos: RepoContext[]): string {
  if (repos.length === 0) return "No repository context available.";
  return repos
    .map((r) => {
      const parts: string[] = [`Repository: ${r.name} (${r.repoUrl})`];
      if (r.description) parts.push(`Description: ${r.description}`);
      if (r.language) parts.push(`Primary language: ${r.language}`);
      if (r.readmePreview) parts.push(`README (excerpt):\n${r.readmePreview.slice(0, 2000)}`);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}

/**
 * Build the complete LinkedIn post generation prompt with user data
 */
export function buildLinkedInPrompt(
  promptTemplate: string,
  commits: CommitData[],
  options: PostOptions,
  customPromptTemplate?: string,
  repoContext?: RepoContext[],
  prSummaries?: PrSummaryData[],
): string {
  const templateToUse = customPromptTemplate && customPromptTemplate.trim() !== "" ? customPromptTemplate : promptTemplate;
  const lengthGuidelines = getLengthGuidelines(options.length, "linkedin");
  const toneGuidelines = getToneGuidelines(options.toneType);
  const commitSummaries = formatCommitSummaries(commits);
  const prSummariesStr = formatPrSummaries(prSummaries ?? []);
  const repoContextStr = formatRepoContext(repoContext ?? []);

  return templateToUse
    .replace("{lengthGuidelines}", lengthGuidelines)
    .replace("{toneGuidelines}", toneGuidelines)
    .replace("{commitSummaries}", commitSummaries)
    .replace("{prSummaries}", prSummariesStr || "(No merged PRs in this time window)")
    .replace("{repoContext}", repoContextStr)
    .replace("{toneType}", options.toneType || "balanced")
    .replace("{length}", options.length);
}

/**
 * Build the complete Medium article generation prompt
 */
export function buildMediumPrompt(
  promptTemplate: string,
  commits: CommitData[],
  options: PostOptions,
  repoContext: RepoContext[],
  prSummaries: PrSummaryData[],
  mediumSource: "commits" | "repo" | "project",
): string {
  const commitSummaries = formatCommitSummaries(commits);
  const prSummariesStr = formatPrSummaries(prSummaries);
  const repoContextStr = formatRepoContext(repoContext);

  let sourceSpecificInstructions = "";
  if (mediumSource === "commits") {
    sourceSpecificInstructions =
      "Focus on the selected commits — but weave them into ONE flowing narrative. Do not list them as 'Commit 1, Commit 2.' Find the story: what problem was being solved? What was the journey? Build excitement. Technical details support the narrative; they are not the narrative.";
  } else if (mediumSource === "repo") {
    sourceSpecificInstructions =
      "Focus on ONE repository. Write a deep-dive that reads like a story: hook readers with why this project matters, then take them through its purpose, structure, and recent work. Commits and PRs are evidence for your narrative — weave them in naturally. Make it feel like a tour, not a spec sheet.";
  } else {
    sourceSpecificInstructions =
      "Focus on the WHOLE PROJECT (all repositories). Write a high-level overview that flows: how do these pieces fit together? What's the bigger picture? Recent activity across repos should feed one coherent story — not a list of 'Repo A did X, Repo B did Y.'";
  }

  return promptTemplate
    .replace("{mediumSource}", mediumSource)
    .replace("{sourceSpecificInstructions}", sourceSpecificInstructions)
    .replace("{repoContext}", repoContextStr)
    .replace("{commitSummaries}", commitSummaries)
    .replace("{prSummaries}", prSummariesStr || "(No merged PRs)")
    .replace("{toneType}", options.toneType || "balanced")
    .replace("{length}", options.length);
}

/**
 * Build the complete Twitter post generation prompt with user data
 */
export function buildTwitterPrompt(
  promptTemplate: string,
  commits: CommitData[],
  options: PostOptions,
  customPromptTemplate?: string,
  repoContext?: RepoContext[],
  prSummaries?: PrSummaryData[],
): string {
  const templateToUse = customPromptTemplate && customPromptTemplate.trim() !== "" ? customPromptTemplate : promptTemplate;
  const lengthGuidelines = getLengthGuidelines(options.length, "twitter");
  const toneGuidelines = getToneGuidelines(options.toneType);
  const commitSummaries = formatCommitSummaries(commits);
  const prSummariesStr = formatPrSummaries(prSummaries ?? []);
  const repoContextStr = formatRepoContext(repoContext ?? []);

  return templateToUse
    .replace("{lengthGuidelines}", lengthGuidelines)
    .replace("{toneGuidelines}", toneGuidelines)
    .replace("{commitSummaries}", commitSummaries)
    .replace("{prSummaries}", prSummariesStr || "(No merged PRs in this time window)")
    .replace("{repoContext}", repoContextStr)
    .replace("{toneType}", options.toneType || "balanced")
    .replace("{length}", options.length);
}
