Package.describe({
  name: 'receptim:elastic-search',
  version: '1.0.1',
  summary: 'Automatic elasticsearch integration for meteor collections.',
  git: 'https://github.com/Sergeant61/meteor-package-elastic-search',
  documentation: 'README.md',
})

Package.onUse(function (api) {
  api.versionsFrom(['3.0'])

  api.use('typescript')
  api.use('fetch')
  api.use('meteor')
  api.use('mongo')
  api.use('dburles:mongo-collection-instances@1.0.0-rc300.1')
  api.use('zodern:types@1.0.13')

  api.mainModule('src/client.ts', 'client')
  api.mainModule('src/server.ts', 'server')
})

Package.onTest(function (api) {
  api.use('receptim:elastic-search')

  api.use('typescript')
  api.use('fetch')
  api.use('meteor')
  api.use('mongo')
  api.use('tinytest')
  api.use('dburles:mongo-collection-instances')
  api.use('zodern:types')

  api.mainModule('tests/index.ts', 'server')
})

Npm.depends({
  '@elastic/elasticsearch': '8.15.0',
  bullmq: '5.12.7',
})
