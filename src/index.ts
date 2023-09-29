import { Actor } from './ActorSystem/actor';
import { IMessage } from './ActorSystem/message';

interface Ping extends IMessage {
    type: 'Ping',
    text: string
}

interface Pong extends IMessage {
    type: 'Pong',
    text: string
}

class Sender extends Actor {
    constructor(private receiver: Actor) {
        super();
        let x = {type: 'Ping', text: 'hi'};
        this.tell(receiver, <Ping>{type: 'Ping', text: 'hi'});
    }

    protected override async onReceive(message: IMessage): Promise<void> {
        console.log('Sender received: ', message);

        await (async () => {})();
    }
}

class Receiver extends Actor {
    constructor() {
        super();
    }

    protected override async onReceive(message: IMessage): Promise<void> {
        console.log('Receiver received: ', message);

        if (message.type === 'Ping') {
            this.reply(<Pong>{type: 'Pong', text: 'also hi'});
        }

        await (async () => {})();
    }
}

console.log('About to start');

let receiver = new Receiver();
let sender = new Sender(receiver);

setTimeout(() => {console.log('All Done')}, 2000);
