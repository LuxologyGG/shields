import { expect } from 'chai'
import { NotFound } from '../index.js'
import ClassicPressPluginVersion from './classicpress-plugin-version.service.js'

describe('ClassicPressPluginVersion', function () {
  describe('transform', function () {
    it('returns the current version when a plugin is found', function () {
      expect(
        ClassicPressPluginVersion.prototype.transform.call({}, [
          {
            meta: {
              current_version: '1.7.0',
              slug: 'switch-to-classicpress',
            },
          },
        ]),
      ).to.equal('1.7.0')
    })

    it('throws NotFound when no plugin matches the slug', function () {
      expect(() =>
        ClassicPressPluginVersion.prototype.transform.call({}, []),
      ).to.throw(NotFound, 'plugin not found')
    })
  })

  describe('render', function () {
    it('renders a version badge', function () {
      expect(
        ClassicPressPluginVersion.render({ version: '1.7.0' }),
      ).to.deep.equal({
        label: undefined,
        message: 'v1.7.0',
        color: 'blue',
      })
    })
  })
})
