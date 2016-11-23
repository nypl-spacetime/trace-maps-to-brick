#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const brickDb = require('to-brick')

const ORGANIZATION_ID = 'nypl'
const DATA_DIR = path.join(__dirname, 'data')

const COLLECTIONS = require(path.join(DATA_DIR, 'collections.json'))
const ITEMS = require(path.join(DATA_DIR, 'items.json'))

const TASKS = [
  {
    id: 'trace-maps',
    submissionsNeeded: 1
  }
]

const tasks = TASKS
  .map((task) => ({
    id: task.id
  }))

const collections = COLLECTIONS
  .map((collection) => ({
    organization_id: ORGANIZATION_ID,
    tasks: TASKS,
    id: collection.id,
    url: collection.url,
    data: collection.data
  }))

const items = ITEMS
  .map((item) => ({
    organization_id: ORGANIZATION_ID,
    id: item.id,
    collection_id: item.collectionId,
    data: item.data
  }))

brickDb.addAll(tasks, collections, items, true)

