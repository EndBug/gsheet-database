import { DatabaseOptions, DBValue } from './types';
export * from './types';
/** The class you use for the database */
export default class Database {
    /** The options used to create the Database */
    options: DatabaseOptions;
    /** The internal google-spreadsheet instnce used to make API calls */
    private _spreadsheet;
    /** The Promise returned by this.init(), that can be used to make sure the db is ready before making calls */
    private _initializer;
    /** The object that stores the rows that get cached during initialization */
    private _db;
    /** Whether the database is marked as ready */
    private _ready;
    constructor(options: DatabaseOptions);
    /** Initializes the database */
    private init;
    /** The Promise returned by this.init(), that can be used to make sure the db is ready before making calls */
    get initializer(): Promise<void>;
    /** An array with all the cached sheet names */
    get sheetNames(): string[];
    /** Returns whether a string is one of the cached sheet names */
    private _isSheetName;
    /** Whether the database is marked as ready */
    get isReady(): boolean;
    /** A record with the sheet names as keys and the [key, value] arrays with the headers as values */
    get headers(): Record<string, [string, string]>;
    /** Updates the cached rows for a given sheet */
    private _updateSheet;
    /**
     * Gets a value from one of the sheets
     * @param sheetName The name of the sheet you want to get the value from
     * @param key The key (value in the first column) of the row you want to get the value from. If none is provided, returns a record with every key-value entry.
     */
    get(sheetName: string, key?: string): Promise<DBValue | undefined>;
    /**
     * Sets a value in one of the sheets
     * @param sheetName The name of the sheet you want to set the value in
     * @param key The key (value in the first column) of the row you want to set the value for
     * @param value The value you want to set, needs to be something that can be converted to JSON (string, number, boolean or object)
     */
    set(sheetName: string, key: string, value: DBValue): Promise<import("google-spreadsheet").GoogleSpreadsheetRow>;
    /**
     * Deletes a database entry
     * @param sheetName The name of the sheet you want to delete the entry from
     * @param key The key (value in the first column) of the entry row
     */
    delete(sheetName: string, key: string): Promise<import("google-spreadsheet").GoogleSpreadsheetRow | undefined>;
}
