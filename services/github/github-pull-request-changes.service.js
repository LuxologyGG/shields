/**
 * Fetches pull request line change counts from the GitHub REST API.
 *
 * API endpoint: https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}
 * Auth: Uses the Shields.io GitHub token pool (not required for public repositories)
 * Rate limits: "The primary rate limit for unauthenticated requests is 60 requests per hour."
 * "All of these requests count towards your personal rate limit of 5,000 requests per hour."
 * (https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
 */

import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { pathParams } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  additions: nonNegativeInteger,
  deletions: nonNegativeInteger,
}).required()

const description = `
Shows the number of lines added and removed in a GitHub pull request.

${documentation}
`

export default class GithubPullRequestChanges extends GithubAuthV3Service {
  static category = 'issue-tracking'

  static route = {
    base: 'github/pulls/changes',
    pattern: ':user/:repo/:number(\\d+)',
  }

  static openApi = {
    '/github/pulls/changes/{user}/{repo}/{number}': {
      get: {
        summary: 'GitHub pull request line changes',
        description,
        parameters: pathParams(
          {
            name: 'user',
            example: 'badges',
          },
          {
            name: 'repo',
            example: 'shields',
          },
          {
            name: 'number',
            example: '3295',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'lines' }

  static render({ additions, deletions }) {
    return {
      label: 'lines',
      message: `+${metric(additions)} −${metric(deletions)}`,
      color: 'blue',
    }
  }

  async fetch({ user, repo, number }) {
    return this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/pulls/${number}`,
      httpErrors: httpErrorsFor('pull request or repo not found'),
    })
  }

  async handle({ user, repo, number }) {
    const { additions, deletions } = await this.fetch({ user, repo, number })
    return this.constructor.render({ additions, deletions })
  }
}
