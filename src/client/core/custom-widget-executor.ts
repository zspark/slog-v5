import { widget_content_t } from "../../common/types"
import Logger from "../../common/logger"

export default function(target: HTMLElement, wc: widget_content_t): boolean {
    const _fn = new Function('target', 'data', wc.data.action);
    try {
        _fn(target, wc.data);
        return true;
    } catch (e: any) {
        Logger.Error(`custom code executing error.\n`, e);
        target.innerText = `${e.message}
[SLOG] more information please consult console.`;
        return false;
    }
}
