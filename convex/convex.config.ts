// convex/convex.config.ts
import aggregate from "@convex-dev/aggregate/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(aggregate);
app.use(aggregate, { name: "userCommitCountAggregate" });
app.use(aggregate, { name: "userRepoCountAggregate" });
app.use(aggregate, { name: "commitSummaryAggregate" });
export default app;
