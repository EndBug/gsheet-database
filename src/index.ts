import { GoogleSpreadsheet } from 'google-spreadsheet'
import { DatabaseOptions, isDatabaseOptions, InternalDatabase, DBValue } from './types'

export class Database {
  private _spreadsheet: GoogleSpreadsheet
  private _initializer: Promise<void>
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

  get ready() {
    return !this._initializer
  }

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
        rows
      }
    }

    if (duplicate.length) console.error('[gsheet-database] The following sheet have been ignored because of duplicate titles: ' + duplicate.join(', '))
    if (tooFewHeaders.length) console.error('[gsheet-database] The following sheet have been ignored because they have too few headers: ' + tooFewHeaders.join(', '))
    if (tooManyHeaders.length) console.warn('[gsheet-database] The following sheet have too many headers, only the first two will be used: ' + tooManyHeaders.join(', '))
    if (fetchingError.length) console.error('[gsheet-database] The following sheet have been ignored because of a fetching error: ' + fetchingError.join(', '))
    if (emptyHeaders.length) console.error('[gsheet-database] The following sheet have been ignored because of empty headers: ' + emptyHeaders.join(', '))

    this._spreadsheet = ss
  }

  get sheetNames() {
    return Object.keys(this._db)
  }

  private _isSheetName(name: string) {
    return this.sheetNames.includes(name)
  }

  async get(sheetName: string, key: string): Promise<DBValue> {
    await this._initializer

    if (!this._isSheetName(sheetName)) throw new Error('The provided sheet name doesn\'t exist in the database')

    const sheet = this._db[sheetName],
      row = sheet.rows.find(r => r[sheet.keyID] == key)

    if (row) {
      const value = row[sheet.valueID]

      try {
        return JSON.parse(value)
      } catch {
        return value
      }

    }
  }

}
