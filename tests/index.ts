import { Tinytest } from 'meteor/tinytest'
import { getOptions } from '../src/lib/constants'
import { Mongo } from 'meteor/mongo'
import { faker } from '@faker-js/faker'

// todo make test
const createTestCollection = (name) => {
  return new Mongo.Collection(name)
}

const Tests = createTestCollection('test')

Tinytest.addAsync('external options test', async (test, onComplete) => {
  const options = await getOptions()

  test.isUndefined(options.elasticSearch?.tls?.caPath, 'caPath path was deleted successfully')
  test.isTrue(typeof options.elasticSearch?.tls?.ca === 'string', 'ca successfully installed')
  onComplete()
})

Tinytest.addAsync('init elastic search', async (test, onComplete) => {
  await Tests.initElasticSearch()

  onComplete()
})

Tinytest.addAsync('elastic search add data', async (test, onComplete) => {
  for (let i = 0; i < 10; i++) {
    await Tests.insertAsync({
      name: faker.person.fullName(),
      gender: faker.person.gender(),
      sex: faker.person.sex(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        country: faker.location.country,
        city: faker.location.city,
        state: faker.location.state,
      },
      updatedAt: Date.now(),
    })
  }

  onComplete()
})
