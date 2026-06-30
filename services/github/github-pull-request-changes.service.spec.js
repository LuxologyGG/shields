import { test, given } from 'sazerac'
import GithubPullRequestChanges from './github-pull-request-changes.service.js'

describe('GithubPullRequestChanges', function () {
  test(GithubPullRequestChanges.render, () => {
    given({ additions: 85, deletions: 54 }).expect({
      label: 'lines',
      message: '+85 −54',
      color: 'blue',
    })
    given({ additions: 0, deletions: 0 }).expect({
      label: 'lines',
      message: '+0 −0',
      color: 'blue',
    })
    given({ additions: 1140, deletions: 514 }).expect({
      label: 'lines',
      message: '+1.1k −514',
      color: 'blue',
    })
  })
})
