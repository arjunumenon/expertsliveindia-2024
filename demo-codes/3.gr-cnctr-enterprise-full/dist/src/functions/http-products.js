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
const functions_1 = require("@azure/functions");
const tableClient_1 = require("../common/tableClient");
const crypto_1 = require("crypto");
const utils_1 = require("../common/utils");
functions_1.app.http('getProducts', {
    methods: ['GET'],
    route: 'products',
    handler: (request) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e;
        const filter = request.query.get('$filter');
        const select = (_e = (_d = request.query.get('$select')) === null || _d === void 0 ? void 0 : _d.split(',')) !== null && _e !== void 0 ? _e : ['rowKey', 'last_modified_t'];
        let products = [];
        const tableClient = yield (0, tableClient_1.getTableClient)('products');
        const entities = tableClient.listEntities({
            queryOptions: {
                filter,
                select
            }
        });
        try {
            for (var _f = true, entities_1 = __asyncValues(entities), entities_1_1; entities_1_1 = yield entities_1.next(), _a = entities_1_1.done, !_a; _f = true) {
                _c = entities_1_1.value;
                _f = false;
                const entity = _c;
                const product = Object.assign({ id: entity.rowKey }, entity);
                delete product.etag;
                delete product.rowKey;
                products.push(product);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = entities_1.return)) yield _b.call(entities_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // it's important that the API returns products sorted
        // by last_modified_t, so that we can properly store
        // the last modified date for incremental crawls
        // this is especially important if the initial crawl breaks
        // mid-crawl and we need to resume from the last modified date
        products = products.sort((a, b) => a.last_modified_t - b.last_modified_t);
        return {
            status: 200,
            body: JSON.stringify(products, null, 2),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    })
});
functions_1.app.http('getProduct', {
    methods: ['GET'],
    route: 'products/{id}',
    handler: (request, context) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = request.params;
        try {
            const tableClient = yield (0, tableClient_1.getTableClient)('products');
            const productEntity = yield tableClient.getEntity('products', id);
            delete productEntity.partitionKey;
            delete productEntity.timestamp;
            delete productEntity.etag;
            delete productEntity['odata.metadata'];
            const product = Object.assign({ id: productEntity.rowKey }, productEntity);
            delete product.rowKey;
            return {
                status: 200,
                body: JSON.stringify(product, null, 2),
            };
        }
        catch (error) {
            return {
                status: error.statusCode,
            };
        }
    })
});
functions_1.app.http('createProduct', {
    methods: ['POST'],
    route: 'products',
    handler: (request) => __awaiter(void 0, void 0, void 0, function* () {
        const { body } = request;
        try {
            const tableClient = yield (0, tableClient_1.getTableClient)('products');
            const newProduct = Object.assign({ partitionKey: "products", rowKey: (0, crypto_1.randomUUID)().replace(/-|[a-z]/g, ''), last_modified_t: Date.now() }, yield (0, utils_1.streamToJson)(body));
            yield tableClient.createEntity(newProduct);
            return {
                status: 201
            };
        }
        catch (error) {
            return {
                status: error.statusCode,
            };
        }
    })
});
functions_1.app.http('updateProduct', {
    methods: ['PATCH'],
    route: 'products/{id}',
    handler: (request) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = request.params;
        const { body } = request;
        try {
            const tableClient = yield (0, tableClient_1.getTableClient)('products');
            const product = yield tableClient.getEntity("products", id);
            yield tableClient.updateEntity(Object.assign(Object.assign(Object.assign({}, product), yield (0, utils_1.streamToJson)(body)), { last_modified_t: Math.floor(Date.now() / 1000) }), "Merge");
            return {
                status: 200
            };
        }
        catch (error) {
            return {
                status: error.statusCode,
            };
        }
    })
});
functions_1.app.http('deleteProduct', {
    methods: ['DELETE'],
    route: 'products/{id}',
    handler: (request) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = request.params;
        try {
            const tableClient = yield (0, tableClient_1.getTableClient)('products');
            yield tableClient.getEntity("products", id);
            yield tableClient.deleteEntity('products', id);
            return {
                status: 200
            };
        }
        catch (error) {
            return {
                status: error.statusCode,
            };
        }
    })
});
//# sourceMappingURL=http-products.js.map