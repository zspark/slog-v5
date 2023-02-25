
export class EventDispatcher<T> {
    constructor(private mapSubscriber: Map<keyof T, Array<Function>>) { }

    Dispatch<K extends keyof T>(type: K, evt: T[K]): boolean {
        let _arr: Array<Function> | undefined = this.mapSubscriber.get(type);
        if (_arr) {
            for (let i = 0, N = _arr.length; i < N; ++i) {
                _arr[i](evt);
            }
            return true;
        }
        return false;
    }
}

export class EventListener<T> {
    constructor(private mapSubscriber: Map<keyof T, Array<Function>>) { }

    Subscribe<K extends keyof T>(type: K, func: (evt: T[K]) => void): boolean {
        let _arr: Array<Function> | undefined = this.mapSubscriber.get(type);
        if (_arr) {
            const _index = _arr.indexOf(func);
            if (_index < 0) _arr.push(func);
            else return false;
        } else {
            this.mapSubscriber.set(type, [func]);
        }
        return true;
    }

    Unsubscribe<K extends keyof T>(type: K, func: (evt: T[K]) => void): boolean {
        let _arr: Array<Function> | undefined = this.mapSubscriber.get(type);
        if (_arr) {
            let _i: number = _arr.indexOf(func);
            if (_i >= 0) {
                _arr.splice(_i, 1);
                return true;
            }
        }
        return false;
    }
}

export class EventHandler<T> {
    private _mapSubscriber = new Map<keyof T, Array<Function>>();
    private _dispatcher: EventDispatcher<T>;
    private _listener: EventListener<T>;

    constructor() {
        this._dispatcher = new EventDispatcher<T>(this._mapSubscriber);
        this._listener = new EventListener<T>(this._mapSubscriber);
    }

    Dispatch<K extends keyof T>(type: K, evt: T[K]): boolean {
        return this._dispatcher.Dispatch(type, evt);
    }
    Subscribe<K extends keyof T>(type: K, func: (evt: T[K]) => void): boolean {
        return this._listener.Subscribe(type, func);
    }
    Unsubscribe<K extends keyof T>(type: K, func: (evt: T[K]) => void): boolean {
        return this._listener.Unsubscribe(type, func);
    }
    Release(): void {
        this._mapSubscriber.clear();
    }
    Clear(): void {
        this._mapSubscriber.clear();
    }
}

