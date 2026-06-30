import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('github pull request line changes (live)')
  .get('/badges/shields/3295.json')
  .expectBadge({
    label: 'lines',
    message: '+85 −54',
    color: 'blue',
  })

t.create('github pull request line changes (live, second example)')
  .get('/badges/shields/11053.json')
  .expectBadge({
    label: 'lines',
    message: /^\+[\d.,kM]+ −[\d.,kM]+$/,
    color: 'blue',
  })

t.create('github pull request line changes (pull request not found)')
  .get('/badges/shields/5101.json')
  .expectBadge({
    label: 'lines',
    message: 'pull request or repo not found',
  })

t.create('github pull request line changes (mocked response)')
  .get('/badges/shields/1234.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/1234')
      .reply(200, {
        additions: 42,
        deletions: 17,
      }),
  )
  .expectBadge({
    label: 'lines',
    message: '+42 −17',
    color: 'blue',
  })

t.create('github pull request line changes (invalid response, missing field)')
  .get('/badges/shields/1234.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/1234')
      .reply(200, {
        additions: 42,
      }),
  )
  .expectBadge({
    label: 'lines',
    message: 'invalid response data',
  })
