import { AggregationsAggregate, QueryDslQueryContainer, SearchResponse } from '@elastic/elasticsearch/lib/api/types'
import { InitOptions, SearchBody } from './src/types/elastic'
import { TransportRequestOptionsWithOutMeta } from '@elastic/elasticsearch'
import { Mongo } from 'meteor/mongo'

interface SearchResult {
  cursor: Mongo.Cursor<Document, Document>
  response: SearchResponse<unknown, Record<string, AggregationsAggregate>>
  pagination: {
    currentPage: number
    pageItems: number
    totalPages: number
    totalCount: number
  }
}

declare module 'meteor/mongo' {
  namespace Mongo {
    interface Collection<T, U = T> {
      initElasticSearch(options?: InitOptions): void
      deleteAllSearchIndex(): Promise<any>
      allDocumentSync(options?: { ms?: number; limit?: number }): Promise<any>
      searchAsync(keyword: string, options?: { currentPage?: number; pageItems?: number }): Promise<SearchResult>
      searchAdvanceAsync(body: SearchBody, options?: TransportRequestOptionsWithOutMeta): Promise<SearchResult>
    }
  }
}

export {}
