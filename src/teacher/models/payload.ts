/* eslint-disable @typescript-eslint/naming-convention */
import InitPayload from "./init";
import { DebugRequest, DebugResponse } from "./debug";

export enum PayloadType {
    init,
    newChat,
    userMessage,
    assistantMessage,
    genericError,
    validationError,
    debugRequest,
    authorizationError,
    debugResponse
}

export enum MessageOrigin {
    server,
    client
}


export default interface Payload {
    sequence_id: string;
    type: PayloadType;
    origin: MessageOrigin;
    created_at: number;
    payload: InitPayload | DebugRequest | DebugResponse;
};
