import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

export async function run() {
  try {
    const githubToken = core.getInput("github-token", { required: true });
    const jiraUrl = core.getInput("jira-webhook-url", { required: true });

    const octokit = github.getOctokit(githubToken);

    const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    });

    if (!latestRelease) {
      core.setFailed("No release found.");
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

    if (!jiraTickets.length) {
      core.warning(`No Jira issues found in release: ${latestRelease.name}`)
    }

    const postBody = JSON.stringify({
      issues: jiraTickets,
      version: latestRelease.tag_name
    });

    const response = await axios.post(jiraUrl, postBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      core.setFailed(`Failed to post data to API: ${response.statusText}`);
    }

    core.info("Issues sent to Jira:");
    jiraTickets.forEach((ticket) => core.info(ticket))

  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
}

run();
