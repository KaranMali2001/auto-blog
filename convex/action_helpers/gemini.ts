import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { genAI, MODEL } from "../config/gemini";
import { buildLinkedInPrompt, buildMediumPrompt, buildTwitterPrompt, formatCommitSummaries, formatPrSummaries, formatRepoContext } from "../config/promptHelpers";
import { generateLinkedInPostPrompt, generateMediumArticlePrompt, generateTwitterPostPrompt, regenerateBlogPrompt, regenerateSummaryWithUserInput } from "../config/prompts";
export const getSummary = internalAction({
  args: {
    commitMessage: v.string(),
    filesChanged: v.array(v.string()),
    stats: v.object({
      additions: v.number(),
      deletions: v.number(),
    }),
    fileContent: v.string(),
    prompt: v.string(),
    repoContext: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const start = Date.now();

    const fullPrompt = args.prompt
      .replace("{commitMessage}", args.commitMessage)
      .replace("{filesChanged}", args.filesChanged.join(", "))
      .replace("{additions}", args.stats.additions.toString())
      .replace("{deletions}", args.stats.deletions.toString())
      .replace("{filteredDiff}", args.fileContent)
      .replace("{repoContext}", args.repoContext ?? "No repository context available.");

    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log("Prompt tokens used", response.usageMetadata?.promptTokenCount);
    console.log("Completion tokens used", response.usageMetadata?.totalTokenCount);
    console.log("cached tokens used", response.usageMetadata?.cachedContentTokenCount);
    console.log("candidate tokens used", response.usageMetadata?.candidatesTokenCount);
    console.log("Time taken:", Date.now() - start);

    return text;
  },
});
export const regenerateSummary = internalAction({
  args: {
    commitMessage: v.string(),
    filesChanged: v.array(v.string()),
    stats: v.object({
      additions: v.number(),
      deletions: v.number(),
    }),
    fileContent: v.string(),
    previousSummary: v.string(),
    userInput: v.string(),
  },
  handler: async (_ctx, args) => {
    const start = Date.now();
    const fullPrompt = regenerateSummaryWithUserInput
      .replace("{commitMessage}", args.commitMessage)
      .replace("{filesChanged}", args.filesChanged.join(", "))
      .replace("{additions}", args.stats.additions.toString())
      .replace("{deletions}", args.stats.deletions.toString())
      .replace("{filteredDiff}", args.fileContent)
      .replace("{previousSummary}", args.previousSummary)
      .replace("{userInput}", args.userInput);

    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log("Prompt tokens used for regenerate Summary", response.usageMetadata?.promptTokenCount);
    console.log("Completion tokens used for regenerate Summary", response.usageMetadata?.totalTokenCount);
    console.log("cached tokens used for regenerate Summary", response.usageMetadata?.cachedContentTokenCount);
    console.log("candidate tokens used for regenerate Summary", response.usageMetadata?.candidatesTokenCount);
    console.log("Time taken to regenerate Summary:", Date.now() - start);

    return text;
  },
});
export const generateBlog = internalAction({
  args: {
    blogId: v.id("blogs"),
    commits: v.array(
      v.object({
        commitMessage: v.string(),
        summarizedCommitDiff: v.optional(v.string()),
        commitAuthor: v.string(),
        repoName: v.string(),
        commitDate: v.string(),
      }),
    ),
    totalGeneration: v.number(),
    platform: v.union(v.literal("linkedin"), v.literal("twitter"), v.literal("medium")),
    options: v.optional(
      v.object({
        toneType: v.optional(v.union(v.literal("technical"), v.literal("business"), v.literal("hiring manager"), v.string())),
        length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
      }),
    ),
    prSummaries: v.optional(
      v.array(
        v.object({
          prNumber: v.number(),
          title: v.string(),
          repoName: v.string(),
          summarizedPrDiff: v.string(),
        }),
      ),
    ),
    mediumSource: v.optional(v.union(v.literal("commits"), v.literal("repo"), v.literal("project"))),
    mediumRepoId: v.optional(v.id("repos")),
  },
  handler: async (ctx, args) => {
    const start = Date.now();

    // Fetch blog to get userId
    const blog = await ctx.runQuery(internal.schema.blog.getBlogByIdInternal, {
      blogId: args.blogId,
    });
    if (!blog) {
      throw new Error("Blog not found");
    }

    // Fetch user to get custom prompts
    const user = await ctx.runQuery(internal.schema.user.getUserById, {
      userId: blog.userId,
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Prepare the options with defaults
    const options = {
      toneType: args.options?.toneType || "professional",
      length: args.options?.length || "medium",
    };
    let commitsToUse: typeof args.commits = args.commits;
    let prSummariesToUse = args.prSummaries ?? [];
    let repoContext: { name: string; repoUrl: string; description?: string; language?: string; readmePreview?: string }[] = [];

    if (args.platform === "medium" && (args.mediumSource === "repo" || args.mediumSource === "project")) {
      const since = Date.now() - (args.mediumSource === "repo" ? 30 : 14) * 24 * 60 * 60 * 1000;
      const reposByUserId = await ctx.runQuery(internal.schema.repo.getReposByUserId, {
        userId: blog.userId,
      });

      if (args.mediumSource === "repo" && args.mediumRepoId) {
        const repo = await ctx.runQuery(internal.schema.repo.getRepoByIdInternal, { repoId: args.mediumRepoId });
        if (!repo) throw new Error("Repo not found");
        const repoCommits = await ctx.runQuery(internal.schema.commit.getCommitsByRepoIdAndSince, {
          repoId: args.mediumRepoId,
          userId: blog.userId,
          since,
        });
        commitsToUse = repoCommits.map((c) => ({
          commitMessage: c.commitMessage,
          summarizedCommitDiff: c.summarizedCommitDiff,
          commitAuthor: c.commitAuthor || "Unknown Author",
          repoName: c.commitRepositoryUrl,
          commitDate: new Date(c._creationTime).toISOString(),
        }));
        const prs = await ctx.runQuery(internal.schema.pull_request.getPullRequestsByUserIdAndTimeRange, {
          userId: blog.userId,
          repoIds: [args.mediumRepoId],
          since,
        });
        prSummariesToUse = prs.filter((p) => p.summarizedPrDiff).map((p) => ({ prNumber: p.prNumber, title: p.title, repoName: p.repoUrl, summarizedPrDiff: p.summarizedPrDiff ?? "" }));
        repoContext = repo ? [{ name: repo.name, repoUrl: repo.repoUrl, description: repo.repoDescription, language: repo.repoLanguage, readmePreview: repo.readmePreview }] : [];
      } else {
        const repoIds = reposByUserId.map((r) => r._id);
        const projectCommits = await ctx.runQuery(internal.schema.commit.getCommitsByRepoIdsAndSince, {
          repoIds,
          userId: blog.userId,
          since,
        });
        commitsToUse = projectCommits.map((c) => ({
          commitMessage: c.commitMessage,
          summarizedCommitDiff: c.summarizedCommitDiff,
          commitAuthor: c.commitAuthor || "Unknown Author",
          repoName: c.commitRepositoryUrl,
          commitDate: new Date(c._creationTime).toISOString(),
        }));
        const prs = await ctx.runQuery(internal.schema.pull_request.getPullRequestsByUserIdAndTimeRange, {
          userId: blog.userId,
          repoIds,
          since,
        });
        prSummariesToUse = prs.filter((p) => p.summarizedPrDiff).map((p) => ({ prNumber: p.prNumber, title: p.title, repoName: p.repoUrl, summarizedPrDiff: p.summarizedPrDiff ?? "" }));
        repoContext = reposByUserId.map((r) => ({
          name: r.name,
          repoUrl: r.repoUrl,
          description: r.repoDescription,
          language: r.repoLanguage,
          readmePreview: r.readmePreview,
        }));
      }
    } else {
      const unSummarizedCommits = args.commits.filter((c) => !c.summarizedCommitDiff);
      if (unSummarizedCommits.length > 0) {
        throw new Error("Some commits are not summarized yet");
      }
      const repoUrls = [...new Set(args.commits.map((c) => c.repoName))];
      const reposWithContext = await ctx.runQuery(internal.schema.repo.getReposWithContextByUrls, {
        userId: blog.userId,
        repoUrls,
      });
      repoContext = reposWithContext.map((r) => ({
        name: r.name,
        repoUrl: r.repoUrl,
        description: r.repoDescription,
        language: r.repoLanguage,
        readmePreview: r.readmePreview,
      }));
      prSummariesToUse = args.prSummaries ?? [];
    }

    let fullPrompt: string;
    if (args.platform === "linkedin") {
      const customPrompt = user.customLinkedInPrompt && user.customLinkedInPrompt.trim() !== "" ? user.customLinkedInPrompt : undefined;
      fullPrompt = buildLinkedInPrompt(generateLinkedInPostPrompt, args.commits, options, customPrompt, repoContext, args.prSummaries);
    } else if (args.platform === "medium") {
      const source = args.mediumSource ?? "commits";
      fullPrompt = buildMediumPrompt(generateMediumArticlePrompt, commitsToUse, options, repoContext, prSummariesToUse, source);
    } else {
      const customPrompt = user.customTwitterPrompt && user.customTwitterPrompt.trim() !== "" ? user.customTwitterPrompt : undefined;
      fullPrompt = buildTwitterPrompt(generateTwitterPostPrompt, args.commits, options, customPrompt, repoContext, args.prSummaries);
    }

    // Configure Gemini to use JSON mode for structured output
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log("Prompt tokens used for blog generation", response.usageMetadata?.promptTokenCount);
    console.log("Completion tokens used for blog generation", response.usageMetadata?.totalTokenCount);
    console.log("cached tokens used for blog generation", response.usageMetadata?.cachedContentTokenCount);
    console.log("candidate tokens used for blog generation", response.usageMetadata?.candidatesTokenCount);
    console.log(`Time taken to generate ${args.platform} post:`, Date.now() - start);

    // Parse and return the JSON response
    try {
      const parsedResponse = JSON.parse(text);

      // Validate that we have the required fields
      if (!parsedResponse.title || !parsedResponse.content) {
        throw new Error("Response missing required fields: title or content");
      }

      await ctx.runMutation(internal.schema.blog.updateBlogContent, {
        blogId: args.blogId,
        title: parsedResponse.title,
        content: parsedResponse.content,
        totalGeneration: args.totalGeneration + 1,
      });
    } catch (error) {
      console.error("Failed to parse Gemini JSON response:", error);
      console.error("Raw response:", text);
      throw new Error("Failed to generate structured post content");
    }
  },
});

export const regenerateBlog = internalAction({
  args: {
    newBlogId: v.id("blogs"),
    previousBlogId: v.id("blogs"),
    userInput: v.string(),
    regenerateTitle: v.boolean(),
    regenerateContent: v.boolean(),
    commits: v.array(
      v.object({
        commitMessage: v.string(),
        summarizedCommitDiff: v.optional(v.string()),
        commitAuthor: v.string(),
        repoName: v.string(),
        commitDate: v.string(),
      }),
    ),
    prSummaries: v.optional(
      v.array(
        v.object({
          prNumber: v.number(),
          title: v.string(),
          repoName: v.string(),
          summarizedPrDiff: v.string(),
        }),
      ),
    ),
    platform: v.union(v.literal("twitter"), v.literal("linkedin"), v.literal("medium")),
    options: v.optional(
      v.object({
        toneType: v.optional(v.union(v.literal("technical"), v.literal("business"), v.literal("hiring manager"), v.string())),
        length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
      }),
    ),
    mediumSource: v.optional(v.union(v.literal("commits"), v.literal("repo"), v.literal("project"))),
  },
  handler: async (ctx, args) => {
    const previousBlog = await ctx.runQuery(internal.schema.blog.getBlogByIdInternal, {
      blogId: args.previousBlogId,
    });

    if (!previousBlog) {
      throw new Error("Previous blog not found");
    }

    const start = Date.now();

    // Fetch repo context
    const repoUrls = [...new Set(args.commits.map((c) => c.repoName))];
    const reposWithContext = await ctx.runQuery(internal.schema.repo.getReposWithContextByUrls, {
      userId: previousBlog.userId,
      repoUrls,
    });

    const repoContext = reposWithContext.map((r) => ({
      name: r.name,
      repoUrl: r.repoUrl,
      description: r.repoDescription,
      language: r.repoLanguage,
      readmePreview: r.readmePreview,
    }));

    // Build the full prompt
    const options = {
      toneType: args.options?.toneType || previousBlog.options?.toneType || "professional",
      length: args.options?.length || previousBlog.options?.length || "medium",
    };

    const commitSummaries = formatCommitSummaries(args.commits);
    const prSummariesStr = formatPrSummaries(args.prSummaries ?? []);
    const repoContextStr = formatRepoContext(repoContext);

    let regenerateWhat = "";
    if (args.regenerateTitle && args.regenerateContent) {
      regenerateWhat = "Regenerate BOTH the title and content based on the user's feedback.";
    } else if (args.regenerateTitle) {
      regenerateWhat = "Regenerate ONLY the title. Keep the content exactly the same.";
    } else if (args.regenerateContent) {
      regenerateWhat = "Regenerate ONLY the content. Keep the title exactly the same.";
    }

    const fullPrompt = regenerateBlogPrompt
      .replace("{previousTitle}", previousBlog.title)
      .replace("{previousContent}", previousBlog.content)
      .replace("{userInput}", args.userInput)
      .replace("{regenerateWhat}", regenerateWhat)
      .replace("{platform}", args.platform)
      .replace("{repoContext}", repoContextStr)
      .replace("{commitSummaries}", commitSummaries)
      .replace("{prSummaries}", prSummariesStr || "(No merged PRs)")
      .replace("{toneType}", options.toneType)
      .replace("{length}", options.length);

    // Use Gemini to regenerate
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    console.log("Time taken to regenerate blog:", Date.now() - start);

    try {
      const parsedResponse = JSON.parse(text);

      if (!parsedResponse.title || !parsedResponse.content) {
        throw new Error("Response missing required fields: title or content");
      }

      // Update the new blog with regenerated content
      await ctx.runMutation(internal.schema.blog.updateRegeneratedBlogContent, {
        blogId: args.newBlogId,
        title: parsedResponse.title,
        content: parsedResponse.content,
      });
    } catch (error) {
      console.error("Failed to parse Gemini JSON response:", error);
      console.error("Raw response:", text);
      throw new Error("Failed to regenerate blog content");
    }
  },
});
