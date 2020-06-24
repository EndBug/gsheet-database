import { ServiceAccountCredentials, GoogleSpreadsheetRow } from 'google-spreadsheet'

/** The options for when you create the database */
export interface DatabaseOptions {
  /** The sheet ID, you can get it from the URL */
  sheetID: string

  /** Your auth method: using a service account, an API key or an access token */
  auth: apiKeyAuth | rawAccessTokenAuth | serviceAccountAuth
}

interface apiKeyAuth {
  type: 'apiKey'
  key: string
}

interface rawAccessTokenAuth {
  type: 'rawAccessToken'
  token: string
}

interface serviceAccountAuth {
  type: 'serviceAccount'
  /** JWT-style credentials */
  creds: ServiceAccountCredentials
}

/** Returns whether a value is a valid DatabaseOptions object */
export function isDatabaseOptions(value: any): value is DatabaseOptions {
  return typeof value == 'object'
    && typeof value.sheetID == 'string' && !!value.sheetID
    && typeof value.auth == 'object'
    && (
      value.auth.type == 'apiKey' ? (typeof value.auth.key == 'string' && !!value.auth.key) :
        value.auth.type == 'rawAccessToken' ? (typeof value.auth.token == 'string' && !!value.auth.token) :
          value.auth.type == 'serviceAccount' ? typeof value.auth.creds == 'object' : false
    )
}

/** Type for the internal database */
export type InternalDatabase = Record<string, Table>

/** Interface for the cached sheets in the internal database */
export interface Table {
  sheetID: string
  keyID: string
  valueID: string
  rows: GoogleSpreadsheetRow[]
}

/** Type for the values you can put in the database. `undefined` is not allowed, you should use `.delete()` ot remove the entry instead. */
export type DBValue = string | boolean | number | object

/** Returns whether a value is a valid database entry value */
export function isDBValue(value: any): value is DBValue {
  return ['string', 'boolean', 'number', 'object'].includes(typeof value)
}
