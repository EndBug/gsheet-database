"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var google_spreadsheet_1 = require("google-spreadsheet");
var types_1 = require("./types");
__exportStar(require("./types"), exports);
/** The class you use for the database */
var Database = /** @class */ (function () {
    function Database(options) {
        var _this = this;
        if (!types_1.isDatabaseOptions(options))
            throw new Error('Invalid options provided.');
        this.options = options;
        this._spreadsheet = new google_spreadsheet_1.GoogleSpreadsheet(options.sheetID);
        this._db = {};
        this._ready = false;
        this._initializer = this.init().then(function () {
            _this._ready = true;
        }).catch(function (err) {
            if (options.silent)
                return;
            var msg = '[gsheet-database] The database has failed while initializing, check the error below.\n';
            if (err.message) {
                err.message = msg + err.message;
                throw err;
            }
            else {
                throw new Error(msg + String(err));
            }
        });
    }
    /** Initializes the database */
    Database.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var auth, ss, duplicate, tooFewHeaders, tooManyHeaders, fetchingError, emptyHeaders, _i, _a, sheet, title, headerValues, keyID, valueID, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        auth = this.options.auth;
                        ss = this._spreadsheet;
                        if (auth.type == 'apiKey')
                            ss.useApiKey(auth.key);
                        if (auth.type == 'rawAccessToken')
                            ss.useRawAccessToken(auth.token);
                        if (!(auth.type == 'serviceAccount')) return [3 /*break*/, 2];
                        return [4 /*yield*/, ss.useServiceAccountAuth(auth.creds)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, ss.loadInfo()];
                    case 3:
                        _b.sent();
                        duplicate = [], tooFewHeaders = [], tooManyHeaders = [], fetchingError = [], emptyHeaders = [] // This should never happen, but still...
                        ;
                        _i = 0, _a = ss.sheetsByIndex;
                        _b.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        sheet = _a[_i];
                        return [4 /*yield*/, sheet.loadHeaderRow()];
                    case 5:
                        _b.sent();
                        title = sheet.title, headerValues = sheet.headerValues;
                        if (this._db[title] !== undefined) {
                            duplicate.push(title);
                            return [3 /*break*/, 7];
                        }
                        if (headerValues.length < 2) {
                            tooFewHeaders.push(title);
                            return [3 /*break*/, 7];
                        }
                        else if (headerValues.length > 2) {
                            tooManyHeaders.push(title);
                        }
                        keyID = headerValues[0], valueID = headerValues[1];
                        if (!keyID || !valueID) {
                            emptyHeaders.push(title);
                            return [3 /*break*/, 7];
                        }
                        return [4 /*yield*/, sheet.getRows()];
                    case 6:
                        rows = _b.sent();
                        if (!rows) {
                            fetchingError.push(title);
                            return [3 /*break*/, 7];
                        }
                        this._db[title] = {
                            keyID: keyID,
                            valueID: valueID,
                            rows: rows,
                            sheetID: sheet.sheetId
                        };
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 4];
                    case 8:
                        if (duplicate.length)
                            console.error('[gsheet-database] The following sheet have been ignored because of duplicate titles: ' + duplicate.join(', '));
                        if (tooFewHeaders.length)
                            console.error('[gsheet-database] The following sheet have been ignored because they have too few headers: ' + tooFewHeaders.join(', '));
                        if (tooManyHeaders.length)
                            console.warn('[gsheet-database] The following sheet have too many headers, only the first two will be used: ' + tooManyHeaders.join(', '));
                        if (fetchingError.length)
                            console.error('[gsheet-database] The following sheet have been ignored because of a fetching error: ' + fetchingError.join(', '));
                        if (emptyHeaders.length)
                            console.error('[gsheet-database] The following sheet have been ignored because of empty headers: ' + emptyHeaders.join(', '));
                        this._spreadsheet = ss;
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Database.prototype, "initializer", {
        /** The Promise returned by this.init(), that can be used to make sure the db is ready before making calls */
        get: function () {
            return this._initializer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Database.prototype, "sheetNames", {
        /** An array with all the cached sheet names */
        get: function () {
            return Object.keys(this._db);
        },
        enumerable: false,
        configurable: true
    });
    /** Returns whether a string is one of the cached sheet names */
    Database.prototype._isSheetName = function (name) {
        return this.sheetNames.includes(name);
    };
    Object.defineProperty(Database.prototype, "isReady", {
        /** Whether the database is marked as ready */
        get: function () {
            return this._ready;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Database.prototype, "headers", {
        /** A record with the sheet names as keys and the [key, value] arrays with the headers as values */
        get: function () {
            var res = {};
            for (var title in this._db) {
                var table = this._db[title];
                res[title] = [table.keyID, table.valueID];
            }
            return res;
        },
        enumerable: false,
        configurable: true
    });
    /** Updates the cached rows for a given sheet */
    Database.prototype._updateSheet = function (sheetName) {
        return __awaiter(this, void 0, void 0, function () {
            var sheet, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sheet = this._spreadsheet.sheetsByIndex.find(function (s) { return s.title == sheetName; });
                        if (!sheet)
                            return [2 /*return*/];
                        return [4 /*yield*/, sheet.getRows()];
                    case 1:
                        rows = _a.sent();
                        if (!rows)
                            return [2 /*return*/];
                        this._db[sheetName].rows = rows;
                        return [2 /*return*/, this._db[sheetName]];
                }
            });
        });
    };
    /**
     * Gets a value from one of the sheets
     * @param sheetName The name of the sheet you want to get the value from
     * @param key The key (value in the first column) of the row you want to get the value from. If none is provided, returns a record with every key-value entry.
     */
    Database.prototype.get = function (sheetName, key) {
        return __awaiter(this, void 0, void 0, function () {
            var sheet, row, value, res_1, keyID_1, valueID_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._initializer)
                            this._initializer = this.init();
                        return [4 /*yield*/, this._initializer];
                    case 1:
                        _a.sent();
                        if (!this._isSheetName(sheetName))
                            throw new Error("The provided sheet name doesn't exist in the database (received: " + sheetName + " (type: " + typeof sheetName + "))");
                        if (!['string', 'undefined'].includes(typeof key))
                            throw new Error("The provided key is not a string (received: " + key + " (type: " + typeof key + "))");
                        sheet = this._db[sheetName];
                        if (key) {
                            row = findRow(sheet, key);
                            if (row) {
                                value = row[sheet.valueID];
                                return [2 /*return*/, types_1.parseDBValue(value)];
                            }
                        }
                        else {
                            res_1 = {}, keyID_1 = sheet.keyID, valueID_1 = sheet.valueID;
                            sheet.rows.forEach(function (row) { return res_1[row[keyID_1]] = types_1.parseDBValue(row[valueID_1]); });
                            return [2 /*return*/, res_1];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets a value in one of the sheets
     * @param sheetName The name of the sheet you want to set the value in
     * @param key The key (value in the first column) of the row you want to set the value for
     * @param value The value you want to set, needs to be something that can be converted to JSON (string, number, boolean or object)
     */
    Database.prototype.set = function (sheetName, key, value) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var sheet, existing, stringValue, newRow;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._initializer)
                            this._initializer = this.init();
                        return [4 /*yield*/, this._initializer];
                    case 1:
                        _b.sent();
                        if (!this._isSheetName(sheetName))
                            throw new Error("The provided sheet name doesn't exist in the database (received: " + sheetName + " (type: " + typeof sheetName + "))");
                        if (!key || typeof key != 'string')
                            throw new Error("The provided key is either empty or not a string (received: " + key + " (type: " + typeof key + "))");
                        if (!types_1.isDBValue(value))
                            throw new Error("The provided value is not valid (received: " + value + " (type: " + typeof value + "))");
                        sheet = this._db[sheetName], existing = findRow(sheet, key), stringValue = typeof value == 'object' ? JSON.stringify(value) : value;
                        if (!existing) return [3 /*break*/, 3];
                        existing[sheet.valueID] = stringValue;
                        return [4 /*yield*/, existing.save()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, existing];
                    case 3: return [4 /*yield*/, ((_a = this._spreadsheet.sheetsById[sheet.sheetID]) === null || _a === void 0 ? void 0 : _a.addRow([key, stringValue]))];
                    case 4:
                        newRow = _b.sent();
                        return [4 /*yield*/, this._updateSheet(sheetName)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, newRow];
                }
            });
        });
    };
    /**
     * Deletes a database entry
     * @param sheetName The name of the sheet you want to delete the entry from
     * @param key The key (value in the first column) of the entry row
     */
    Database.prototype.delete = function (sheetName, key) {
        return __awaiter(this, void 0, void 0, function () {
            var sheet, existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._initializer)
                            this._initializer = this.init();
                        return [4 /*yield*/, this._initializer];
                    case 1:
                        _a.sent();
                        if (!this._isSheetName(sheetName))
                            throw new Error("The provided sheet name doesn't exist in the database (received: " + sheetName + " (type: " + typeof sheetName + "))");
                        if (!key || typeof key != 'string')
                            throw new Error("The provided key is either empty or not a string (received: " + key + " (type: " + typeof key + "))");
                        sheet = this._db[sheetName], existing = findRow(sheet, key);
                        if (!existing) return [3 /*break*/, 4];
                        return [4 /*yield*/, existing.delete()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._updateSheet(sheetName)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, existing];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Database;
}());
exports.default = Database;
/**
 * Finds a row in a cached sheet
 * @param sheet The cached sheet you want to search the row in
 * @param key The key (value in the first column) of the row
 */
function findRow(sheet, key) {
    return sheet.rows.find(function (r) { return r[sheet.keyID] == key; });
}
