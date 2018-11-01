import * as readline from "readline";
import {Deferred} from "./utils/Deferred";
import {IAsyncDisposable} from "./types/IAsyncDisposable";

export class ReadlineAsyncIterator implements AsyncIterableIterator<string>, IAsyncDisposable {
    protected bufferedLines: string[] = [];
    protected errors: string[] = [];
    protected closed: boolean = false;
    protected nextValue: Deferred<string | null> | null = null;

    constructor(
        protected readonly rl: readline.ReadLine
    ) {
        this.onLine = this.onLine.bind(this);
        this.onReadlineClose = this.onReadlineClose.bind(this);

        this.rl = rl
            .on('line', this.onLine)
            .on('close', this.onReadlineClose);
    }

    protected onLine(line: string) {
        if (this.nextValue) {
            this.nextValue.resolve(line);
            this.nextValue = null;
        } else {
            this.bufferedLines.push(line);
        }
    }

    protected onReadlineClose() {
        this.closed = true;

        if (this.nextValue) {
            this.nextValue.resolve(null);
            this.nextValue = null;
        }
    }

    protected isDone(): boolean {
        return this.bufferedLines.length === 0 && this.errors.length === 0 && this.closed;
    }

    public [Symbol.asyncIterator]() {
        return this;
    }

    public async next(): Promise<IteratorResult<string>> {
        try {
            const result = await this._doNext();
            return result;
        } catch (e) {
            await this.dispose();
            throw e;
        }
    }

    private _doNext(): Promise<IteratorResult<string>> {
        if (this.isDone()) {
            return Promise.resolve({ value: '', done: true });
        }

        const value = this.bufferedLines.shift();
        if (value !== void 0) {
            return Promise.resolve({ value, done: false });
        }

        const error = this.errors.shift();
        if (error !== void 0) {
            return Promise.reject(error);
        }

        this.nextValue = this.nextValue || new Deferred();
        return this.nextValue.promise.then((value) => {
            if (value === null) {
                return { value: '', done: true };
            }

            return ({
                value,
                done: false,
            });
        });
    }

    public async return(): Promise<IteratorResult<string>> {
        await this.dispose();
        return { value: '', done: true };
    }

    public async dispose(): Promise<void> {
        this.rl.close();
    }
}
