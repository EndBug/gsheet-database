import Database, { DatabaseOptions } from './index'
import { isDatabaseOptions, DBValue, parseDBValue, isDBValue } from './types'

require('dotenv').config()

const credentials = JSON.parse(process.env.TEST_CREDS || '')
let db: Database

const testObj = {
  str: 'abc',
  int: 123,
  bool: true,
  obj: {
    foo: 'bar'
  }
}

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

  test('.sheetNames should be empty before initialization', () => expect(getFakeClient().sheetNames.length).toBe(0))
  test('.sheetNames should be valid after initialization', async () => {
    await db.initializer
    expect(db.sheetNames instanceof Array
      && db.sheetNames.every(e => typeof e == 'string')
      && db.sheetNames.length > 0
    ).toBe(true)
  }, 10000)

  test('.isReady should be false before initialization', () => expect(getFakeClient().isReady).toBe(false))
  test('.isReady should be true after initialization', async () => {
    await db.initializer
    expect(db.isReady).toBe(true)
  }, 10000)

  test('.headers should be empty before initialization', () => expect(getFakeClient().headers).toStrictEqual({}))
  test('.headers should be valid after initialization', async () => {
    await db.initializer
    expect(
      typeof db.headers == 'object'
      && Object.values(db.headers).every(
        e => e instanceof Array
          && e.length == 2
          && e.every(s => typeof s == 'string')
      )
    ).toBe(true)
  })
})

describe('Method tests: .get()', () => {
  test('Should throw with invalid arguments', async () => {
    // @ts-expect-error
    await expect(db.get()).rejects.toThrow()
    // @ts-expect-error
    await expect(db.get(0)).rejects.toThrow()
    await expect(db.get('abc')).rejects.toThrow()
    // @ts-expect-error
    await expect(db.get('sheet1', 0)).rejects.toThrow()
  })

  test('Should return undefined when there\'s no matching entry', async () => {
    await expect(db.get('sheet1', 'non-existent')).resolves.toBe(undefined)
  })

  test('Should get and parse existing values', async () => {
    await expect(db.get('sheet1', 'str')).resolves.toBe('abc')
    await expect(db.get('sheet1', 'int')).resolves.toBe(123)
    await expect(db.get('sheet1', 'bool')).resolves.toBe(false)
    await expect(db.get('sheet1', 'obj')).resolves.toStrictEqual(testObj)
    await expect(db.get('sheet1')).resolves.toStrictEqual({
      str: 'abc',
      int: 123,
      bool: false,
      obj: testObj
    })
  })
})

describe('Method tests: .set()', () => {
  test('Should throw with invalid arguments', async () => {
    // @ts-expect-error
    await expect(db.set()).rejects.toThrow()
    // @ts-expect-error
    await expect(db.set(0)).rejects.toThrow()
    // @ts-expect-error
    await expect(db.set('abc')).rejects.toThrow()
    // @ts-expect-error
    await expect(db.set('sheet2')).rejects.toThrow()
    // @ts-expect-error
    await expect(db.set('sheet2', 0)).rejects.toThrow()
    // @ts-expect-error
    await expect(db.set('sheet2', 'any')).rejects.toThrow()
  })

  test('Should correctly set a new entry', async () => {
    await db.set('sheet2', 'str', 'abc')
    await expect(db.get('sheet2', 'str')).resolves.toBe('abc')

    await db.set('sheet2', 'int', 123)
    await expect(db.get('sheet2', 'int')).resolves.toBe(123)

    await db.set('sheet2', 'bool', true)
    await expect(db.get('sheet2', 'bool')).resolves.toBe(true)

    await db.set('sheet2', 'obj', testObj)
    await expect(db.get('sheet2', 'obj')).resolves.toStrictEqual(testObj)
  }, 10000)

  test('Should correctly change an existing entry', async () => {
    await db.set('sheet2', 'str', 'def')
    await expect(db.get('sheet2', 'str')).resolves.toBe('def')

    await db.set('sheet2', 'int', 456)
    await expect(db.get('sheet2', 'int')).resolves.toBe(456)

    await db.set('sheet2', 'bool', false)
    await expect(db.get('sheet2', 'bool')).resolves.toBe(false)

    await db.set('sheet2', 'obj', testObj.obj)
    await expect(db.get('sheet2', 'obj')).resolves.toStrictEqual(testObj.obj)
  }, 10000)

  test('Should correctly return updated entries', async () => {
    const [keyID, valueID] = db.headers['sheet3']

    const runTest = async (key: string, value: DBValue) => {
      const a = await db.set('sheet3', key, value)
      expect(typeof a.a1Range).toBe('string')
      expect(typeof a.delete).toBe('function')
      expect(typeof a.rowIndex).toBe('number')
      expect(typeof a.save).toBe('function')
      expect(a[keyID]).toBe(key)

      if (typeof value == 'object') expect(parseDBValue(a[valueID])).toStrictEqual(value)
      else expect(parseDBValue(a[valueID])).toBe(value)
    }

    await runTest('str', 'abc')
    await runTest('int', 123)
    await runTest('bool', true)
    await runTest('obj', testObj)

    await runTest('str', 'def')
    await runTest('int', 456)
    await runTest('bool', false)
    await runTest('obj', testObj.obj)
  }, 10000)
})

describe('Method tests: .delete()', () => {
  test('Should throw with invalid arguments', async () => {
    // @ts-expect-error
    await expect(db.delete()).rejects.toThrow()
    // @ts-expect-error
    await expect(db.delete(0)).rejects.toThrow()
    // @ts-expect-error
    await expect(db.delete('abc')).rejects.toThrow()
    // @ts-expect-error
    await expect(db.delete('sheet2')).rejects.toThrow()
    // @ts-expect-error
    await expect(db.delete('sheet2', 0)).rejects.toThrow()
  })

  test('Should correctly delete entries', async () => {
    await db.delete('sheet2', 'str')
    await expect(db.get('sheet2', 'str')).resolves.toBe(undefined)

    await db.delete('sheet2', 'int')
    await expect(db.get('sheet2', 'int')).resolves.toBe(undefined)

    await db.delete('sheet2', 'bool')
    await expect(db.get('sheet2', 'bool')).resolves.toBe(undefined)

    await db.delete('sheet2', 'obj')
    await expect(db.get('sheet2', 'obj')).resolves.toBe(undefined)
  }, 10000)

  test('Should correctly return deleted entries', async () => {
    const [keyID, valueID] = db.headers['sheet3']

    const runTest = async (key: string) => {
      const a = await db.delete('sheet3', key)
      if (!a) return

      expect(typeof a.a1Range).toBe('string')
      expect(typeof a.delete).toBe('function')
      expect(typeof a.rowIndex).toBe('number')
      expect(typeof a.save).toBe('function')
      expect(a[keyID]).toBe(key)

      expect(isDBValue(parseDBValue(a[valueID]))).toBe(true)
    }

    await runTest('str')
    await runTest('int')
    await runTest('bool')
    await runTest('obj')
  }, 10000)

  test('Should return undefined when there\'s no matching entry', async () => {
    await expect(db.delete('sheet2', 'non-existent')).resolves.toBe(undefined)
  }, 10000)
})

describe('Mix-up', () => {
  test('The sheet should be empty', async () => {
    await expect(db.get('sheet4', 'first')).resolves.toBe(undefined)
    await expect(db.get('sheet4', 'second')).resolves.toBe(undefined)
    await expect(db.get('sheet4', 'third')).resolves.toBe(undefined)
    await expect(db.get('sheet4', 'fourth')).resolves.toBe(undefined)
  })

  test('Set some new entries', async () => {
    await db.set('sheet4', 'first', 123)
    await expect(db.get('sheet4', 'first')).resolves.toBe(123)

    await db.set('sheet4', 'second', false)
    await expect(db.get('sheet4', 'second')).resolves.toBe(false)
  })

  test('Edit existing and add new', async () => {
    await db.set('sheet4', 'first', 456)
    await expect(db.get('sheet4', 'first')).resolves.toBe(456)

    await db.set('sheet4', 'third', 'abc')
    await expect(db.get('sheet4', 'third')).resolves.toBe('abc')

    await db.set('sheet4', 'second', true)
    await expect(db.get('sheet4', 'second')).resolves.toBe(true)
  })

  test('Delete existing, add new and edit existing', async () => {
    await db.delete('sheet4', 'first')
    await expect(db.get('sheet4', 'first')).resolves.toBe(undefined)

    await db.set('sheet4', 'fourth', { foo: 'bar' })
    await expect(db.get('sheet4', 'fourth')).resolves.toStrictEqual({ foo: 'bar' })

    await db.set('sheet4', 'second', 999)
    await expect(db.get('sheet4', 'second')).resolves.toBe(999)
  })

  test('Delete everything', async () => {
    await db.delete('sheet4', 'first')
    await expect(db.get('sheet4', 'first')).resolves.toBe(undefined)

    await db.delete('sheet4', 'second')
    await expect(db.get('sheet4', 'second')).resolves.toBe(undefined)

    await db.delete('sheet4', 'third')
    await expect(db.get('sheet4', 'third')).resolves.toBe(undefined)

    await db.delete('sheet4', 'fourth')
    await expect(db.get('sheet4', 'fourth')).resolves.toBe(undefined)
  })
})
