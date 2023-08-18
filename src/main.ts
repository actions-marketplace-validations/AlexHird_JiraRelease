import * as core from "@actions/core";
import * as github from "@actions/github";

export async function run() {
  try {
    const octokit = github.getOctokit(core.getInput("github-token"));

    // Fetch the latest release
    const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
      owner: github.context.repo.owner,
      // owner: 'martinservera',
      repo: github.context.repo.repo,
      // repo: 'leveransappen-fe'
    });

    if (latestRelease) {
      console.log(`Latest Release: ${latestRelease.tag_name}`);

      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        sha: latestRelease.target_commitish,
      });

      const jiraTickets: string[] = [];

      for (const commit of commits) {
        const match = commit.commit.message.match(/\b(MA-\d+)\b/);

        if (match) {
          jiraTickets.push(match[1]);
          console.log(`Found Jira ticket number: ${match[1]}`);
        }
      }

      console.log("Jira Issues", jiraTickets);
    } else {
      core.warning("No release found.");
    }
  } catch (error) {
    core.setFailed("Something went wrong");
  }
}

run();
