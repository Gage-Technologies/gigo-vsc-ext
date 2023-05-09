/* eslint-disable @typescript-eslint/naming-convention */

export interface InitPayloadAssistant {
    _id: string;
    name: string;
    description: string;
}

export default interface InitPayload {
    epoch: number;
    node_id: string;
    assistants: InitPayloadAssistant[];
}
