import { pid_t } from "../common/types"
import { EventHandler } from "./core/event"
import { EventPhase, event_feedback_t } from "./core/event-types"
import * as Utils from "./utils"
import Logger from "../common/logger"
function AppendHistoryPage(pid: pid_t, title: string): void {
    /*
    const _idx = _arrHistoryPid.indexOf(pid);
    if (_idx > 0) {
        _arrHistoryPid.splice(_idx, 1);
    }

    if (_idx != 0) {
        _arrHistoryPid.unshift(pid);

        _eh.Dispatch('nav-history-appended-event', { phase: EventPhase.BEFORE_RESPOND, pid, title });
        _eh.Dispatch('nav-history-appended-event', { phase: EventPhase.RESPOND, pid, title });
        _eh.Dispatch('nav-history-appended-event', { phase: EventPhase.AFTER_RESPOND, pid, title });
    }
    */
}


export default { AppendHistoryPage }

