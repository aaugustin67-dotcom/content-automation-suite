import { runPipeline } from "./pipeline";

async function main() {
  const args = process.argv.slice(2);
  let latestCount: number | undefined;
  let postId: string | undefined;
  let aspects: string[] | undefined;
  let dryRun: boolean = false;

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case "ingest":
      // For now, ingest is part of the pipeline, so we'll just run the pipeline
      // with a limit if specified.
      for (let i = 0; i < commandArgs.length; i++) {
        if (commandArgs[i] === "--limit") {
          latestCount = parseInt(commandArgs[++i]);
        }
      }
      await runPipeline({ latestCount });
      break;
    case "build":
    case "render":
    case "all":
      for (let i = 0; i < commandArgs.length; i++) {
        switch (commandArgs[i]) {
          case "--latest":
            latestCount = parseInt(commandArgs[++i]);
            break;
          case "--post":
            postId = commandArgs[++i];
            break;
          case "--aspects":
            aspects = commandArgs[++i].split(",");
            break;
          case "--dry-run":
            dryRun = true;
            break;
          default:
            console.warn(`Unknown argument for ${command}: ${commandArgs[i]}`);
        }
      }
      await runPipeline({
        latestCount,
        postId,
        aspects,
        dryRun: command === "build" ? true : dryRun, // 'build' command implies dry-run
      });
      break;
    default:
      console.error(`Unknown command: ${command}. Available commands: ingest, build, render, all`);
  }
}

main().catch(console.error);


