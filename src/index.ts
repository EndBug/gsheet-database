import { GoogleSpreadsheet } from 'google-spreadsheet'
import { DatabaseOptions, isDatabaseOptions, InternalDatabase, DBValue, Table, isDBValue } from './types'

/** The class you use for the database */
export default class Database {
  /** The internal google-spreadsheet instnce used to make API calls */
  private _spreadsheet: GoogleSpreadsheet

  /** The Promise returned by this.init(), that can be used to make sure the db is ready before making calls */
  private _initializer: Promise<void>

  /** The object that stores the rows that get cached during initialization */
  private _db: InternalDatabase

  constructor(options: DatabaseOptions) {
    if (!isDatabaseOptions(options)) throw new Error('Invalid options provided.')

    this._spreadsheet = new GoogleSpreadsheet(options.sheetID)
    this._db = {}

    this._initializer = this.init(options).catch(err => {
      const msg = '[gsheet-database] The database has failed while initializing, check the error below.\n'
      if (err instanceof Error) {
        err.message = msg + err.message
        throw err
      } else {
        throw new Error(msg + String(err))
      }
    })
  }

  /** Initializes the database */
  private async init(options: DatabaseOptions) {
    const { auth } = options

    const ss = this._spreadsheet

    if (auth.type == 'apiKey') ss.useApiKey(auth.key)
    if (auth.type == 'rawAccessToken') ss.useRawAccessToken(auth.token)
    if (auth.type == 'serviceAccount') await ss.useServiceAccountAuth(auth.creds)

    await ss.loadInfo()

    const duplicate = [],
      tooFewHeaders = [],
      tooManyHeaders = [],
      fetchingError = [],
      emptyHeaders = [] // This should never happen, but still...

    for (const sheet of ss.sheetsByIndex) {
      const { title, headerValues } = sheet

      if (this._db[title] !== undefined) {
        duplicate.push(title)
        continue
      }

      if (headerValues.length < 2) {
        tooFewHeaders.push(title)
        continue
      } else if (headerValues.length > 2) {
        tooManyHeaders.push(title)
      }

      const [keyID, valueID] = headerValues
      if (!keyID || !valueID) {
        emptyHeaders.push(title)
        continue
      }

      const rows = await sheet.getRows()
      if (!rows) {
        fetchingError.push(title)
        continue
      }

      this._db[title] = {
        keyID,
        valueID,
        rows,
        sheetID: sheet.sheetId
      }
    }

    if (duplicate.length) console.error('[gsheet-database] The following sheet have been ignored because of duplicate titles: ' + duplicate.join(', '))
    if (tooFewHeaders.length) console.error('[gsheet-database] The following sheet have been ignored because they have too few headers: ' + tooFewHeaders.join(', '))
    if (tooManyHeaders.length) console.warn('[gsheet-database] The following sheet have too many headers, only the first two will be used: ' + tooManyHeaders.join(', '))
    if (fetchingError.length) console.error('[gsheet-database] The following sheet have been ignored because of a fetching error: ' + fetchingError.join(', '))
    if (emptyHeaders.length) console.error('[gsheet-database] The following sheet have been ignored because of empty headers: ' + emptyHeaders.join(', '))

    this._spreadsheet = ss
  }

  /** An array with all the cached sheet names */
  get sheetNames() {
    return Object.keys(this._db)
  }

  /** Returns whether a string is one of the cached sheet names */
  private _isSheetName(name: string) {
    return this.sheetNames.includes(name)
  }

  /**
   * Gets a value from one of the sheets
   * @param sheetName The name of the sheet you want to get the value from
   * @param key The key (value in the first column) of the row you want to get the value from
   */
  async get(sheetName: string, key: string): Promise<DBValue | undefined> {
    await this._initializer

    if (!this._isSheetName(sheetName)) throw new Error(`The provided sheet name doesn't exist in the database (received: ${sheetName} (type: ${typeof sheetName}))`)
    if (!key || typeof key != 'string') throw new Error(`The provided key is either empty or not a string (received: ${key} (type: ${typeof key}))`)

    const sheet = this._db[sheetName],
      row = findRow(sheet, key)

    if (row) {
      const value = row[sheet.valueID]

      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
  }

  /**
   * Sets a value in one of the sheets
   * @param sheetName The name of the sheet you want to set the value in
   * @param key The key (value in the first column) of the row you want to set the value for
   * @param value The value you want to set, needs to be something that can be converted to JSON (string, number, boolean or object)
   */
  async set(sheetName: string, key: string, value: DBValue) {
    await this._initializer

    if (!this._isSheetName(sheetName)) throw new Error(`The provided sheet name doesn't exist in the database (received: ${sheetName} (type: ${typeof sheetName}))`)
    if (!key || typeof key != 'string') throw new Error(`The provided key is either empty or not a string (received: ${key} (type: ${typeof key}))`)
    if (!isDBValue(value)) throw new Error(`The provided value is not valid (received: ${value} (type: ${typeof value}))`)

    const sheet = this._db[sheetName],
      existing = findRow(sheet, key),
      stringValue = JSON.stringify(value)

    if (existing) {
      existing[sheet.valueID] = stringValue
      await existing.save()
      return existing
    } else {
      return this._spreadsheet.sheetsById[sheet.sheetID]?.addRow([key, stringValue])
    }
  }

  /**
   * Deletes a database entry
   * @param sheetName The name of the sheet yuo want to delete the entry from
   * @param key The key (value in the first column) of the entry row
   */
  async delete(sheetName: string, key: string) {
    await this._initializer

    if (!this._isSheetName(sheetName)) throw new Error(`The provided sheet name doesn't exist in the database (received: ${sheetName} (type: ${typeof sheetName}))`)
    if (!key || typeof key != 'string') throw new Error(`The provided key is either empty or not a string (received: ${key} (type: ${typeof key}))`)

    const sheet = this._db[sheetName],
      existing = findRow(sheet, key)

    if (existing) {
      await existing.delete()
      return existing
    }
  }
}

/**
 * Finds a row in a cached sheet
 * @param sheet The cached sheet you want to search the row in
 * @param key The key (value in the first column) of the row
 */
function findRow(sheet: Table, key: string) {
  return sheet.rows.find(r => r[sheet.keyID] == key)
}
