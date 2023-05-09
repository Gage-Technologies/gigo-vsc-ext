"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageOrigin = exports.PayloadType = void 0;
var PayloadType;
(function (PayloadType) {
    PayloadType[PayloadType["init"] = 0] = "init";
    PayloadType[PayloadType["newChat"] = 1] = "newChat";
    PayloadType[PayloadType["userMessage"] = 2] = "userMessage";
    PayloadType[PayloadType["assistantMessage"] = 3] = "assistantMessage";
    PayloadType[PayloadType["genericError"] = 4] = "genericError";
    PayloadType[PayloadType["validationError"] = 5] = "validationError";
    PayloadType[PayloadType["debugRequest"] = 6] = "debugRequest";
    PayloadType[PayloadType["authorizationError"] = 7] = "authorizationError";
    PayloadType[PayloadType["debugResponse"] = 8] = "debugResponse";
})(PayloadType = exports.PayloadType || (exports.PayloadType = {}));
var MessageOrigin;
(function (MessageOrigin) {
    MessageOrigin[MessageOrigin["server"] = 0] = "server";
    MessageOrigin[MessageOrigin["client"] = 1] = "client";
})(MessageOrigin = exports.MessageOrigin || (exports.MessageOrigin = {}));
;
//# sourceMappingURL=payload.js.map