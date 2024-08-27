import { Meteor } from 'meteor/meteor'
import { client, connectESClient } from './lib/elastic-search'
import { Mongo } from 'meteor/mongo'
import { searchQueue, startQueue } from './lib/bull/queue'
import { TransportRequestOptionsWithOutMeta } from '@elastic/elasticsearch'
import { InitOptions, SearchBody } from './types/elastic'
import './lib/bull/index'
import { startWorker } from './lib/bull/worker'

const startElasticSearch = async (options: { startWorker: boolean } = { startWorker: true }) => {
  await connectESClient()
  await startQueue()
  if (startWorker) {
    await startWorker()
  }
}

export const collectionInits: Record<string, InitOptions> = {}

function sleep(ms: number) {
  return new Promise((resolve) => Meteor.setTimeout(resolve, ms))
}

function beforeInitCheck(connectionName: string) {
  if (!collectionInits[connectionName]) {
    throw new Meteor.Error('error', `Elastic search is not set for ${connectionName} collection. Please call the "initElasticSearch" function first.`)
  }
}

Mongo.Collection.prototype.searchAsync = function () {
  beforeInitCheck(this._name)
}

Mongo.Collection.prototype.deleteAllSearchIndex = function () {
  beforeInitCheck(this._name)
}

Mongo.Collection.prototype.allDocumentSync = function () {
  beforeInitCheck(this._name)
}

Mongo.Collection.prototype.initElasticSearch = async function (options?: InitOptions) {
  await startElasticSearch({ startWorker: options?.runObserve ?? true })

  const collection = this
  const connectionName = collection._name
  const indexName = `index_${collection._name}`
  const fields = options?.excludedFields
  const runObserve = options?.runObserve

  const payload = {
    connectionName,
    indexName,
    fields,
  }

  if (runObserve) {
    try {
      collection.find({}, { fields }).observeChanges({
        added: async (_id: string, data: any) => {
          await searchQueue!.add(`added_${connectionName}_${_id}`, { process: 'added', _id, data, ...payload })
        },
        changed: async (_id: string) => {
          await searchQueue!.add(`changed_${connectionName}_${_id}`, { process: 'changed', _id, ...payload })
        },
        removed: async (_id: string) => {
          await searchQueue!.add(`removed_${connectionName}_${_id}`, { process: 'removed', _id, ...payload })
        },
      })
    } catch (error) {
      throw new Meteor.Error('error', `Error in observeChanges for collection ${connectionName}:`, error)
    }
  }

  Mongo.Collection.prototype.searchAdvanceAsync = async function (body: SearchBody, options?: TransportRequestOptionsWithOutMeta) {
    body.from = ((body.currentPage || 1) - 1) * (body.pageItems || 10)
    body.size = body.pageItems || 10
    body.size = body.size > 100 ? 100 : body.size
    body._source = body._source || ['id']

    body.sort = {}

    delete body.currentPage
    delete body.pageItems

    const response = await client!.search(
      {
        index: indexName,
        body,
      },
      options
    )

    const totalCount: number = (response.hits.total?.valueOf() as { value: number }).value || 0
    const pageItems = body.size
    const totalPages = pageItems === 0 ? 0 : totalCount ? Math.ceil(totalCount / pageItems) : 0
    const currentPage = body.from / body.size + 1

    const ids = response.hits.hits.map((hit) => hit._id)
    const cursor = collection.find({ _id: { $in: ids } })

    return {
      cursor,
      response,
      pagination: {
        currentPage,
        pageItems,
        totalPages,
        totalCount,
      },
    }
  }

  Mongo.Collection.prototype.searchAsync = async function (keyword: string, options?: { currentPage?: number; pageItems?: number }) {
    const searchBody: SearchBody = {
      currentPage: options?.currentPage,
      pageItems: options?.pageItems,
      query: {
        multi_match: {
          query: keyword,
          operator: 'or',
          fuzziness: 'AUTO',
        },
      },
    }

    return Mongo.Collection.prototype.searchAdvanceAsync(searchBody)
  }

  Mongo.Collection.prototype.deleteAllSearchIndex = async function () {
    const response = await client!.indices.delete({
      index: indexName,
    })

    return { response }
  }

  Mongo.Collection.prototype.allDocumentSync = async function (options?: { ms?: number; limit?: number }) {
    const ms = options?.ms || 1000
    const limit = options?.limit || 1000
    let skip = 0

    while (true) {
      const data = await collection.find({}, { fields: { _id: 1 }, size: limit, skip }).fetchAsync()

      if (data.length === 0) {
        break
      }

      await searchQueue!.add(`bulk-added_${connectionName}`, { process: 'bulk-added', _ids: data.map((d: any) => d._id), ...payload })

      skip += limit
      await sleep(ms)
    }
  }

  collectionInits[connectionName] = options || {}
}
