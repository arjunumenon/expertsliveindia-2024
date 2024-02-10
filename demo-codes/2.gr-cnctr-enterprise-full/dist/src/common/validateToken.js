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
exports.validateToken = void 0;
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const ExpectedMicrosoftApps = [
    '56c1da01-2129-48f7-9355-af6d59d42766',
    '0bf30f3b-4a52-48df-9a82-234910c4a086', // Microsoft Graph Change Tracking
];
function validateToken(validationToken, tenantId, audience) {
    return __awaiter(this, void 0, void 0, function* () {
        const getSigningKeys = (header, callback) => {
            const client = jwksClient({
                jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/keys`
            });
            client.getSigningKey(header.kid, function (err, key) {
                const signingKey = key.getPublicKey();
                callback(null, signingKey);
            });
        };
        const decodedToken = jwt.decode(validationToken, { json: true });
        const isV2Token = decodedToken.ver === '2.0';
        const verifyOptions = {
            audience,
            issuer: isV2Token ? `https://login.microsoftonline.com/${tenantId}/v2.0` : `https://sts.windows.net/${tenantId}/`,
        };
        return new Promise((resolve, reject) => {
            jwt.verify(validationToken, getSigningKeys, verifyOptions, (err, payload) => {
                if (err) {
                    reject(err);
                    return;
                }
                const appId = isV2Token ? payload.azp : payload.appid;
                if (!ExpectedMicrosoftApps.includes(appId)) {
                    reject('Not Expected Microsoft Apps.');
                    return;
                }
                console.log('Token is validated.');
                resolve();
            });
        });
    });
}
exports.validateToken = validateToken;
//# sourceMappingURL=validateToken.js.map