import { Job, Worker } from 'bullmq'
import { Meteor } from 'meteor/meteor'
import { QUEUE_NAME } from '../constants'
import { getOptions } from './../constants'
import { client } from '../elastic-search'
import { Mongo } from 'meteor/mongo'

export let worker: Worker | null = null

export const startWorker = async () => {
  try {
    const options = await getOptions()

    worker = new Worker(
      QUEUE_NAME,
      async function (job: Job) {
        return Meteor.bindEnvironment(async function (job: Job) {
          const { _id, process, connectionName, indexName, data, fields } = job.data

          if (process === 'removed') {
            await client!.delete({
              index: indexName, // Indeks name
              id: _id, // optional: document ID
            })
          }

          if (process === 'added' || process === 'changed') {
            // @ts-ignore
            const body = data || (await Mongo.Collection.get(connectionName).findOneAsync(_id, { fields, readPreference: 'secondaryPreferred' }))

            await client!.index({
              index: indexName, // Indeks adı
              id: _id, // optional: document ID
              body: {
                ...body,
                id: body._id,
                _id: undefined,
              },
            })
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
