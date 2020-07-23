import Database, { DatabaseOptions } from './index'
import { isDatabaseOptions } from './types'

require('dotenv').config()

const credentials = JSON.parse(process.env.TEST_CREDS || '')
let db: Database

describe('Auth tests', () => {
  const testConstructor = async (options: DatabaseOptions) => {
    db = new Database(options)
    return db.initializer
  }

  test('Should throw with invalid options', async () => {
    // @ts-expect-error
    await expect(testConstructor()).rejects.toThrow()
    // @ts-expect-error
    await expect(testConstructor({})).rejects.toThrow()
    // @ts-expect-error
    await expect(testConstructor({ sheetID: 5 })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      // @ts-expect-error
      auth: ''
    })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      auth: {
        // @ts-expect-error
        type: 'other'
      }
    })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      auth: {
        // @ts-expect-error
        type: 'other'
      }
    })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      auth: {
        // @ts-expect-error
        type: 'other'
      }
    })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      auth: {
        type: 'apiKey',
        // @ts-expect-error
        key: 123
      }
    })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      auth: {
        type: 'rawAccessToken',
        // @ts-expect-error
        token: 123
      }
    })).rejects.toThrow()
    await expect(testConstructor({
      sheetID: 'abc',
      auth: {
        type: 'serviceAccount',
        // @ts-expect-error
        creds: '123'
      }
    })).rejects.toThrow()
  })

  test('Should not throw with valid options', async () => {
    await expect(testConstructor({
      sheetID: credentials.sheetID,
      auth: {
        type: 'apiKey',
        key: credentials.apiKey
      }
    })).resolves.toBe(undefined)

    // await expect(testConstructor({
    //   sheetID: credentials.sheetID,
    //   auth: {
    //     type: 'rawAccessToken',
    //     token: credentials.accessToken.client_secret
    //   }
    // })).resolves.toBe(undefined)

    await expect(testConstructor({
      sheetID: credentials.sheetID,
      auth: {
        type: 'serviceAccount',
        creds: credentials.serviceAccount
      }
    })).resolves.toBe(undefined)
  }, 10000)
})

describe('Properties tests', () => {
  const getFakeClient = () => new Database({
    sheetID: credentials.sheetID,
    auth: {
      type: 'serviceAccount',
      creds: {
        client_email: 'fake',
        private_key: 'account'
      }
    },
    silent: true
  })

  test('.options should be valid', () => expect(isDatabaseOptions(db.options)).toBe(true))

  test('.initializer should be valid', () => expect(db.initializer instanceof Promise).toBe(true))
  test('.initializer should resolve to undefined', async () => {
    await expect(db.initializer).resolves.toBe(undefined)
  }, 10000)

  // test('.sheetNames should be empty before initialization', () => expect(getFakeClient().sheetNames.length).toBe(0))
  test('.sheetNames should be valid after initialization', async () => {
    await db.initializer
    expect(db.sheetNames instanceof Array
      && db.sheetNames.map(e => typeof e).filter(t => t != 'string').length == 0
      && db.sheetNames.length > 0
    ).toBe(true)
  }, 10000)

  test('.isReady should be false before initialization', () => expect(getFakeClient().isReady).toBe(false))
  test('.isReady should be true after initialization', async () => {
    await db.initializer
    expect(db.isReady).toBe(true)
  }, 10000)
})

