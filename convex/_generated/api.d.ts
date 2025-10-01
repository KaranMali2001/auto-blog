/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as action_helpers_github from "../action_helpers/github.js";
import type * as config_github from "../config/github.js";
import type * as handlers_github from "../handlers/github.js";
import type * as handlers_webhook_handlers from "../handlers/webhook_handlers.js";
import type * as http from "../http.js";
import type * as schema_user from "../schema/user.js";
import type * as schema_webhook from "../schema/webhook.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "action_helpers/github": typeof action_helpers_github;
  "config/github": typeof config_github;
  "handlers/github": typeof handlers_github;
  "handlers/webhook_handlers": typeof handlers_webhook_handlers;
  http: typeof http;
  "schema/user": typeof schema_user;
  "schema/webhook": typeof schema_webhook;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
