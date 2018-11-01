export interface IAsyncDisposable {
    dispose(): Promise<any>;
}
