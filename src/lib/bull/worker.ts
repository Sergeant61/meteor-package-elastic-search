import { Job, Worker } from 'bullmq'
import { Meteor } from 'meteor/meteor'
import { QUEUE_NAME } from '../constants'
import { getOptions } from './../constants'
import { client } from '../elastic-search'
import { Mongo } from 'meteor/mongo'
import { collectionInits } from '../../server'

export let worker: Worker | null = null

export const startWorker = async () => {
  try {
    if (worker) {
      return
    }

    const options = await getOptions()

    worker = new Worker(
      QUEUE_NAME,
      async function (job: Job) {
        return Meteor.bindEnvironment(async function (job: Job) {
          const { _id, _ids, process, connectionName, indexName, data, fields } = job.data

          if (process === 'removed') {
            await client!.delete({
              index: indexName, // Indeks name
              id: _id, // optional: document ID
            })
          }

          if (process === 'added' || process === 'changed') {
            // @ts-ignore
            let document = data || (await Mongo.Collection.get(connectionName).findOneAsync(_id, { fields, readPreference: 'secondaryPreferred' }))

            if (collectionInits[connectionName].beforeIndex) {
              document = await collectionInits[connectionName].beforeIndex(document)
              document._id = _id
            }

            await client!.index({
              index: indexName, // Indeks adı
              id: _id, // optional: document ID
              body: {
                ...document,
                id: document._id,
                _id: undefined,
              },
            })
          }

          if (process === 'bulk-added') {
            let documents = await Mongo.Collection.get(connectionName)
              .find({ _id: { $in: _ids } }, { fields, readPreference: 'secondaryPreferred' })
              .fetchAsync()

            const bulkOps: any[] = []

            for (let document of documents) {
              if (collectionInits[connectionName].beforeIndex) {
                document = await collectionInits[connectionName].beforeIndex(document)
                document._id = _id
              }

              bulkOps.push({ index: { _index: indexName, _id: document._id } })
              bulkOps.push(document)
            }

            await client.bulk({ refresh: true, body: bulkOps })
          }
        })(job)
      },
      { connection: options.bull!.connection, concurrency: options.bull!.concurrency || 1, removeOnComplete: { count: 100 }, removeOnFail: { count: 100 } }
    )
    console.log('BullMq Worker Info:', worker.opts)
  } catch (error) {
    console.error('Error connecting to BullMq Worker:', error)
  }
}
