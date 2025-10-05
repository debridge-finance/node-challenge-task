import app from './app'
import database from './database'
import kafka from './kafka'
import { mockPrice } from './mock-price'

export default () => ({
  app: app(),
  database: database(),
  kafka: kafka(),
  mockPrice: mockPrice()
})