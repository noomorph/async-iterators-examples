import {Deferred} from "./utils/Deferred";
import {IAsyncDisposable} from "./types/IAsyncDisposable";
import {TimeoutAsyncIteratorOptions} from "./types/TimeoutAsyncIteratorOptions";

export class TimeoutAsyncIterator<T> implements AsyncIterableIterator<T> {
    private _deferred?: Deferred<void>;
    private _timeoutHandle?: any;

    constructor(
        protected readonly options: TimeoutAsyncIteratorOptions,
        protected readonly iterator: AsyncIterableIterator<T> & IAsyncDisposable,
    ) {}

    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this;
    }

    async next(value?: any): Promise<IteratorResult<T>> {
        try {
            this._deferred = new Deferred();
            this._timeoutHandle = setTimeout(this._deferred.reject, this.options.timeout, this.options.timeoutError);

            const result = await Promise.race([this.iterator.next(value), this._deferred.promise]);
            clearTimeout(this._timeoutHandle);

            return result || { done: true, value: undefined as any };
        } catch (e) {
            if (e === this.options.timeoutError) {
                await this.iterator.dispose();
            }

            throw e;
        }
    }

    async return(): Promise<IteratorResult<T>> {
        if (this._deferred) {
            this._deferred.resolve(void 0);
        }

        clearTimeout(this._timeoutHandle);
        await this.iterator.dispose();
        return { done: true, value: undefined as any };
    }
}
