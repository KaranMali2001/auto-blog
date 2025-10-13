import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { MODEL, genAI } from "../config/gemini";
import { buildLinkedInPrompt, buildTwitterPrompt } from "../config/promptHelpers";
import {
  generateLinkedInPostPrompt,
  generateTwitterPostPrompt,
  regenerateSummaryWithUserInput,
} from "../config/prompts";

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
  },
  handler: async (ctx, args) => {
    const start = Date.now();

    const fullPrompt = args.prompt
      .replace("{commitMessage}", args.commitMessage)
      .replace("{filesChanged}", args.filesChanged.join(", "))
      .replace("{additions}", args.stats.additions.toString())
      .replace("{deletions}", args.stats.deletions.toString())
      .replace("{filteredDiff}", args.fileContent);

    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

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
  handler: async (ctx, args) => {
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
    platform: v.union(v.literal("linkedin"), v.literal("twitter")),
    options: v.optional(
      v.object({
        toneType: v.optional(
          v.union(v.literal("technical"), v.literal("business"), v.literal("hiring manager"), v.string()),
        ),
        length: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const start = Date.now();

    // Prepare the options with defaults
    const options = {
      toneType: args.options?.toneType || "professional",
      length: args.options?.length || "medium",
    };
    const unSummarizedCommits = args.commits.filter((c) => !c.summarizedCommitDiff);
    if (unSummarizedCommits.length > 0) {
      throw new Error("Some commits are not summarized yet");
    }
    let fullPrompt: string;
    if (args.platform === "linkedin") {
      fullPrompt = buildLinkedInPrompt(generateLinkedInPostPrompt, args.commits, options);
    } else {
      fullPrompt = buildTwitterPrompt(generateTwitterPostPrompt, args.commits, options);
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
