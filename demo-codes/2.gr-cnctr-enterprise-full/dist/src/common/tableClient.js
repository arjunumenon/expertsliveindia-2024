"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastModified = exports.recordLastModified = exports.removeItemFromTable = exports.addItemToTable = exports.getItemIds = exports.getTableClient = void 0;
const data_tables_1 = require("@azure/data-tables");
const config_1 = require("./config");
function getTableClient(tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { storageAccountConnectionString } = config_1.config;
        const tableServiceClient = data_tables_1.TableServiceClient.fromConnectionString(storageAccountConnectionString);
        yield tableServiceClient.createTable(tableName);
        return data_tables_1.TableClient.fromConnectionString(storageAccountConnectionString, tableName);
    });
}
exports.getTableClient = getTableClient;
function getItemIds(context) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Getting table client for externalitems...`);
        const tableClient = yield getTableClient('externalitems');
        const entities = tableClient.listEntities();
        const items = [];
        try {
            for (var _d = true, entities_1 = __asyncValues(entities), entities_1_1; entities_1_1 = yield entities_1.next(), _a = entities_1_1.done, !_a; _d = true) {
                _c = entities_1_1.value;
                _d = false;
                const entity = _c;
                items.push(entity.rowKey);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = entities_1.return)) yield _b.call(entities_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return items;
    });
}
exports.getItemIds = getItemIds;
function addItemToTable(itemId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Getting table client for externalitems...`);
        const tableClient = yield getTableClient('externalitems');
        const entity = {
            partitionKey: 'products',
            rowKey: itemId
        };
        context.log(`Upserting entity ${JSON.stringify(entity, null, 2)}...`);
        yield tableClient.upsertEntity(entity);
    });
}
exports.addItemToTable = addItemToTable;
function removeItemFromTable(itemId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Getting table client for externalitems...`);
        const tableClient = yield getTableClient('externalitems');
        context.log(`Deleting entity ${itemId}...`);
        yield tableClient.deleteEntity('products', itemId);
    });
}
exports.removeItemFromTable = removeItemFromTable;
function recordLastModified(lastModifiedDate, context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Getting table client for state...`);
        const tableClient = yield getTableClient('state');
        let lastModified;
        try {
            context.log(`Getting entity lastModified...`);
            lastModified = yield tableClient.getEntity('state', 'lastModified');
        }
        catch (e) {
            context.log(`Error getting entity lastModified: ${e.message}`);
        }
        if (lastModified && lastModified.date > lastModifiedDate) {
            context.log(`Last modified date ${lastModified.date} is newer than ${lastModifiedDate}`);
            // we've got a newer record already
            return;
        }
        const entity = {
            partitionKey: 'state',
            rowKey: 'lastModified',
            date: lastModifiedDate
        };
        context.log(`Upserting entity ${JSON.stringify(entity, null, 2)}...`);
        yield tableClient.upsertEntity(entity);
    });
}
exports.recordLastModified = recordLastModified;
function getLastModified(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log(`Getting table client for state...`);
        const tableClient = yield getTableClient('state');
        let lastModified;
        try {
            context.log(`Getting entity lastModified...`);
            lastModified = yield tableClient.getEntity('state', 'lastModified');
            context.log(`Got lastModified: ${JSON.stringify(lastModified, null, 2)}`);
            return lastModified.date;
        }
        catch (e) {
            context.log(`Error getting entity lastModified: ${e.message}. Returning 0`);
            return 0;
        }
    });
}
exports.getLastModified = getLastModified;
//# sourceMappingURL=tableClient.js.map