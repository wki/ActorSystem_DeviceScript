import { Actor } from './actor';
import { IMessage } from './message';

export type Envelope = {
    sender: Actor,
    receiver: Actor,
    message: IMessage
}
