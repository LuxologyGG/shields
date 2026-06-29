/**
 * Fetches package version data from Azure Artifacts NuGet feeds.
 *
 * API endpoint: https://pkgs.dev.azure.com/{organization}/{project}/_packaging/{feed}/nuget/v3/query2/
 * Auth: Not required for public feeds
 * Rate limits: Azure DevOps limits resource consumption; individual user requests may be
 * delayed when usage exceeds 200 TSTUs within a sliding five-minute window.
 */

import Joi from 'joi'
import { getCachedResource } from '../../core/base-service/resource-cache.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { stripBuildMetadata, selectVersion } from '../nuget/nuget-helpers.js'

const schema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        versions: Joi.array()
          .items(
            Joi.object({
              version: Joi.string().required(),
            }),
          )
          .default([]),
      }),
    )
    .default([]),
}).required()

async function azureSearchServiceUrl(baseUrl) {
  const searchQueryServices = await getCachedResource({
    url: `${baseUrl}/index.json`,
    ttl: 42 * 60 * 1000,
    scraper: json =>
      json.resources.filter(resource =>
        resource['@type'].startsWith('SearchQueryService'),
      ),
  })
  return searchQueryServices[0]['@id']
}

export default class AzureArtifacts extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'azure-artifacts',
    pattern: ':organization/:project/:feed/:variant/:packageName',
  }

  static openApi = {
    '/azure-artifacts/{organization}/{project}/{feed}/{variant}/{packageName}':
      {
        get: {
          summary: 'Azure Artifacts NuGet Version',
          description:
            'Returns the latest stable or prerelease version of a package from a public Azure Artifacts NuGet feed.',
          parameters: pathParams(
            { name: 'organization', example: 'dotnet' },
            { name: 'project', example: 'Rx.NET' },
            { name: 'feed', example: 'RxNet' },
            {
              name: 'variant',
              example: 'v',
              schema: { type: 'variant', enum: ['v', 'vpre'] },
              description:
                'Latest stable version (`v`) or latest version including prereleases (`vpre`).',
            },
            { name: 'packageName', example: 'System.Reactive' },
          ),
        },
      },
  }

  static defaultBadgeData = {
    label: 'azure artifacts',
  }

  static baseApiUrl = 'https://pkgs.dev.azure.com'

  static render({ version, feed }) {
    return renderVersionBadge({ version, defaultLabel: feed })
  }

  buildApiUrl({ organization, project, feed }) {
    return `${this.constructor.baseApiUrl}/${organization}/${project}/_packaging/${feed}/nuget/v3`
  }

  async fetch({ baseUrl, packageName }) {
    return this._requestJson({
      schema,
      url: await azureSearchServiceUrl(baseUrl),
      options: {
        searchParams: {
          q: packageName,
          prerelease: 'true',
          semVerLevel: '2',
        },
      },
    })
  }

  transform({ json, packageName, includePrereleases }) {
    const packageInfo = json.data.find(
      item => item.id.toLowerCase() === packageName.toLowerCase(),
    )
    if (packageInfo && packageInfo.versions.length > 0) {
      const versions = packageInfo.versions
        .map(item => stripBuildMetadata(item.version))
        .reverse()
      return selectVersion(versions, includePrereleases)
    }
    throw new NotFound({ prettyMessage: 'package not found' })
  }

  async handle({ organization, project, feed, variant, packageName }) {
    const includePrereleases = variant === 'vpre'
    const baseUrl = this.buildApiUrl({ organization, project, feed })
    const json = await this.fetch({ baseUrl, packageName })
    const version = this.transform({ json, packageName, includePrereleases })
    return this.constructor.render({ version, feed })
  }
}
