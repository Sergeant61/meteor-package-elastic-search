import { Queue } from 'bullmq'
import { QUEUE_NAME } from '../constants'
import { getOptions } from './../constants'

export let searchQueue: Queue | null = null

export const startQueue = async () => {
  try {
    searchQueue = new Queue(QUEUE_NAME, { connection: (await getOptions()).bull!.connection })
    console.log('BullMq Queue Info:', searchQueue.opts)
  } catch (error) {
    console.error('Error connecting to BullMq Queue:', error)
  }
}
