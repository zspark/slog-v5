import Logger from "./logger";
export default function DynamicImport(url: string): Promise<any> {
    return import(url).then((module: any): any => {
        return module;
    }, (_) => {
        Logger.Warn(`[SLOG] can NOT load file dynamically: ${url}`);
        return null;
    });
}
