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
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const config_1 = require("../common/config");
const graphClient_1 = require("../common/graphClient");
const queueClient_1 = require("../common/queueClient");
const resultLayout_1 = require("../common/resultLayout");
function createConnection(connectorId, connectorTicket) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, name, description, activitySettings, searchSettings } = config_1.config.connector;
        searchSettings.searchResultTemplates[0].layout = resultLayout_1.resultLayout;
        yield graphClient_1.client
            .api('/external/connections')
            .version('beta')
            .header('GraphConnectors-Ticket', connectorTicket)
            .post({
            id,
            connectorId,
            name,
            description,
            activitySettings,
            searchSettings
        });
    });
}
function createSchema() {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, schema } = config_1.config.connector;
        const res = yield graphClient_1.client
            .api(`/external/connections/${id}/schema`)
            .responseType(microsoft_graph_client_1.ResponseType.RAW)
            .header('content-type', 'application/json')
            .patch({
            baseType: 'microsoft.graph.externalItem',
            properties: schema
        });
        const location = res.headers.get('Location');
        yield (0, queueClient_1.enqueueCheckStatus)(location);
    });
}
function checkSchemaStatus(location, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield graphClient_1.client
            .api(location)
            .get();
        context.log(`Schema provisioning status: ${res.status}`);
        switch (res.status) {
            case 'inprogress':
                yield (0, queueClient_1.enqueueCheckStatus)(location);
                break;
            case 'completed':
                yield (0, queueClient_1.startCrawl)('full');
                break;
        }
    });
}
function deleteConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        yield graphClient_1.client.api(`/external/connections/${config_1.config.connector.id}`).delete();
    });
}
functions_1.app.storageQueue("connectionQueue", {
    connection: "AzureWebJobsStorage",
    queueName: "queue-connection",
    handler: (message, context) => __awaiter(void 0, void 0, void 0, function* () {
        context.log('Received message from queue queue-connection');
        context.log(JSON.stringify(message, null, 2));
        const { action, connectorId, connectorTicket, location } = message;
        switch (action) {
            case 'create':
                context.log('Creating connection...');
                yield createConnection(connectorId, connectorTicket);
                context.log('Connection created');
                context.log('Submitting schema for provisioning...');
                createSchema();
                context.log('Schema submitted');
                break;
            case 'delete':
                context.log('Deleting connection...');
                yield deleteConnection();
                context.log('Connection deleted');
                break;
            case 'status':
                context.log('Checking schema status...');
                yield checkSchemaStatus(location, context);
                context.log('Schema status checked');
                break;
            default:
                break;
        }
    })
});
//# sourceMappingURL=queue-connection.js.map