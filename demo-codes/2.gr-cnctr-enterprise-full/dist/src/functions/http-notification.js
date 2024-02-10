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
const validateToken_1 = require("../common/validateToken");
const utils_1 = require("../common/utils");
const config_1 = require("../common/config");
var TargetConnectorState;
(function (TargetConnectorState) {
    TargetConnectorState["Enabled"] = "enabled";
    TargetConnectorState["Disabled"] = "disabled";
})(TargetConnectorState || (TargetConnectorState = {}));
functions_1.app.http('notification', {
    methods: ['POST'],
    handler: (request, context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const body = yield (0, utils_1.streamToJson)(request.body);
        context.log('Received notification');
        context.log(JSON.stringify(body, null, 2));
        const { aadAppTenantId: tenantId, aadAppClientId: clientId } = config_1.config;
        const token = body === null || body === void 0 ? void 0 : body.validationTokens[0];
        context.log(`Validating token: ${token}, tenantId: ${tenantId}, clientId: ${clientId}...`);
        yield (0, validateToken_1.validateToken)(token, tenantId, clientId);
        context.log('Token validated');
        const changeDetails = (_a = body === null || body === void 0 ? void 0 : body.value[0]) === null || _a === void 0 ? void 0 : _a.resourceData;
        const targetConnectorState = changeDetails === null || changeDetails === void 0 ? void 0 : changeDetails.state;
        const message = {
            connectorId: changeDetails === null || changeDetails === void 0 ? void 0 : changeDetails.id,
            connectorTicket: changeDetails === null || changeDetails === void 0 ? void 0 : changeDetails.connectorsTicket
        };
        if (targetConnectorState === TargetConnectorState.Enabled) {
            message.action = 'create';
        }
        else if (targetConnectorState === TargetConnectorState.Disabled) {
            message.action = 'delete';
        }
        if (!message.action) {
            context.error('Invalid action');
            return;
        }
        context.log(JSON.stringify(message, null, 2));
        const queueClient = yield (0, queueClient_1.getQueueClient)('queue-connection');
        const messageString = btoa(JSON.stringify(message));
        context.log('Sending message to queue queue-connection: ${message}');
        // must base64 encode
        yield queueClient.sendMessage(messageString);
        context.log('Message sent');
        return {
            status: 202
        };
    })
});
//# sourceMappingURL=http-notification.js.map