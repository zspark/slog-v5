import { pid_t, page_property_t } from "../common/types"
import { EventHandler } from "./core/event"
import { EventPhase, event_feedback_t } from "./core/event-types"
import * as Utils from "./utils"
import Logger from "../common/logger"
import * as DataModel from "./data-model"

export interface NavEventMap {
    'nav-clicked-event': {
        readonly phase: EventPhase;
        readonly pid: pid_t;
    },
    'nav-history-appended-event': {
        readonly phase: EventPhase;
        readonly historyList: Array<page_property_t>;
    },
}
const _eh = new EventHandler<NavEventMap>();
const _arrHistoryPid: Array<page_property_t> = [];

DataModel.Subscribe('page-fetch-event', (evt: DataModel.PageEventMap['page-fetch-event']) => {
    switch (evt.phase) {
        case EventPhase.BEFORE_RESPOND:
            const _property = evt.property as page_property_t;
            AppendHistoryPage(_property);
            break;
    }
});
DataModel.Subscribe('pagelist-fetch-event', (evt: DataModel.PageEventMap['pagelist-fetch-event']) => {
    switch (evt.phase) {
        case EventPhase.BEFORE_RESPOND:
            break;
    }
});


function AppendHistoryPage(pp: page_property_t): void {
    let _idx = -1;
    for (let i = 0, N = _arrHistoryPid.length; i < N; ++i) {
        if (_arrHistoryPid[i].id === pp.id) {
            _idx = i;
            break;
        }
    }
    if (_idx > 0) {
        _arrHistoryPid.splice(_idx, 1);
    }

    if (_idx != 0) {
        _arrHistoryPid.unshift(pp);

        _eh.Dispatch('nav-history-appended-event', { phase: EventPhase.BEFORE_RESPOND, historyList: _arrHistoryPid });
        _eh.Dispatch('nav-history-appended-event', { phase: EventPhase.RESPOND, historyList: _arrHistoryPid });
        _eh.Dispatch('nav-history-appended-event', { phase: EventPhase.AFTER_RESPOND, historyList: _arrHistoryPid });
    }
}


const Subscribe = _eh.Subscribe.bind(_eh);
const Unsubscribe = _eh.Unsubscribe.bind(_eh);
//const Dispatch = _eh.Dispatch.bind(_eh);
export default { Subscribe, Unsubscribe }

