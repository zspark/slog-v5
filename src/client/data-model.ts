import { pid_t, wid_t, WIDGET_TYPE, page_property_t, widget_content_t, page_content_t } from "../common/types"
import Logger from "../common/logger"
import { EventPhase, event_feedback_t } from "./core/event-types"
import { EventHandler } from "./core/event"
import ServerProxy from "./core/server-proxy";

export interface PageEventMap {
    'pagelist-fetch-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly arrPageProperty?: Array<page_property_t>;
    },
    'page-add-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly pageProperty?: page_property_t;
    },
    'page-delete-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly id: pid_t;
    },
    'page-update-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly pageProperty: page_property_t;
    },
    'page-fetch-event': {
        readonly phase: EventPhase;
        feedback?: event_feedback_t;
        readonly id: pid_t;
        readonly property?: page_property_t;
        readonly content?: page_content_t;
    },
    'widget-add-event': {
        phase: EventPhase;
        feedback?: event_feedback_t;
        readonly pid: pid_t;
        readonly type: WIDGET_TYPE,
        readonly index: number,
        readonly data?: widget_content_t;
    },
    'widget-update-event': {
        phase: EventPhase;
        feedback?: event_feedback_t;
        pid: pid_t;
        data: widget_content_t;
    },
    'widget-delete-event': {
        phase: EventPhase;
        pid: pid_t;
        wid: wid_t;
        feedback?: event_feedback_t;
    },

}

const _eh = new EventHandler<PageEventMap>();
const _mapWidPid: Record<wid_t, pid_t> = {};

/**
 * data:[{page_property_t},{},..]
 */
export function FetchPagelist(): void {
    ServerProxy.GetPageList().then((data) => {
        if (data) {
            _eh.Dispatch('pagelist-fetch-event', { phase: EventPhase.BEFORE_RESPOND });
            _eh.Dispatch('pagelist-fetch-event', { phase: EventPhase.RESPOND, arrPageProperty: data });
            _eh.Dispatch('pagelist-fetch-event', { phase: EventPhase.AFTER_RESPOND });
        }
    });
}

export function AddPage(): void {
    ServerProxy.AddPage().then((value) => {
        if (value) {
            _eh.Dispatch('page-add-event', { phase: EventPhase.BEFORE_RESPOND });
            _eh.Dispatch('page-add-event', { phase: EventPhase.RESPOND, pageProperty: value });
            _eh.Dispatch('page-add-event', { phase: EventPhase.AFTER_RESPOND });
        }
    });
}

export function DeletePage(id: pid_t): void {
    ServerProxy.DeletePage(id).then(_ => {
        _eh.Dispatch('page-delete-event', { phase: EventPhase.BEFORE_RESPOND, id });
        _eh.Dispatch('page-delete-event', { phase: EventPhase.RESPOND, id });
        _eh.Dispatch('page-delete-event', { phase: EventPhase.AFTER_RESPOND, id });
    });
}

export function UpdatePage(pp: page_property_t): void {
    ServerProxy.UpdatePage(pp).then((info) => {
        _eh.Dispatch('page-update-event', { phase: EventPhase.BEFORE_RESPOND, pageProperty: pp });
        _eh.Dispatch('page-update-event', { phase: EventPhase.RESPOND, pageProperty: pp });
        _eh.Dispatch('page-update-event', { phase: EventPhase.AFTER_RESPOND, pageProperty: pp });
    });
}

export function FetchPage(id: pid_t): void {
    ServerProxy.GetPage(id).then((data) => {
        if (data) {
            const pid: pid_t = id;
            data.content.indexes.forEach(wid => {
                _mapWidPid[wid] = pid;
            });
            _eh.Dispatch('page-fetch-event', { phase: EventPhase.BEFORE_RESPOND, id, content: data.content, property: data.property });
            _eh.Dispatch('page-fetch-event', { phase: EventPhase.RESPOND, id, content: data.content, property: data.property });
            _eh.Dispatch('page-fetch-event', { phase: EventPhase.AFTER_RESPOND, id, content: data.content, property: data.property });
        }
    });
}

export function AddWidget(pid: pid_t, type: WIDGET_TYPE, index: number): void {
    ServerProxy.AddWidget(pid, type, index).then((value) => {
        if (value) {
            _mapWidPid[value.widgetContent.id] = pid;
            const _tmp: PageEventMap['widget-add-event'] = { phase: EventPhase.UNKNOWN, pid, type, index, data: value?.widgetContent };
            for (let i = EventPhase.BEFORE_RESPOND; i <= EventPhase.AFTER_RESPOND; ++i) {
                _tmp.phase = i;
                _eh.Dispatch('widget-add-event', _tmp);
            }
        }
    });
}

export function UpdateWidget(pid: pid_t, wc: widget_content_t): void {
    ServerProxy.UpdateWidget(pid, wc).then((value) => {
        const _tmp: PageEventMap['widget-update-event'] = { phase: EventPhase.UNKNOWN, pid, data: wc };
        for (let i = EventPhase.BEFORE_RESPOND; i <= EventPhase.AFTER_RESPOND; ++i) {
            _tmp.phase = i;
            _eh.Dispatch('widget-update-event', _tmp);
        }
    });
}

export function DeleteWidget(pid: pid_t, wid: wid_t): void {
    ServerProxy.DeleteWidget(pid, wid).then((value) => {
        const _tmp: PageEventMap['widget-delete-event'] = { phase: EventPhase.UNKNOWN, pid, wid };
        for (let i = EventPhase.BEFORE_RESPOND; i <= EventPhase.AFTER_RESPOND; ++i) {
            _tmp.phase = i;
            _eh.Dispatch('widget-delete-event', _tmp);
        }
    });
}

export function GetPidOfWidBelongs(wid: wid_t): pid_t | undefined {
    return _mapWidPid[wid];
}

const Subscribe = _eh.Subscribe.bind(_eh);
const Unsubscribe = _eh.Unsubscribe.bind(_eh);
const Dispatch = _eh.Dispatch.bind(_eh);
export { Subscribe, Unsubscribe, Dispatch }


/*
_eh.Dispatch('page', { phase: EventPhase.BEFORE_REQUEST, feedback });
_eh.Dispatch('page', { phase: EventPhase.BEFORE_RESPOND, feedback });
_eh.Dispatch('page', { phase: EventPhase.RESPOND, feedback });
_eh.Dispatch('page', { phase: EventPhase.AFTER_RESPOND, feedback });
_eh.Dispatch('page', { phase: EventPhase.AFTER_REQUEST, feedback });
*/
