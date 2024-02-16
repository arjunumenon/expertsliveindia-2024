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
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const config_1 = require("../common/config");
const graphClient_1 = require("../common/graphClient");
const queueClient_1 = require("../common/queueClient");
const tableClient_1 = require("../common/tableClient");
const { notificationEndpoint: apiUrl } = config_1.config;
function crawl(crawlType, context) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (crawlType) {
            case 'full':
            case 'incremental':
                yield crawlFullOrIncremental(crawlType, context);
                break;
            case 'removeDeleted':
                yield removeDeleted(context);
                break;
        }
    });
}
function crawlFullOrIncremental(crawlType, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${apiUrl}/api/products`;
        if (crawlType === 'incremental') {
            const lastModified = yield (0, tableClient_1.getLastModified)(context);
            url += `?$filter=last_modified_t gt ${lastModified}`;
        }
        context.log(`Retrieving items from ${url}...`);
        const res = yield fetch(url);
        if (!res.ok) {
            context.log(`Error retrieving item from ${url}: ${res.statusText}`);
            return;
        }
        const products = yield res.json();
        context.log(`Retrieved ${products.length} items from ${url}`);
        for (const product of products) {
            context.log(`Enqueuing item update for ${product.id}...`);
            (0, queueClient_1.enqueueItemUpdate)(product.id);
        }
    });
}
function removeDeleted(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${apiUrl}/api/products`;
        context.log(`Retrieving items from ${url}...`);
        const res = yield fetch(url);
        if (!res.ok) {
            context.log(`Error retrieving item from ${url}: ${res.statusText}`);
            return;
        }
        const products = yield res.json();
        context.log(`Retrieved ${products.length} items from ${url}`);
        context.log('Retrieving ingested items...');
        const ingestedItemIds = yield (0, tableClient_1.getItemIds)(context);
        ingestedItemIds.forEach(ingestedItemId => {
            if (products.find(product => product.id === ingestedItemId)) {
                context.log(`Item ${ingestedItemId} still exists, skipping...`);
            }
            else {
                context.log(`Item ${ingestedItemId} no longer exists, deleting...`);
                (0, queueClient_1.enqueueItemDeletion)(ingestedItemId);
            }
        });
    });
}
function processItem(itemId, itemAction, context) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (itemAction) {
            case 'update':
                yield updateItem(itemId, context);
                break;
            case 'delete':
                yield deleteItem(itemId, context);
                break;
        }
    });
}
function updateItem(itemId, context) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${apiUrl}/api/products/${itemId}`;
        context.log(`Retrieving item from ${url}...`);
        const res = yield fetch(url);
        if (!res.ok) {
            context.log(`Error retrieving item from ${url}: ${res.statusText}`);
            return;
        }
        const product = yield res.json();
        context.log(`Retrieved product from ${url}`);
        context.log(JSON.stringify(product, null, 2));
        const externalItem = {
            id: product.id,
            properties: {
                'categories@odata.type': 'Collection(String)',
                categories: (_c = (_b = (_a = product.categories) === null || _a === void 0 ? void 0 : _a.replace(/en:/g, '')) === null || _b === void 0 ? void 0 : _b.split(', ')) !== null && _c !== void 0 ? _c : [''],
                ecoscore: product.ecoscore_grade,
                imageUrl: product.image_url,
                'ingredients@odata.type': 'Collection(String)',
                ingredients: (_e = (_d = product.ingredients_text) === null || _d === void 0 ? void 0 : _d.split(', ')) !== null && _e !== void 0 ? _e : [''],
                nutriscore: product.nutriscore_grade,
                'traces@odata.type': 'Collection(String)',
                traces: (_h = (_g = (_f = product.traces_tags) === null || _f === void 0 ? void 0 : _f.replace(/en:/g, '')) === null || _g === void 0 ? void 0 : _g.split(', ')) !== null && _h !== void 0 ? _h : [''],
                name: product.product_name,
                url: product.url.replace('.net/', '.org/')
            },
            content: {
                value: product.product_name,
                type: 'text'
            },
            acl: [
                {
                    accessType: 'grant',
                    type: 'everyone',
                    value: 'everyone'
                }
            ]
        };
        context.log(`Transformed item`);
        context.log(JSON.stringify(externalItem, null, 2));
        const externalItemUrl = `/external/connections/${config_1.config.connector.id}/items/${product.id}`;
        context.log(`Updating external item ${externalItemUrl}...`);
        yield graphClient_1.client
            .api(externalItemUrl)
            .header('content-type', 'application/json')
            .put(externalItem);
        context.log(`Adding item ${product.id} to table storage...`);
        // track item to support deletion
        yield (0, tableClient_1.addItemToTable)(product.id, context);
        context.log(`Tracking last modified date ${product.last_modified_t}`);
        // track last modified date for incremental crawl
        yield (0, tableClient_1.recordLastModified)(product.last_modified_t, context);
    });
}
function deleteItem(itemId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const externalItemUrl = `/external/connections/${config_1.config.connector.id}/items/${itemId}`;
        context.log(`Deleting external item ${externalItemUrl}...`);
        yield graphClient_1.client
            .api(externalItemUrl)
            .delete();
        context.log(`Removing item ${itemId} from table storage...`);
        yield (0, tableClient_1.removeItemFromTable)(itemId, context);
    });
}
functions_1.app.storageQueue("contentQueue", {
    connection: "AzureWebJobsStorage",
    queueName: "queue-content",
    handler: (message, context) => __awaiter(void 0, void 0, void 0, function* () {
        context.log('Received message from queue queue-content');
        context.log(JSON.stringify(message, null, 2));
        const { action, crawlType, itemAction, itemId } = message;
        switch (action) {
            case 'crawl':
                yield crawl(crawlType, context);
                break;
            case 'item':
                yield processItem(itemId, itemAction, context);
                break;
            default:
                break;
        }
    })
});
//# sourceMappingURL=queue-content.js.map