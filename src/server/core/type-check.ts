export function IsArray(value: any): boolean { return value && value instanceof Array; }
export function IsMap(value: any): boolean { return value && value instanceof Map; }
export function IsPromise(value: any): boolean { return value && value instanceof Promise; }
export function IsInstanceOf(value: any, cls: any): boolean { return value && value instanceof cls; }
export function IsDomElement(value: any): boolean { return value && value instanceof Element; }

export function IsFunction(value: any): boolean { return typeof value === 'function'; }
export function IsClass(value: any): boolean { return typeof value === 'function'; }
export function IsString(value: any): boolean { return typeof value === 'string'; }
export function IsNumber(value: any): boolean { return typeof value === 'number'; }
export function IsBoolean(value: any): boolean { return typeof value === 'boolean'; }
export function IsObject(value: any): boolean { return (typeof value === 'object') && (value instanceof Object); }

