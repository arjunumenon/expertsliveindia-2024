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
exports.DebugMiddleware = void 0;
function DebugMiddleware() {
    this.nextMiddleware = undefined;
    const getHeaders = (headers) => {
        const h = {};
        for (var header of headers.entries()) {
            h[header[0]] = header[1];
        }
        return h;
    };
    return {
        execute: (context) => __awaiter(this, void 0, void 0, function* () {
            console.debug('');
            console.debug(`Request: ${context.request}`);
            console.debug(JSON.stringify(context.options, null, 2));
            yield this.nextMiddleware.execute(context);
            const resp = context.response.clone();
            const headers = getHeaders(resp.headers);
            console.debug('');
            console.debug('Response headers:');
            console.debug(JSON.stringify(headers, null, 2));
            if (headers.hasOwnProperty('content-type') &&
                headers['content-type'].startsWith('application/json') &&
                resp.body) {
                console.debug('');
                console.debug('Response body:');
                console.debug(JSON.stringify(yield resp.json(), null, 2));
            }
        }),
        setNext: (next) => {
            this.nextMiddleware = next;
        }
    };
}
exports.DebugMiddleware = DebugMiddleware;
//# sourceMappingURL=debugMiddleware.js.map