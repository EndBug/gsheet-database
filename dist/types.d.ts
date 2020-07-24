import { ServiceAccountCredentials, GoogleSpreadsheetRow } from 'google-spreadsheet';
/** The options for when you create the database */
export interface DatabaseOptions {
    /** The sheet ID, you can get it from the URL */
    sheetID: string;
    /** Your auth method: using a service account, an API key or an access token */
    auth: apiKeyAuth | rawAccessTokenAuth | serviceAccountAuth;
    /** Whether to ignore failure warnings */
    silent?: boolean;
}
interface apiKeyAuth {
    type: 'apiKey';
    key: string;
}
interface rawAccessTokenAuth {
    type: 'rawAccessToken';
    token: string;
}
interface serviceAccountAuth {
    type: 'serviceAccount';
    /** JWT-style credentials */
    creds: ServiceAccountCredentials;
}
/** Returns whether a value is a valid DatabaseOptions object */
export declare function isDatabaseOptions(value: any): value is DatabaseOptions;
/** Type for the internal database */
export declare type InternalDatabase = Record<string, Table>;
/** Interface for the cached sheets in the internal database */
export interface Table {
    sheetID: string;
    keyID: string;
    valueID: string;
    rows: GoogleSpreadsheetRow[];
}
/** Type for the values you can put in the database. `undefined` is not allowed, you should use `.delete()` to remove the entry instead. */
export declare type DBValue = string | boolean | number | object;
/** Returns whether a value is a valid database entry value */
export declare function isDBValue(value: any): value is DBValue;
/** Parses a string to be a DBValue */
export declare function parseDBValue(value: string): DBValue;
export {};
