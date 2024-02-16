"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const identity_1 = require("@azure/identity");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const index_js_1 = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js");
const config_1 = require("./config");
const credential = new identity_1.ClientSecretCredential(config_1.config.aadAppTenantId, config_1.config.aadAppClientId, config_1.config.aadAppClientSecret);
const authProvider = new index_js_1.TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
});
const middleware = microsoft_graph_client_1.MiddlewareFactory.getDefaultMiddlewareChain(authProvider);
exports.client = microsoft_graph_client_1.Client.initWithMiddleware({ middleware });
//# sourceMappingURL=graphClient.js.map