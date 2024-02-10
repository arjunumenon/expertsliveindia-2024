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
exports.enqueueItemDeletion = exports.enqueueItemUpdate = exports.startCrawl = exports.enqueueCheckStatus = exports.getQueueClient = void 0;
const storage_queue_1 = require("@azure/storage-queue");
const config_1 = require("./config");
function getQueueClient(queueName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { storageAccountConnectionString } = config_1.config;
        const queueServiceClient = storage_queue_1.QueueServiceClient.fromConnectionString(storageAccountConnectionString);
        yield queueServiceClient.createQueue(queueName);
        return queueServiceClient.getQueueClient(queueName);
    });
}
exports.getQueueClient = getQueueClient;
function enqueueCheckStatus(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            action: 'status',
            location
        };
        const queueClient = yield getQueueClient('queue-connection');
        // wait 60s before polling again for status
        yield queueClient.sendMessage(btoa(JSON.stringify(message)), { visibilityTimeout: 60 });
    });
}
exports.enqueueCheckStatus = enqueueCheckStatus;
function startCrawl(crawlType) {
    return __awaiter(this, void 0, void 0, function* () {
        const queueClient = yield getQueueClient('queue-content');
        const message = {
            action: 'crawl',
            crawlType: crawlType
        };
        yield queueClient.sendMessage(btoa(JSON.stringify(message)));
    });
}
exports.startCrawl = startCrawl;
function enqueueItemUpdate(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queueClient = yield getQueueClient('queue-content');
        const message = {
            action: 'item',
            itemAction: 'update',
            itemId
        };
        yield queueClient.sendMessage(btoa(JSON.stringify(message)));
    });
}
exports.enqueueItemUpdate = enqueueItemUpdate;
function enqueueItemDeletion(itemId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queueClient = yield getQueueClient('queue-content');
        const message = {
            action: 'item',
            itemAction: 'delete',
            itemId
        };
        yield queueClient.sendMessage(btoa(JSON.stringify(message)));
    });
}
exports.enqueueItemDeletion = enqueueItemDeletion;
//# sourceMappingURL=queueClient.js.map