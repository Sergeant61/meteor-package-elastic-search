import { Meteor } from 'meteor/meteor'
import { Options } from '../types/elastic'

export const QUEUE_NAME = 'app-elastic-search'

let appElasticSearchOptions: Options = Object.assign(
  {
    bull: {
      connection: {
        host: 'localhost',
        port: 6379,
      },
      concurrency: 1,
    },
    elasticSearch: {
      node: 'https://localhost:9200',
    },
  },
  Meteor.settings['receptim:elastic-search'] || {}
)

const caPath = appElasticSearchOptions.elasticSearch?.tls?.caPath

export const getOptions = async () => {
  if (caPath) {
    const fs = require('fs')
    const cert = await fs.readFileAsync(process.env.PWD + '/private/' + caPath, 'utf8')
    delete appElasticSearchOptions.elasticSearch!.tls!.caPath
    appElasticSearchOptions.elasticSearch!.tls!.ca = cert
  }

  return appElasticSearchOptions
}
