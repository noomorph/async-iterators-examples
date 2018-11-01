import * as readline from "readline";
import {ReadlineAsyncIterator} from "./ReadlineAsyncIterator";

export class StreamReadlineAsyncIterator extends ReadlineAsyncIterator {
    constructor(
        protected readonly stream: NodeJS.ReadableStream,
    ) {
        super(readline.createInterface({
            input: stream,
            terminal: false,
        }));

        this.onStreamError = this.onStreamError.bind(this);
        stream.on('error', this.onStreamError);
    }

    protected onStreamError(e: any) {
        if (this.nextValue) {
            this.nextValue.reject(e);
            this.nextValue = null;
        } else {
            this.errors.push(e);
        }
    }

    public async dispose(): Promise<void> {
        this.stream.pause();
        await super.dispose();
    }
}
