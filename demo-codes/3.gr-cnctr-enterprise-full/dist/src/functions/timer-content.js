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
const queueClient_1 = require("../common/queueClient");
functions_1.app.timer('incrementalCrawl', {
    // every hour
    schedule: '0 * * * *',
    handler: (timer, context) => __awaiter(void 0, void 0, void 0, function* () {
        context.log(`Enqueuing request for incremental crawl...`);
        (0, queueClient_1.startCrawl)('incremental');
    })
});
functions_1.app.timer('removeDeleted', {
    // 10 past every hour
    schedule: '10 * * * *',
    handler: (timer, context) => __awaiter(void 0, void 0, void 0, function* () {
        context.log(`Enqueuing request for cleaning deleted items...`);
        (0, queueClient_1.startCrawl)('removeDeleted');
    })
});
//# sourceMappingURL=timer-content.js.map