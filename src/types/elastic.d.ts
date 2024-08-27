import {
  AggregationsAggregationContainer,
  double,
  Field,
  Fields,
  IndexName,
  integer,
  KnnSearch,
  long,
  MappingRuntimeFields,
  QueryDslFieldAndFormat,
  QueryDslQueryContainer,
  RankContainer,
  RetrieverContainer,
  ScriptField,
  SearchFieldCollapse,
  SearchHighlight,
  SearchPointInTimeReference,
  SearchRescore,
  SearchSourceConfig,
  SearchSuggester,
  SearchTrackHits,
  SlicedScroll,
  Sort,
  SortResults,
} from '@elastic/elasticsearch/lib/api/types'

export interface SearchBody {
  aggregations?: Record<string, AggregationsAggregationContainer>
  /** @alias aggregations */
  aggs?: Record<string, AggregationsAggregationContainer>
  collapse?: SearchFieldCollapse
  explain?: boolean
  ext?: Record<string, any>

  from?: integer
  size?: integer

  currentPage?: integer
  pageItems?: integer

  highlight?: SearchHighlight
  track_total_hits?: SearchTrackHits
  indices_boost?: Record<IndexName, double>[]
  docvalue_fields?: (QueryDslFieldAndFormat | Field)[]
  knn?: KnnSearch | KnnSearch[]
  rank?: RankContainer
  min_score?: double
  post_filter?: QueryDslQueryContainer
  profile?: boolean
  query?: QueryDslQueryContainer
  rescore?: SearchRescore | SearchRescore[]
  retriever?: RetrieverContainer
  script_fields?: Record<string, ScriptField>
  search_after?: SortResults
  slice?: SlicedScroll
  sort?: Sort
  _source?: SearchSourceConfig
  fields?: (QueryDslFieldAndFormat | Field)[]
  suggest?: SearchSuggester
  terminate_after?: long
  timeout?: string
  track_scores?: boolean
  version?: boolean
  seq_no_primary_term?: boolean
  stored_fields?: Fields
  pit?: SearchPointInTimeReference
  runtime_mappings?: MappingRuntimeFields
  stats?: string[]
}

export interface InitOptions {
  fields?: Record<string, 0 | 1>
  runObserve: boolean
  startWorker: boolean
}

export interface Options {
  bull?: {
    connection: {
      host: string
      port: number
    }
    concurrency?: number
  }
  elasticSearch?: {
    node: string
    auth?: {
      username: string
      password: string
    }
    tls?: {
      ca?: string
      caPath?: string
      rejectUnauthorized: boolean
    }
  }
}
