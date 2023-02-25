import * as QUERYSTRING from "querystring"
//import * as ParseURL from "parseurl"
//import * as URL from "url"

export function BindFunction(fn: Function, defaultValue: any): Function {
    return function(param: any) {
        return fn(param, defaultValue);
    };
}

export function BindFunction_reserve2(fn: Function, defaultValue: any): Function {
    return function(p1: any, p2: any) {
        return fn(p1, p2, defaultValue);
    };
}

export function CheckFileNameLegality(fileName: string): boolean {
    let _arr = fileName.match(/^\w[\w\.-]*\w$/g);
    if (_arr == null) return false;
    return _arr[0] == fileName;
};

/*
export function GetQueryValues(req: Request, out: Object): boolean {
    const url: URL = ParseURL(req);
    console.log(url);
    if (url.query) {
        const _q = QUERYSTRING.parse(url.query);
        out.fileName = _q['n'];
        out.command = _q['cmd'];
        out.tagName = _q['c'];
        out.module = _q['m'];
        out.action = _q['a'];
        return true;
    }
    return false;
};

export function GetQueryValue(req: Request, key: string): string | undefined {
    const url: URL = ParseURL(req);
    if (url.query) {
        const query = QUERYSTRING.parse(url.query);
        return query[key] || undefined;
    }
    return;
};
*/

export function MakeLoginURL(): string {
    let _query = "/login";
    return _query;
};

export function MakeArticleURL(fileName: string): string {
    let _obj = {
        "n": fileName,
    };
    let _query = "/view?" + QUERYSTRING.stringify(_obj);
    return _query;
};

export function MakeHomeURL(): string {
    let _query = "/";
    return _query;
};

export function MakeEditURL(fileName: string): string {
    let _obj = {
        "n": fileName,
    };
    let _query = "/edit?" + QUERYSTRING.stringify(_obj);
    return _query;
};

export function MakeViewURL(fileName: string): string {
    let _obj = {
        "n": fileName,
    };
    let _query = "/view?" + QUERYSTRING.stringify(_obj);
    return _query;
};

export function MakeLoginWithViewURL(fileName: string): string {
    let _obj = {
        "n": fileName,
    };
    let _query = "/login?" + QUERYSTRING.stringify(_obj);
    return _query;
};

export function CheckLogin(req: any): boolean {
    if (req.signedCookies) {
        return (req.signedCookies.id) ? true : false;
    }
    return false;
};

export function GetUserAccount(req: any): string | undefined {
    return req.signedCookies?.id;
};

/*
export function SetCookie(req: Request, key: string, value: string): void {
    req.signedCookies[key] = value;
};

export function GetClientIP(req: Request): any {
    return req.connection.remoteAddress;
}

export function GetClientPort(req): any {
    return req.connection.remotePort;
}

export function GetCookie(req, key): any {
    return req.signedCookies[key];
};

export function SetValueIfNull(target, defaultValue) {
    target = target || defaultValue;
};

export function CreateProperty(obj, p, v, w, c, e) {
    Object.defineProperty(obj, p, {
        value: v,
        writable: w,
        configurable: c,
        enumerable: e
    });
}

export function CheckInvalid(obj): boolean {
    return obj == null || obj == undefined;
}
*/

//import * as TypeCheck from "./type-check"

export function EraseValueFromArray<T>(arr: Array<T>, value: T): boolean {
    let _i = arr.indexOf(value);
    if (_i >= 0) {
        arr.splice(_i, 1);
        return true;
    }
    return false;
};

export function Clamp<T>(min: T, max: T, v: T): T {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

export function SameValue(a: Object | undefined, b: Object | undefined): boolean {
    /// TODO:
    return true;
    /*
    if (!a || !b) return false;
    return Object.keys(a).every((k: string): boolean => {
        return a[k] === b[k];
    });
    */
}

/*
export function SameObject(a: Object | undefined, b: Object | undefined): boolean {
    if (!a || !b) return false;
    return Object.keys(a).every((k: string): boolean => {
        let _a = a[k];
        if (TypeCheck.IsArray(_a)) {
            return SameArray(_a, b[k]);
        }
        else if (TypeCheck.IsMap(_a)) {
            return SameMap(_a, b[k]);
        }
        else if (TypeCheck.IsObject(_a)) {
            return SameObject(_a, b[k]);
        } else {
            return a[k] === b[k];
        }
    });
}

export function SameArray<T>(a: Array<T> | undefined, b: Array<T> | undefined): boolean {
    if (!a || !b) return false;
    //const _N: number = a.length;
    //if (_N !== b.length) return false;
    //for (let i = 0; i < _N; ++i) {
    //    if (a[i] !== b[i]) return false;
    //}
    if (a.length !== b.length) return false;
    return a.every((k: T, idx: number): boolean => {
        return b[idx] === k;
    });
}

export function SameMap<K, V>(a: Map<K, V> | undefined, b: Map<K, V> | undefined): boolean {
    if (!a || !b) return false;
    if (a.size !== b.size) return false;

    const _it: IterableIterator<K> = a.keys();
    let _itObj: IteratorResult<K, any> = _it.next();
    while (!_itObj.done) {
        if (a.get(_itObj.value) !== b.get(_itObj.value)) return false;
        _itObj = _it.next();
    }
    return true;
}
*/


// return "yyyy-mm-dd"
export function Date2InputDateValue(d: Date): string {
    let _tmp = d.toJSON();
    return _tmp.slice(0, 10);
}

export function DefineProperty(o: object, p: string, v: any, w: boolean, e: boolean, c: boolean): void {
    Object.defineProperty(o, p, { value: v, writable: w, enumerable: e, configurable: c });
}
export function DefineEnumProperty(o: object, p: any, v: boolean): void {
    DefineProperty(o, p, v, false, true, false);
}
export function DefineFixedProperty(o: object, p: any, v: boolean): void {
    DefineProperty(o, p, v, false, false, false);
}

