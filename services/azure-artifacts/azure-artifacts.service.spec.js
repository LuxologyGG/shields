import { expect } from 'chai'
import { NotFound } from '../index.js'
import AzureArtifacts from './azure-artifacts.service.js'

describe('AzureArtifacts', function () {
  describe('transform', function () {
    it('returns the latest stable version when a package is found', function () {
      expect(
        AzureArtifacts.prototype.transform.call(
          {},
          {
            json: {
              data: [
                {
                  id: 'System.Reactive',
                  versions: [
                    { version: '7.1.0-preview.1' },
                    { version: '6.0.0' },
                  ],
                },
              ],
            },
            packageName: 'System.Reactive',
            includePrereleases: false,
          },
        ),
      ).to.equal('6.0.0')
    })

    it('returns the latest prerelease version when requested', function () {
      expect(
        AzureArtifacts.prototype.transform.call(
          {},
          {
            json: {
              data: [
                {
                  id: 'System.Reactive',
                  versions: [
                    { version: '7.1.0-preview.1' },
                    { version: '6.0.0' },
                  ],
                },
              ],
            },
            packageName: 'System.Reactive',
            includePrereleases: true,
          },
        ),
      ).to.equal('7.1.0-preview.1')
    })

    it('throws NotFound when the package is missing from the response', function () {
      expect(() =>
        AzureArtifacts.prototype.transform.call(
          {},
          {
            json: { data: [] },
            packageName: 'System.Reactive',
            includePrereleases: false,
          },
        ),
      ).to.throw(NotFound, 'package not found')
    })

    it('throws NotFound when the package has no versions', function () {
      expect(() =>
        AzureArtifacts.prototype.transform.call(
          {},
          {
            json: {
              data: [{ id: 'System.Reactive', versions: [] }],
            },
            packageName: 'System.Reactive',
            includePrereleases: false,
          },
        ),
      ).to.throw(NotFound, 'package not found')
    })
  })

  describe('render', function () {
    it('renders a version badge', function () {
      expect(
        AzureArtifacts.render({ version: '6.0.0', feed: 'RxNet' }),
      ).to.deep.equal({
        label: 'RxNet',
        message: 'v6.0.0',
        color: 'blue',
      })
    })
  })
})
