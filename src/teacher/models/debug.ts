/* eslint-disable @typescript-eslint/naming-convention */

export interface DebugRequest {
    assistant_id: string;
    error: string;
    code: string;
}

export interface DebugResponse {
    debug_id: string;
    token: string;
    complete_message: string;
    done: boolean;
}
