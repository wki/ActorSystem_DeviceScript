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

interface Benchmark extends IMessage {
    type: 'Benchmark',
    count?: number
}

interface Finish extends IMessage {
    type: 'Finish',
    durationMs: number
}

type MyMessage = Ping | Pong

const BENCHMARK_COUNT = 20_000;

class Sender extends Actor {
    private start: number = 0;

    constructor(private receiver: Actor) {
        super();
        this.tell(receiver, <Ping>{type: 'Ping', text: 'hi'});
    }

    protected override async onReceive(message: IMessage): Promise<void> {
        // console.log('Sender received: ', message);

        if (message.type === 'Benchmark') {
            console.log('benchmarking...');
            this.start = Date.now();
            for (var i= 1; i <= BENCHMARK_COUNT; i++)
                this.tell(receiver, <Benchmark>{type: 'Benchmark', count: i});
            console.log('benchmark sending done');
        } else if (message.type === 'Finish') {
            let duration = Date.now() - this.start;
            let thruput = parseInt('' + BENCHMARK_COUNT/(duration/1000));
            console.log(`Sending ${BENCHMARK_COUNT} messages took ${duration}ms (${thruput} msgs/s)`);
        } else if (message.type === 'Pong') {
            console.log('Sender received Pong');
        }

        await (async () => {})();
    }
}

class Receiver extends Actor {
    protected override async onReceive(message: IMessage): Promise<void> {
        if (message.type === 'Ping') {
            console.log('Receiver received: ', message);
            this.reply(<Pong>{type: 'Pong', text: 'also hi'});
        } else if (message.type === 'Benchmark') {
            if ((<Benchmark>message).count === BENCHMARK_COUNT) {
                this.reply(<Finish>{type: 'Finish'});
            }
        }

        await (async () => {})();
    }
}

console.log('About to start');

let receiver = new Receiver();
let sender = new Sender(receiver);

// start Benchmark after 500ms
setTimeout(() => {sender.tell(sender, <Benchmark>{type: 'Benchmark'})}, 500);

// keep system running for 10 seconds
setTimeout(() => {console.log('All Done')}, 10_000);
