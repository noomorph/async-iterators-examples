function noop() {}

export class Deferred<T = any> {
    public readonly promise: Promise<T>;
    public resolve: (value: T) => any;
    public reject: (value: any) => any;

    constructor() {
        this.resolve = noop;
        this.reject = noop;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
