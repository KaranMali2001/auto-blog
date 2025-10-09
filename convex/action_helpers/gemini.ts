import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { MODEL, genAI } from "../config/gemini";
import { regenerateSummaryWithUserInput } from "../config/prompts";

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
