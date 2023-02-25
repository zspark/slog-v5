const STACK_LINE_REGEX: RegExp = /(\d+):(\d+)\)?$/;

const _systemError = Error;

function _Error(msg: string, prefix: string = `[SLOG]`): void {
    let _lineNumber: number = -1;
    const stacks: string[] | undefined = new _systemError().stack?.split("\\n");
    if (stacks) {
        const _res: RegExpExecArray | null = STACK_LINE_REGEX.exec(stacks[2]);
        if (_res && _res.length > 1) {
            _lineNumber = Number.parseInt(_res[1]);
        }
    }

    console.error(`${prefix} at line:${_lineNumber}: ${msg}`);
}
export default {
    /*
    Error: _Error,
    Warn: (msg: string, prefix: string = `[SLOG]`): void => {
        console.warn(`${prefix} ${msg}`);
    },
    Info: (msg: string, prefix: string = `[SLOG]`): void => {
        console.info(`${prefix} ${msg}`);
    },
    Debug: (msg: string, prefix: string = `[SLOG]`): void => {
        console.debug(`${prefix} ${msg}`);
    },
    */
    Error: console.debug.bind(undefined, '[SLOG-error]'),
    Warn: console.debug.bind(undefined, '[SLOG-warn]'),
    Info: console.debug.bind(undefined, '[SLOG-info]'),
    Debug: console.debug.bind(undefined, '[SLOG-debug]'),
}
