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
function formatCommitSummaries(commits: CommitData[]): string {
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

/**
 * Build the complete LinkedIn post generation prompt with user data
 */
export function buildLinkedInPrompt(promptTemplate: string, commits: CommitData[], options: PostOptions): string {
  const lengthGuidelines = getLengthGuidelines(options.length, "linkedin");
  const toneGuidelines = getToneGuidelines(options.toneType);
  const commitSummaries = formatCommitSummaries(commits);

  return promptTemplate
    .replace("{lengthGuidelines}", lengthGuidelines)
    .replace("{toneGuidelines}", toneGuidelines)
    .replace("{commitSummaries}", commitSummaries)
    .replace("{toneType}", options.toneType || "balanced")
    .replace("{length}", options.length);
}

/**
 * Build the complete Twitter post generation prompt with user data
 */
export function buildTwitterPrompt(promptTemplate: string, commits: CommitData[], options: PostOptions): string {
  const lengthGuidelines = getLengthGuidelines(options.length, "twitter");
  const toneGuidelines = getToneGuidelines(options.toneType);
  const commitSummaries = formatCommitSummaries(commits);

  return promptTemplate
    .replace("{lengthGuidelines}", lengthGuidelines)
    .replace("{toneGuidelines}", toneGuidelines)
    .replace("{commitSummaries}", commitSummaries)
    .replace("{toneType}", options.toneType || "balanced")
    .replace("{length}", options.length);
}
