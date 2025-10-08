import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { MODEL, genAI } from "../config/gemini";

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
