import { Actor } from './actor';

export class ActorSystem extends Actor {
    protected onReceive(message: any): Promise<void> {
        return Promise.resolve(undefined);
    }
}