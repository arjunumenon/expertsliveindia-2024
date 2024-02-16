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
const utils_1 = require("../common/utils");
functions_1.app.http('content', {
    methods: ['POST'],
    route: 'crawl',
    handler: (request, context) => __awaiter(void 0, void 0, void 0, function* () {
        const body = yield (0, utils_1.streamToJson)(request.body);
        if (!body.crawlType || !['full', 'incremental'].includes(body.crawlType)) {
            return {
                status: 400
            };
        }
        context.log(`Enqueuing crawl request for ${body.crawlType}...`);
        (0, queueClient_1.startCrawl)(body.crawlType);
        return {
            status: 202
        };
    })
});
//# sourceMappingURL=http-content.js.map