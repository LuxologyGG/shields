/**
 * Fetches ClassicPress plugin data from the ClassicPress Directory API.
 *
 * API endpoint: https://directory.classicpress.net/wp-json/wp/v2/plugins/?byslug={slug}
 * Auth: Not required for public plugins
 * Rate limits: No documented rate limits
 */

import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const pluginSchema = Joi.object({
  meta: Joi.object({
    current_version: Joi.string().required(),
    slug: Joi.string().required(),
  }).required(),
})

const responseSchema = Joi.array().items(pluginSchema).required()

export default class ClassicPressPluginVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'classicpress/plugin/v', pattern: ':slug' }

  static openApi = {
    '/classicpress/plugin/v/{slug}': {
      get: {
        summary: 'ClassicPress Plugin Version',
        description:
          'Returns the current version of a ClassicPress plugin from the ClassicPress Directory.',
        parameters: pathParams({
          name: 'slug',
          example: 'switch-to-classicpress',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'classicpress' }

  static baseApiUrl =
    'https://directory.classicpress.net/wp-json/wp/v2/plugins/'

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ slug }) {
    return this._requestJson({
      schema: responseSchema,
      url: this.constructor.baseApiUrl,
      options: {
        searchParams: { byslug: slug },
      },
    })
  }
  transform(items) {
    if (items.length === 0) {
      throw new NotFound({ prettyMessage: 'plugin not found' })
    }
    return items[0].meta.current_version
  }

  async handle({ slug }) {
    const items = await this.fetch({ slug })
    const version = this.transform(items)
    return this.constructor.render({ version })
  }
}
