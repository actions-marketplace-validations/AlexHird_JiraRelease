### Jira Release Helper

Extract jira ticket number from commit messages and posts formatted body to jira
webhook url

#### Reqires:

- Jira webhook url as input
- Commit messages to contain reference to Jira issue

```yaml
    - name: Run Action
        uses: ./
        with:
            github-token: ${{ secrets.GITHUB_TOKEN }}
            jira-webhook-url: https://automation.atlassian.com/pro/hooks/666
```
