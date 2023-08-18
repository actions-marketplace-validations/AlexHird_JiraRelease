import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

export async function run() {
  try {
    const octokit = github.getOctokit(core.getInput("github-token"));
    const jiraUrl = core.getInput("jira-webhook-url");

    const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    });

    if (!latestRelease) {
      core.warning("No release found.");
    }

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
      }
    }

    const postBody = JSON.stringify({
      issues: jiraTickets,
    });

    const response = await axios.post(jiraUrl, postBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      core.setFailed(`Failed to post data to API: ${response.statusText}`);
    }

    console.log("Jira Issues", jiraTickets);
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
}

run();
