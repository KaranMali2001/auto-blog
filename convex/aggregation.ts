import { TableAggregate } from "@convex-dev/aggregate";
import { components } from "./_generated/api";
import { DataModel, Doc, Id } from "./_generated/dataModel";

export const aggregateByCommitCount = new TableAggregate<{
  DataModel: DataModel;
  TableName: "commits";
  Namespace: Id<"users">;
  Key: number;
}>(components.userCommitCountAggregate, {
  namespace: (d: Doc<"commits">) => d.userId,
  sortKey: (d: Doc<"commits">) => d._creationTime,
});

export const aggregateByRepoCount = new TableAggregate<{
  DataModel: DataModel;
  TableName: "repos";
  Namespace: Id<"users">;
  Key: number;
}>(components.userRepoCountAggregate, {
  namespace: (d: Doc<"repos">) => d.userId,
  sortKey: (d: Doc<"repos">) => d._creationTime,
});

export const aggregateByCommitSummary = new TableAggregate<{
  DataModel: DataModel;
  TableName: "commits";
  Namespace: Id<"users">;
  Key: number;
}>(components.commitSummaryAggregate, {
  namespace: (d: Doc<"commits">) => d.userId,
  sortKey: (d: Doc<"commits">) => d._creationTime,
  sumValue: (d: Doc<"commits">) => (d.summarizedCommitDiff ? 1 : 0),
});
