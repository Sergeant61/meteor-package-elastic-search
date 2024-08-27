import { Client as ESClient } from '@elastic/elasticsearch'
import { getOptions } from '../constants'

export let client: ESClient | null = null

export async function connectESClient() {
  try {
    if (client) {
      return
    }

    client = new ESClient((await getOptions()).elasticSearch!)
    const response = await client.info()
    console.log('Elasticsearch Info:', response)
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error)
  }
}
