import { applications } from "./analytics.js";

// For organizational clarity we expose a `posts` alias which re-uses the
// existing `applications` table. Functionally the app already stores
// opportunities in `applications` so this file avoids moving data and
// keeps imports consistent for teams expecting a `post.js`.
export const posts = applications;

export default posts;
