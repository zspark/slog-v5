export interface ICollectionItem<K> {
    readonly id: K
}

export type foreach_func_t<V> = (v: V, i: number) => boolean;

export class Collection<K, V extends ICollectionItem<K>> {
    private _arr: Array<V> = [];
    private _map = new Map<K, V>();

    constructor() { }
    private _MoveToIndex(value: V, oldIndex: number, newIndex: number): number {
        if (oldIndex >= 0) {
            newIndex = Math.max(0, newIndex);
            if (oldIndex === newIndex) return oldIndex;
            this._arr.splice(oldIndex, 1);
            this._arr.splice(newIndex, 0, value);
            return this._arr.indexOf(value);
        }
        return -1;
    }

    private _Insert(value: V, index: number): boolean {
        const _idx = this._arr.indexOf(value);
        if (_idx >= 0) return false;
        index = Math.max(0, index);
        this._arr.splice(index, 0, value);
        this._map.set(value.id, value);
        return true;
    }

    private _Remove(value: V | undefined): boolean {
        if (!value) return false;
        const _i = this._arr.indexOf(value);
        if (_i >= 0) {
            this._arr.splice(_i, 1);
            this._map.delete(value.id);
            return true;
        }
        return false;
    }


    /**
     * index<=0 -> index of 0;
     * index>=array.length -> index of array.length;
     */
    Insert(value: V, index: number = Number.MAX_SAFE_INTEGER): boolean {
        return this._Insert(value, index);
    };

    InsertBefore(value: V, E: V): boolean {
        const _idx = this._arr.indexOf(E);
        if (_idx >= 0) {
            return this._Insert(value, _idx);
        }
        return false;
    };

    InsertAfter(value: V, E: V): boolean {
        const _idx = this._arr.indexOf(E);
        if (_idx >= 0) {
            return this._Insert(value, _idx + 1);
        }
        return false;
    };

    Remove(value: V): boolean {
        return this._Remove(value);
    };

    RemoveByKey(key: K): boolean {
        return this._Remove(this._map.get(key));
    };

    RemoveByIndex(index: number): boolean {
        const _value = this._arr[index];
        return this._Remove(_value);
    };

    Clear(): void {
        this._arr.length = 0;
        this._map.clear();
    };

    GetByIndex(index: number): V {
        return this._arr[index];
    };

    GetByKey(key: K): V | undefined {
        return this._map.get(key);
    };

    IndexOf(value: V): number {
        return this._arr.indexOf(value);
    };

    MoveToIndex(value: V, index: number): number {
        const _index = this._arr.indexOf(value);
        return this._MoveToIndex(value, _index, index);
    };

    MoveUp(value: V): number {
        const _index = this._arr.indexOf(value);
        return this._MoveToIndex(value, _index, _index - 1);
    };

    MoveDown(value: V): number {
        const _index = this._arr.indexOf(value);
        return this._MoveToIndex(value, _index, _index + 1);
    };

    Has(value: V): boolean {
        return this._map.has(value.id);
    };

    HasKey(key: K): boolean {
        return this._map.has(key);
    };

    ForEach(fn: foreach_func_t<V>, thisArg: any): void {
        for (let i = 0, N = this._arr.length; i < N; ++i) {
            if (fn.call(thisArg, this._arr[i], i)) break;
        }
    };

    ForEachInverse(fn: foreach_func_t<V>, thisArg: any): void {
        for (let i = this._arr.length - 1; i >= 0; --i) {
            if (fn.call(thisArg, this._arr[i], i)) break;
        }
    };

    get length(): number { return this._arr.length; };

    DebugPrint(msg: string): void {
        console.group(msg);
        for (let i = 0, N = this._arr.length; i < N; ++i) {
            console.log('key:', this._arr[i]);
        }
        console.groupEnd();
    }
}
