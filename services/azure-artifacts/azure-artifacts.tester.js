import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version (live, stable)')
  .get('/dotnet/Rx.NET/RxNet/v/System.Reactive.json')
  .expectBadge({
    label: 'RxNet',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (live, prerelease)')
  .get('/dotnet/Rx.NET/RxNet/vpre/System.Reactive.json')
  .expectBadge({
    label: 'RxNet',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (live, second example)')
  .get('/dotnet/Rx.NET/RxNet/v/System.Interactive.json')
  .expectBadge({
    label: 'RxNet',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (not found)')
  .get('/dotnet/Rx.NET/RxNet/v/not-a-real-package.json')
  .expectBadge({ label: 'RxNet', message: 'package not found' })

t.create('version (mocked response)')
  .get('/dotnet/Rx.NET/RxNet/v/System.Reactive.json')
  .intercept(nock =>
    nock('https://pkgs.dev.azure.com')
      .get('/dotnet/Rx.NET/_packaging/RxNet/nuget/v3/index.json')
      .reply(200, {
        resources: [
          {
            '@id':
              'https://pkgs.dev.azure.com/dotnet/Rx.NET/_packaging/RxNet/nuget/v3/query2/',
            '@type': 'SearchQueryService/3.0.0-beta',
          },
        ],
      })
      .get('/dotnet/Rx.NET/_packaging/RxNet/nuget/v3/query2/')
      .query({ q: 'System.Reactive', prerelease: 'true', semVerLevel: '2' })
      .reply(200, {
        data: [
          {
            id: 'System.Reactive',
            versions: [{ version: '6.0.0' }, { version: '7.1.0-preview.1' }],
          },
        ],
      }),
  )
  .expectBadge({
    label: 'RxNet',
    message: 'v6.0.0',
    color: 'blue',
  })
