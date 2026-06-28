import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('plugin version (live)')
  .get('/switch-to-classicpress.json')
  .expectBadge({
    label: 'classicpress',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('plugin version (live, second example)')
  .get('/fx-shortcodes.json')
  .expectBadge({
    label: 'classicpress',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('plugin version (not found)')
  .get('/not-a-real-plugin-slug.json')
  .expectBadge({
    label: 'classicpress',
    message: 'plugin not found',
  })

t.create('plugin version (mocked response)')
  .get('/switch-to-classicpress.json')
  .intercept(nock =>
    nock('https://directory.classicpress.net')
      .get('/wp-json/wp/v2/plugins/')
      .query({ byslug: 'switch-to-classicpress' })
      .reply(200, [
        {
          meta: {
            current_version: '1.7.0',
            slug: 'switch-to-classicpress',
          },
        },
      ]),
  )
  .expectBadge({
    label: 'classicpress',
    message: 'v1.7.0',
    color: 'blue',
  })
