// import * as ds from "@devicescript/core"
import { Envelope } from './envelope';
import { IMessage } from './message';
import { ActorState } from './actor-state';

export abstract class Actor {
    private processor?: NodeJS.Timeout = undefined;
    private state: ActorState = ActorState.Idle;
    private messages: Envelope[] = [];
    protected currentlyProcessing?: Envelope;
    protected sender: Actor = NullActor.Instance;

    constructor() {
    }

    public tell(receiver: Actor, message: IMessage) {
        receiver.addEnvelope({sender: this, receiver, message});
    }

    protected reply(message: IMessage) {
        this.sender.addEnvelope({sender: this, receiver: this.sender, message})
    }

    protected forward(receiver: Actor) {
        receiver.addEnvelope({sender: this.sender, receiver, message: this.currentlyProcessing!.message});
    }

    private addEnvelope(envelope: Envelope) {
        this.messages.push(envelope);
        this.ensureMessageProcessing();
    }

    private ensureMessageProcessing() {
        if (this.messages.length > 0 && this.processor == undefined && this.state === ActorState.Idle) {
            this.processor = setTimeout(this.processMessage.bind(this), 0);
        }
    }

    private async processMessage() {
        this.processor = undefined;

        if (this.messages.length > 0) {
            this.state = ActorState.Processing;
            this.currentlyProcessing = this.messages.shift();
            this.sender = this.currentlyProcessing!.sender;

            try {
                await this.onReceive(this.currentlyProcessing!.message);
            }
            catch (e) {
                this.state = ActorState.ErrorHandling;
                // TODO: call OnError Hook
                // decide if restart possible (maybe delay)
                // TODO: call Restart Hook
            }

            this.state = ActorState.Idle;
            this.currentlyProcessing = undefined;
            this.sender = NullActor.Instance;

            this.ensureMessageProcessing();
        }
    }

    protected abstract onReceive(message: any): Promise<void>;
}

export class NullActor extends Actor {
    public static Instance: NullActor;

    protected override async onReceive(message: any): Promise<void> {
        await (async () => {})();
    }
}

NullActor.Instance ??= new NullActor();

