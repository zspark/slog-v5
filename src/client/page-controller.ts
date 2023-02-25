import { pid_t, wid_t, page_content_t, widget_content_t, page_property_t, WIDGET_TYPE, PANE_TYPE, WIDGET_ACTION } from "../common/types"
import Logger from "../common/logger"
import { EventPhase, event_feedback_t } from "./core/event-types"
import MenuUi from "./menu-ui"
import * as DataModel from "./data-model"
//import * as Utils from "./utils"
//import MarkdownParser from "./core/markdown-parser"
//import CodeExecutor from "./core/custom-widget-executor"

import {
    IHandler,
    IPropertyHandle,
    IMarkdownWidgetHandle,
    ICustomWidgetHandle
} from "./widget-handler"

function TryFetchPage(pid: pid_t): void {
    const feedback: event_feedback_t = { ok: true };
    DataModel.Dispatch('page-fetch-event', { phase: EventPhase.BEFORE_REQUEST, feedback, id: pid });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    DataModel.FetchPage(pid);
    DataModel.Dispatch('page-fetch-event', { phase: EventPhase.AFTER_REQUEST, id: pid });
}

function TryAddPage(): void {
    const feedback: event_feedback_t = { ok: true };
    DataModel.Dispatch('page-add-event', { phase: EventPhase.BEFORE_REQUEST, feedback });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    DataModel.AddPage();
    DataModel.Dispatch('page-add-event', { phase: EventPhase.AFTER_REQUEST });
}
function TryDeleteWidget(wid: wid_t): void {
    const pid = DataModel.GetPidOfWidBelongs(wid);
    if (!pid) return;
    const feedback: event_feedback_t = { ok: true };
    const _tmp: DataModel.PageEventMap['widget-delete-event'] = { phase: EventPhase.UNKNOWN, feedback, pid, wid };
    _tmp.phase = EventPhase.BEFORE_REQUEST;
    DataModel.Dispatch('widget-delete-event', _tmp);
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    DataModel.DeleteWidget(pid, wid);
    _tmp.phase = EventPhase.AFTER_REQUEST;
    DataModel.Dispatch('widget-delete-event', _tmp);
}
function TryDeletePage(id: pid_t): void {
    const feedback: event_feedback_t = { ok: true };
    DataModel.Dispatch('page-delete-event', { phase: EventPhase.BEFORE_REQUEST, feedback, id });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    DataModel.DeletePage(id);
    DataModel.Dispatch('page-delete-event', { phase: EventPhase.AFTER_REQUEST, id });
}

const _newFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (x: number, y: number, handler: IPropertyHandle) => {
        MenuUi.ShowMenuAt(x, y, (selectedType: WIDGET_TYPE): void => {
            if (selectedType !== WIDGET_TYPE.UNKNOWN) {
                TryAddWidget(handler.id, selectedType);
            }
        });
    },
    [WIDGET_TYPE.MARKDOWN]: (x: number, y: number, handler: IMarkdownWidgetHandle) => {
        MenuUi.ShowMenuAt(x, y, (selectedType: WIDGET_TYPE): void => {
            if (selectedType !== WIDGET_TYPE.UNKNOWN) {
                const _pid = DataModel.GetPidOfWidBelongs(handler.id);
                if (_pid) {
                    TryAddWidget(_pid, selectedType);
                }
            }
        });
    },
    [WIDGET_TYPE.CUSTOM]: (x: number, y: number, handler: ICustomWidgetHandle) => {
        MenuUi.ShowMenuAt(x, y, (selectedType: WIDGET_TYPE): void => {
            if (selectedType !== WIDGET_TYPE.UNKNOWN) {
                const _pid = DataModel.GetPidOfWidBelongs(handler.id);
                if (_pid) {
                    TryAddWidget(_pid, selectedType);
                }
            }
        });
    },
    [WIDGET_TYPE.TEMPLATE]: (_: IHandler) => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
    [WIDGET_TYPE.MATH]: () => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
}
const _saveFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (handler: IPropertyHandle) => { TryUpdatePageProperty(handler.GetData()); },
    [WIDGET_TYPE.MARKDOWN]: (handler: IMarkdownWidgetHandle) => { TryUpdateWidget(handler.GetContent()); },
    [WIDGET_TYPE.CUSTOM]: (handler: ICustomWidgetHandle) => { TryUpdateWidget(handler.GetContent()); },
    [WIDGET_TYPE.TEMPLATE]: (h: IHandler) => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
    [WIDGET_TYPE.MATH]: () => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
}
const _deleteFunc: Record<WIDGET_TYPE, Function> = {
    [WIDGET_TYPE.PROPERTY]: (handler: IPropertyHandle) => { TryDeletePage(handler.id); },
    [WIDGET_TYPE.MARKDOWN]: (handler: IMarkdownWidgetHandle) => { TryDeleteWidget(handler.id); },
    [WIDGET_TYPE.CUSTOM]: (handler: ICustomWidgetHandle) => { TryDeleteWidget(handler.id); },
    [WIDGET_TYPE.TEMPLATE]: (_: IHandler) => { },
    [WIDGET_TYPE.PAGE_NEW]: () => { },
    [WIDGET_TYPE.MATH]: () => { },
    [WIDGET_TYPE.UNKNOWN]: () => { },
}
function HandleMenuClick(menuName: string, x: number, y: number, handler: IPropertyHandle | IMarkdownWidgetHandle | ICustomWidgetHandle): void {
    switch (menuName) {
        case "new":
            _newFunc[handler.type](x, y, handler);
            break;
        case "toggle":
            handler.Toggle();
            break;
        case "preview":
            handler.ShowView();
            break;
        case "save":
            _saveFunc[handler.type](handler);
            break;
        case "delete":
            MenuUi.ShowComfirmAt(x, y, (state: number): void => {
                if (state > 0) {
                    _deleteFunc[handler.type](handler);
                }
            });
            break;
        case "template":
            break;
    }
    //const _pp = DataModel.GetActivedPageProperty();
    //if (_pp) {
    //}
}
function TryAddWidget(pid: pid_t, type: WIDGET_TYPE): void {
    const feedback: event_feedback_t = { ok: true };
    DataModel.Dispatch('widget-add-event', { phase: EventPhase.BEFORE_REQUEST, feedback, pid, type, index: 1 });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    DataModel.AddWidget(pid, type, 1);
    DataModel.Dispatch('widget-add-event', { phase: EventPhase.AFTER_REQUEST, pid, type, index: 1 });
}
function TryUpdateWidget(wc: Readonly<widget_content_t>): void {
    const pid = DataModel.GetPidOfWidBelongs(wc.id);
    if (pid) {
        const feedback: event_feedback_t = { ok: true };
        DataModel.Dispatch('widget-update-event', { phase: EventPhase.BEFORE_REQUEST, feedback, pid, data: wc });
        if (!feedback.ok) {
            Logger.Info(feedback.reason);
            //Messager.DisplayInfoToast(`all pages fetched.`);
            return;
        }
        DataModel.UpdateWidget(pid, wc);
        DataModel.Dispatch('widget-update-event', { phase: EventPhase.AFTER_REQUEST, pid, data: wc });
    }
}
function TryFetchPageList(): void {
    const feedback: event_feedback_t = { ok: true };
    DataModel.Dispatch('pagelist-fetch-event', { phase: EventPhase.BEFORE_REQUEST, feedback });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    DataModel.FetchPagelist();
    DataModel.Dispatch('pagelist-fetch-event', { phase: EventPhase.AFTER_REQUEST });
}

function TryUpdatePageProperty(pp: Partial<page_property_t>): void {
    if (!pp.id) return;
    const feedback: event_feedback_t = { ok: true };
    DataModel.Dispatch('page-update-event', { phase: EventPhase.BEFORE_REQUEST, feedback, pageProperty: (pp as page_property_t) });
    if (!feedback.ok) {
        Logger.Info(feedback.reason);
        //Messager.DisplayInfoToast(`all pages fetched.`);
        return;
    }
    /*
    pp.tags = pp.tags;
    pp.title = pp.title;
    pp.author = pp.author;
    pp.createTime = pp.createTime;
    pp.modifyTime = pp.modifyTime;
    pp.description = pp.description;
    */
    Object.keys(pp).forEach(k => {
        (pp as any)[k] = (pp as any)[k];
    });
    DataModel.UpdatePage(pp as page_property_t);
    DataModel.Dispatch('page-update-event', { phase: EventPhase.AFTER_REQUEST, pageProperty: pp as page_property_t });
}

function PageTitleClick(pid: pid_t): void {
    TryFetchPage(pid);
}

export default {
    TryFetchPage,
    TryFetchPageList,
    TryAddPage,
    TryDeletePage,
    TryUpdatePageProperty,
    HandleMenuClick,
    PageTitleClick,
};

