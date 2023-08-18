import * as github from '@actions/github';
import * as core from '@actions/core';
import { run } from '../src/main';


describe('get-commit-names', () => {
  it('fetches commit messages for the latest release', async () => {
    // Spy on the console.log function
    const logSpy = jest.spyOn(console, 'log');

    // Mock the Octokit API responses
    const octokit = {
      repos: {
        getLatestRelease: jest.fn().mockResolvedValue({ data: { tag_name: 'v1.0.0', target_commitish: 'main' } }),
        listCommits: jest.fn().mockResolvedValue({ data: [{ commit: { message: 'Commit 1' } }] }),
      },
    };
    (github.getOctokit as jest.Mock).mockReturnValue(octokit);

    // Run the action
    await run();

    // Assertions
    expect(core.warning).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('Latest Release: v1.0.0');
    expect(logSpy).toHaveBeenCalledWith('Commit messages:');
    expect(logSpy).toHaveBeenCalledWith('Commit 1');

    // Restore the original console.log function
    logSpy.mockRestore();
  });

  // Add more test cases for different scenarios as needed
});

