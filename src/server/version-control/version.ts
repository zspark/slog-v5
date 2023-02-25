export type version_t = {
    major: number,
    minor: number,
    patch: number,
    build: number,
}

export function MakeVersion(m: number, n: number, p: number, b: number): version_t {
    return {
        major: m,
        minor: n,
        patch: p,
        build: b
    }
}

export function GetVersionString(v: version_t, detail: number = -1): string {
    if (detail === 1) {
        return `v${v.major}`;
    } else if (detail === 2) {
        return `v${v.major}.${v.minor}`;
    } else if (detail === 3) {
        return `v${v.major}.${v.minor}.${v.patch}`;
    }
    return `v${v.major}.${v.minor}.${v.patch}.${v.build}`;
}
