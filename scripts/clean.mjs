import { readdir, rm } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const removableDirectoryNames = new Set([
  "node_modules",
  ".turbo",
  "dist",
  ".next",
  "build",
]);
const ignoredDirectoryNames = new Set([".git", ".npm", ".pnpm-store", ".yarn"]);

const argumentsSet = new Set(process.argv.slice(2));
const dryRun = argumentsSet.delete("--dry-run");
const showHelp = argumentsSet.delete("--help") || argumentsSet.delete("-h");

if (showHelp) {
  console.log(`Usage: node scripts/clean.mjs [options]

Remove node_modules, .turbo, dist, .next, and build directories throughout the repository.

Options:
  --dry-run  List directories without removing them
  -h, --help Show this help message`);
  process.exit(0);
}

if (argumentsSet.size > 0) {
  console.error(
    `Unknown option${argumentsSet.size === 1 ? "" : "s"}: ${[...argumentsSet].join(", ")}`,
  );
  process.exit(1);
}

const directories = await findRemovableDirectories(repositoryRoot);

if (directories.length === 0) {
  console.log("Nothing to clean.");
  process.exit(0);
}

for (const directory of directories) {
  const displayPath = relative(repositoryRoot, directory).split(sep).join("/");

  if (dryRun) {
    console.log(`Would remove ${displayPath}`);
    continue;
  }

  await rm(directory, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 200,
  });
  console.log(`Removed ${displayPath}`);
}

console.log(
  dryRun
    ? `Found ${directories.length} director${directories.length === 1 ? "y" : "ies"} to clean.`
    : `Cleaned ${directories.length} director${directories.length === 1 ? "y" : "ies"}.`,
);

async function findRemovableDirectories(rootDirectory) {
  const pendingDirectories = [rootDirectory];
  const matches = [];

  while (pendingDirectories.length > 0) {
    const currentDirectory = pendingDirectories.pop();
    const entries = await readdir(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      const entryPath = join(currentDirectory, entry.name);

      if (
        removableDirectoryNames.has(entry.name) &&
        (entry.isDirectory() || entry.isSymbolicLink())
      ) {
        matches.push(entryPath);
        continue;
      }

      if (entry.isDirectory()) {
        pendingDirectories.push(entryPath);
      }
    }
  }

  return matches.sort((left, right) => left.localeCompare(right));
}
