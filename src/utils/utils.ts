// File exclusion logic
export function shouldExcludeFile(filename: string, file: { additions?: number; deletions?: number }): boolean {
  // 1. Exclude lock files
  const lockFiles = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "Gemfile.lock", "Cargo.lock", "poetry.lock", "composer.lock"];
  if (lockFiles.includes(filename)) return true;

  // 2. Exclude by pattern
  const excludePatterns = [
    /^dist\//, // Build output
    /^build\//, // Build output
    /^\.next\//, // Next.js build
    /^out\//, // Output directory
    /\.min\.js$/, // Minified files
    /\.map$/, // Source maps
    /^node_modules\//, // Should never be committed, but just in case
    /\.env$/, // Environment files
    /\.env\./, // .env.local, .env.production, etc.
  ];

  if (excludePatterns.some((pattern) => pattern.test(filename))) return true;

  // 3. Exclude binary/asset files
  const binaryExtensions = ["png", "jpg", "jpeg", "gif", "svg", "ico", "webp", "woff", "woff2", "ttf", "eot", "otf", "mp4", "webm", "mp3", "wav", "pdf", "zip", "tar", "gz"];
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && binaryExtensions.includes(ext)) return true;

  // 4. Exclude files with too many changes (likely generated or refactored)
  const totalChanges = (file.additions || 0) + (file.deletions || 0);
  if (totalChanges > 500) return true;

  return false;
}
