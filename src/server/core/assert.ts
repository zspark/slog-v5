import Logger from "./logger";

/*
AssertExist: (value: any | undefined | null, prefix: string = `[SLOG]`): void => {
if (!value) _Error("AssertExist failed!", prefix);
},
*/
export function AssertEqual(a: any, b: any): void {
    if (a !== b) Logger.Error(`AssertEqual failed. they are:`, a, b);
}
export function AssertTree(value: any): void {
    if (!value) Logger.Error(`AssertTree failed. value is falsy.`, value);
}
export function AssertFalse(value: any): void {
    if (!!value) Logger.Error(`AssertFalse failed. value is truy.`, value);
}
