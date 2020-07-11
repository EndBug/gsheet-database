import Database, { DatabaseOptions } from './index'

require('dotenv').config()

const credentials = JSON.parse(process.env.TEST_CREDS || '')
let db: Database

describe('Auth tests', () => {
  const testConstructor = async (options: DatabaseOptions) => {
    db = new Database(options)
    return db._initializer
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

