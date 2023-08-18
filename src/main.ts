import * as core from '@actions/core';
import * as github from '@actions/github';

export async function run() {
  core.info("Starting")
  try {
    const octokit = github.getOctokit(core.getInput('github-token'));
    core.info("Valid octokit")

    // Fetch the latest release
    const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
      owner: github.context.repo.owner,
      // owner: 'martinservera',
      repo: github.context.repo.repo,
      // repo: 'leveransappen-fe'
    });

    core.info(latestRelease.url)

    if (latestRelease) {
      console.log(`Latest Release: ${latestRelease.tag_name}`);

      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        sha: latestRelease.target_commitish,
      });

      console.log('Commit messages:');
      for (const commit of commits) {
        console.log(commit.commit.message);
      }
    } else {
      core.warning('No release found.');
    }
  } catch (error) {
    console.log(error)
    core.setFailed("something went wrong");
  }
}

run();

