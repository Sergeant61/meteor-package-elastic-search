# Meteor Elasticsearch Integration Package

This package provides seamless integration between Meteor.js collections and Elasticsearch, enabling automatic indexing and search functionalities.

## Features

- **Automatic Indexing:** Sync your Meteor collections with Elasticsearch.
- **Real-time Search:** Perform search queries directly on your collections using Elasticsearch's powerful query DSL.
- **Configurable:** Easy to set up with flexible configuration options.

## Installation

```bash
meteor add receptim:elastic-search
```

## Usage

### Initialize Elasticsearch Integration

To set up Elasticsearch for a specific collection, use the `initElasticSearch` function:

```ts
import { MyCollection } from '/imports/api/myCollection'

MyCollection.initElasticSearch({
  excludedFields: ['field1', 'field2'], // Fields to index
  runObserve: true, // Enable real-time indexing (default: true)
  startWorker: true, // Start bullMq worker (default: true)
})
```

### Perform Search

You can search the collection using `searchAsync`:

```ts
const results = await MyCollection.searchAsync('search term', {
  currentPage: 1,
  pageItems: 10,
})
```

Use all the search features of Elasticsearch. For advanced search queries, use `searchAdvanceAsync`.:

```ts
const results = await MyCollection.searchAdvanceAsync({
  query: { match: { field1: 'value' } },
  currentPage: 1,
  pageItems: 10,
})
```

## Sync All Documents

To sync all documents in the collection to Elasticsearch:

```ts
await MyCollection.allDocumentSync({ ms: 1000, limit: 100 })
```

## Delete Index

To delete all documents from the Elasticsearch index:

```ts
await MyCollection.deleteAllSearchIndex()
```
