"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDBValue = exports.isDBValue = exports.isDatabaseOptions = void 0;
/** Returns whether a value is a valid DatabaseOptions object */
function isDatabaseOptions(value) {
    return typeof value == 'object'
        && typeof value.sheetID == 'string' && !!value.sheetID
        && typeof value.auth == 'object'
        && (value.auth.type == 'apiKey' ? (typeof value.auth.key == 'string' && !!value.auth.key) :
            value.auth.type == 'rawAccessToken' ? (typeof value.auth.token == 'string' && !!value.auth.token) :
                value.auth.type == 'serviceAccount' ? typeof value.auth.creds == 'object' : false)
        && ['undefined', 'boolean'].includes(typeof value.silent);
}
exports.isDatabaseOptions = isDatabaseOptions;
/** Returns whether a value is a valid database entry value */
function isDBValue(value) {
    return ['string', 'boolean', 'number', 'object'].includes(typeof value);
}
exports.isDBValue = isDBValue;
/** Parses a string to be a DBValue */
function parseDBValue(value) {
    try {
        return JSON.parse(value);
    }
    catch (_a) {
        if (['TRUE', 'FALSE'].includes(value))
            try {
                return JSON.parse(value.toLowerCase());
            }
            catch (_b) { }
        return value;
    }
}
exports.parseDBValue = parseDBValue;
