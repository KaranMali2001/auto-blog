import { v } from "convex/values";
import { ActionCtx, internalAction } from "../_generated/server";
import { MODEL, openai } from "../config/openRouter";

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
  handler: async (ctx: ActionCtx, args) => {
    const start = Date.now();

    const fullPrompt = args.prompt
      .replace("{commitMessage}", args.commitMessage)
      .replace("{filesChanged}", args.filesChanged.join(", "))
      .replace("{additions}", args.stats.additions.toString())
      .replace("{deletions}", args.stats.deletions.toString())
      .replace("{filteredDiff}", args.fileContent);

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
    });

    console.log("Time taken:", Date.now() - start);

    return completion.choices[0].message.content;
  },
});
