import { ServiceAccountCredentials, GoogleSpreadsheetRow } from 'google-spreadsheet'

export interface DatabaseOptions {
  sheetID: string
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
  creds: ServiceAccountCredentials
}

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

export type InternalDatabase = Record<string, Table>

interface Table {
  keyID: string
  valueID: string
  rows: GoogleSpreadsheetRow[]
}

export type DBValue = string | boolean | number | object | undefined
