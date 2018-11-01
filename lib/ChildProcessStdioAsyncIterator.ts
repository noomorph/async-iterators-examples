import {ChildProcess} from "child_process";
import {StreamReadlineAsyncIterator} from "./StreamReadlineAsyncIterator";

export class ChildProcessStdioAsyncIterator extends StreamReadlineAsyncIterator {
    constructor(
        protected readonly process: ChildProcess,
        protected streamName: 'stdout' | 'stderr',
    ) {
        super(process[streamName]);
    }

    public async dispose(): Promise<void> {
        this.process.kill();
        await super.dispose();
    }
}
