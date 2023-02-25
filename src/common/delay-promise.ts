function _f(_: any): void { }
export default class DelayPromise<T> {
    private _resovleFn: (data: T | PromiseLike<T>) => void;
    private _rejectFn: (reason: any) => void;
    private _promise: Promise<T>;

    constructor() {
        this._resovleFn = _f;
        this._rejectFn = _f;
        this._promise = new Promise<T>((resolve: any, reject: any): void => {
            this._resovleFn = resolve;
            this._rejectFn = reject;
        });
    }
    Resolve(data: T | PromiseLike<T>): void {
        this._resovleFn(data);
    }
    Reject(reason: any): void {
        this._rejectFn(reason);
    }
    get promise(): Promise<T> {
        return this._promise;
    }
    Destroy(): void {
        this._resovleFn = _f;
        this._rejectFn = _f;
    }
}
