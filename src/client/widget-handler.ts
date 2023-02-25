import { pid_t, wid_t, WIDGET_TYPE, PANE_TYPE, widget_content_t, page_content_t, page_property_t, /*WIDGET_STATE,*/ WIDGET_ACTION } from "../common/types"
import Logger from "../common/logger"
import { GenID } from "../common/id-generator"
import * as Utils from "./utils"
import PageController from "./page-controller"
import MarkdownParser from "./core/markdown-parser"
import CodeExecutor from "./core/custom-widget-executor"
import Editor from "./core/textarea-with-highlight"


export interface IHandler {
    readonly uid: string;
    Show(): void;
    Destroy(): void;
}
export interface INewPageHandle extends IHandler {
    readonly type: WIDGET_TYPE;
}
export interface IPropertyHandle extends IHandler {
    readonly type: WIDGET_TYPE.PROPERTY;
    readonly id: pid_t;
    SetData(pp: Readonly<page_property_t>): void;
    GetData(): Partial<page_property_t>;
    Render(pp: Readonly<page_property_t>): void;

    ShowAction(showBit: WIDGET_ACTION): void;
    ShowView(): void;
    ShowEditor(): void;
    Toggle(): void;
}
export interface IWidgetHandle {
    readonly id: wid_t;
    readonly type: WIDGET_TYPE;
    GetContent(): Readonly<widget_content_t>;
    SetContent(wc: Readonly<widget_content_t>): void;
    Render(wc: Readonly<widget_content_t>): void;
    ShowAction(showBit: WIDGET_ACTION): void;
    ShowView(): void;
    ShowEditor(): void;
    Toggle(): void;
}
export interface IMarkdownWidgetHandle extends IWidgetHandle, IHandler {
    readonly type: WIDGET_TYPE.MARKDOWN;
}
export interface ICustomWidgetHandle extends IWidgetHandle, IHandler {
    readonly type: WIDGET_TYPE.CUSTOM;
    ShowPane(type: PANE_TYPE): void;
}

export interface HandlerMap {
    [WIDGET_TYPE.PAGE_NEW]: INewPageHandle,
    [WIDGET_TYPE.PROPERTY]: IPropertyHandle,
    [WIDGET_TYPE.MARKDOWN]: IMarkdownWidgetHandle,
    [WIDGET_TYPE.MATH]: IMarkdownWidgetHandle,
    [WIDGET_TYPE.CUSTOM]: ICustomWidgetHandle,
    [WIDGET_TYPE.TEMPLATE]: ICustomWidgetHandle,
}

const SLG_NEW: string = '[slg-new]';
const SLG_TOGGLE: string = '[slg-toggle]';
const SLG_PREVIEW: string = '[slg-preview]';
const SLG_SAVE_TEMPLATE: string = '[slg-save-template]';
const SLG_SAVE: string = '[slg-save]';
const SLG_DELETE: string = '[slg-delete]';

const _e = document.createElement('div');
let _sectionContainer: HTMLElement;

function _ShowAction(actionElem: Element, actionElemMap: Record<string, HTMLElement>, showBit: WIDGET_ACTION): void {
    (showBit & WIDGET_ACTION.NEW) ? actionElem.append(actionElemMap[SLG_NEW]) : actionElemMap[SLG_NEW].remove();
    (showBit & WIDGET_ACTION.TOGGLE) ? actionElem.append(actionElemMap[SLG_TOGGLE]) : actionElemMap[SLG_TOGGLE].remove();
    (showBit & WIDGET_ACTION.PREVIEW) ? actionElem.append(actionElemMap[SLG_PREVIEW]) : actionElemMap[SLG_PREVIEW].remove();
    (showBit & WIDGET_ACTION.SAVE) ? actionElem.append(actionElemMap[SLG_SAVE]) : actionElemMap[SLG_SAVE].remove();
    (showBit & WIDGET_ACTION.DELETE) ? actionElem.append(actionElemMap[SLG_DELETE]) : actionElemMap[SLG_DELETE].remove();
    (showBit & WIDGET_ACTION.SAVE_TEMPLATE) ? actionElem.append(actionElemMap[SLG_SAVE_TEMPLATE]) : actionElemMap[SLG_SAVE_TEMPLATE].remove();
}

function _GetElem(elem: Element) {
    const _viewElem: HTMLElement = Utils.RemoveIfExist(elem.querySelector('[slg-view]'));
    const _editorElem: HTMLElement = Utils.RemoveIfExist(elem.querySelector('[slg-editor]'));
    const _actionElem: HTMLElement = Utils.GetElement(elem, '[slg-action]');
    const _GetActionElem: (s: string) => HTMLElement = Utils.GetElement.bind(undefined, _actionElem);
    const _actionElemMap: Record<string, HTMLElement> = {
        [SLG_NEW]: _GetActionElem(SLG_NEW) ?? _e,
        [SLG_TOGGLE]: _GetActionElem(SLG_TOGGLE) ?? _e,
        [SLG_PREVIEW]: _GetActionElem(SLG_PREVIEW) ?? _e,
        [SLG_SAVE_TEMPLATE]: _GetActionElem(SLG_SAVE_TEMPLATE) ?? _e,
        [SLG_SAVE]: _GetActionElem(SLG_SAVE) ?? _e,
        [SLG_DELETE]: _GetActionElem(SLG_DELETE) ?? _e,
    };
    const _tagCon = Utils.GetElement(_viewElem, '[slg-tags]');
    const _tagElem = Utils.RemoveIfExist(_tagCon.querySelector('[slg-tag]'));
    return { _viewElem, _editorElem, _actionElem, _actionElemMap, _tagCon, _tagElem };
}

function _CreateTags(con: HTMLElement, tpl: HTMLElement, tags: string): void {
    con.innerHTML = '';
    const _tags = tags.split(',');
    if (_tags.length > 0) {
        for (let j = 0, M = _tags.length; j < M; ++j) {
            if (_tags[j] !== '') {
                let _ins = tpl.cloneNode(true) as HTMLElement;
                if (_ins.firstElementChild) {
                    (_ins.firstElementChild as HTMLLinkElement).innerText = _tags[j];
                }
                con.append(_ins);
            }
        }
    }
}


export function CreateNewPageWidget(elem: Element): INewPageHandle {
    const _viewElem: HTMLElement = Utils.GetElement(elem, '[slg-view]');
    let _tmp = Utils.GetElement(_viewElem, '[slg-new-article]');
    _tmp.onclick = _ => {
        Logger.Info('new article');
        PageController.TryAddPage();
    };
    let _tmp2 = Utils.GetElement(_viewElem, '[slg-quick-note]');
    _tmp2.onclick = _ => { Logger.Info('quick note'); };


    const _h: INewPageHandle = {
        uid: GenID(),
        type: WIDGET_TYPE.PAGE_NEW,
        Show(): void { _sectionContainer.append(elem); },
        Destroy(): void {
            elem.remove();
            _tmp.onclick = _tmp2.onclick = null;
        },
    };
    return _h;
}

export function CreatePropertyWidget(pid: pid_t, elem: Element): IPropertyHandle {
    const { _viewElem, _editorElem, _actionElem, _actionElemMap, _tagCon, _tagElem } = _GetElem(elem);
    _actionElem.onclick = e => {
        const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
        if (_aName) {
            PageController.HandleMenuClick(_aName, e.clientX, e.clientY, _h);
        }
        e.stopPropagation();
    }
    Utils.GetElement(_viewElem, '[slg-title]').onclick = e => {
        PageController.PageTitleClick(pid);
    }

    const _h: IPropertyHandle = {
        uid: GenID(),
        id: pid,
        type: WIDGET_TYPE.PROPERTY,
        Show(): void { _sectionContainer.append(elem); },
        Destroy(): void { elem.remove(); },

        ShowView(): void {
            _editorElem.remove();
            elem.prepend(_viewElem);
        },
        Toggle(): void {
            if (_viewElem.parentElement === elem) {
                _h.ShowEditor();
            } else {
                _h.ShowView();
            }
        },
        ShowEditor(): void {
            _viewElem.remove();
            elem.prepend(_editorElem);
        },
        ShowAction: _ShowAction.bind(undefined, _actionElem, _actionElemMap),
        SetData(pp: Readonly<page_property_t>): void {
            if (pp.id !== pid) return;
            Utils.GetElement(_editorElem, '[slg-title]').textContent = pp.title;
            Utils.GetElement(_editorElem, '[slg-tags]').textContent = pp.tags;
            Utils.GetElement(_editorElem, '[slg-description]').textContent = pp.description;

            _h.Render(pp);
        },
        GetData(): Partial<page_property_t> {
            const _pp: Partial<page_property_t> = {
                id: pid,
                ///createTime: Utils.GetElement(_viewElem, '[slg-time]').textContent ?? '',
                ///author: Utils.GetElement(_viewElem, '[slg-author]').textContent ?? '',
                title: Utils.GetElement(_editorElem, '[slg-title]').textContent ?? '',
                modifyTime: Utils.GetElement(_viewElem, '[slg-time]').textContent ?? '',
                tags: Utils.GetElement(_editorElem, '[slg-tags]').textContent ?? '',
                description: Utils.GetElement(_editorElem, '[slg-description]').textContent ?? '',
            }
            return _pp;
        },
        Render(pp: Readonly<page_property_t>): void {
            Utils.GetElement(_viewElem, '[slg-title]').textContent = pp.title;
            Utils.GetElement(_viewElem, '[slg-time]').textContent = pp.modifyTime;
            Utils.GetElement(_viewElem, '[slg-author]').textContent = pp.author;
            Utils.GetElement(_viewElem, '[slg-description]').textContent = pp.description;
            _CreateTags(_tagCon, _tagElem, pp.tags);
        },
    };
    return _h;
}

export function CreateMarkdownWidget(wid: wid_t, elem: Element): IMarkdownWidgetHandle {
    const { _viewElem, _editorElem, _actionElem, _actionElemMap } = _GetElem(elem);
    const _editor: Editor = new Editor();

    _actionElem.onclick = e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') {
            const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
            if (_aName) {
                PageController.HandleMenuClick(_aName, e.clientX, e.clientY, _h);
            }
            e.stopPropagation();
        }
    }

    const _h: IMarkdownWidgetHandle = {
        uid: GenID(),
        id: wid,
        type: WIDGET_TYPE.MARKDOWN,
        Show(): void { _sectionContainer.append(elem); },
        Destroy(): void {
            elem.remove();
            _editor.Destroy();
            _actionElem.onclick = null;
        },

        ShowView(): void {
            _editorElem.remove();
            elem.prepend(_viewElem);
        },
        Toggle(): void {
            if (_viewElem.parentElement === elem) {
                _h.ShowEditor();
            } else {
                _h.ShowView();
            }
        },
        ShowEditor(): void {
            _editor.Init(Utils.GetElement(_editorElem, "[slg-textarea]"));
            _viewElem.remove();
            elem.prepend(_editorElem);
        },
        ShowAction: _ShowAction.bind(undefined, _actionElem, _actionElemMap),
        GetContent(): Readonly<widget_content_t> {
            const currentValue = _editor.text;
            return {
                id: wid,
                type: WIDGET_TYPE.MARKDOWN,
                data: {
                    content: currentValue,
                    layout: "",
                    action: "",
                }
            }
        },
        SetContent(wc: Readonly<widget_content_t>): void {
            _editor.text = wc.data.content;
            _h.Render(wc);
        },
        Render(wc: Readonly<widget_content_t>): void {
            _viewElem.innerHTML = MarkdownParser.MarkdownStringToHTML(wc.data.content);
        }
    };
    return _h;
}

export function CreateCustomWidget(wid: wid_t, elem: Element): ICustomWidgetHandle {
    const { _viewElem, _editorElem, _actionElem, _actionElemMap } = _GetElem(elem);
    const _editor: Editor = new Editor();
    _editor.highlightLang = 'json';
    const _editor2: Editor = new Editor();
    _editor2.highlightLang = 'html';
    const _editor3: Editor = new Editor();
    _editor3.highlightLang = 'javascript';

    _actionElem.onclick = e => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') {
            const _aName = (e.target as HTMLElement).dataset['slgActionName'] as string;
            if (_aName) {
                PageController.HandleMenuClick(_aName, e.clientX, e.clientY, _h);
            }
            e.stopPropagation();
        }
    }

    const _h: ICustomWidgetHandle = {
        uid: GenID(),
        id: wid,
        type: WIDGET_TYPE.CUSTOM,
        Show(): void { _sectionContainer.append(elem); },
        Destroy(): void {
            elem.remove();
            _editor.Destroy();
            _editor2.Destroy();
            _editor3.Destroy();
        },

        ShowView(): void {
            _editorElem.remove();
            elem.prepend(_viewElem);
        },
        Toggle(): void {
            if (_viewElem.parentElement === elem) {
                _h.ShowEditor();
            } else {
                _h.ShowView();
            }
        },
        ShowEditor(): void {
            _editor.Init(Utils.GetElement(_editorElem, "[slg-textarea-content]"));
            _editor2.Init(Utils.GetElement(_editorElem, "[slg-textarea-layout]"));
            _editor3.Init(Utils.GetElement(_editorElem, "[slg-textarea-action]"));
            _viewElem.remove();
            elem.prepend(_editorElem);
        },
        ShowAction: _ShowAction.bind(undefined, _actionElem, _actionElemMap),
        GetContent(): Readonly<widget_content_t> {
            return {
                id: wid,
                type: WIDGET_TYPE.CUSTOM,
                data: {
                    content: _editor.text,
                    layout: _editor2.text,
                    action: _editor3.text,
                }
            }
        },
        SetContent(wc: Readonly<widget_content_t>): void {
            _editor.text = wc.data.content;
            _editor2.text = wc.data.layout;
            _editor3.text = wc.data.action;
            CodeExecutor(_viewElem, wc);
        },
        ShowPane(pType: PANE_TYPE): void {
            _viewElem.remove();
            elem.prepend(_editorElem);
            switch (pType) {
                case PANE_TYPE.CONTENT:
                    _editor.highlightLang = 'json';
                    break;
                case PANE_TYPE.LAYOUT:
                    _editor.highlightLang = 'html';
                    break;
                case PANE_TYPE.ACTION:
                    _editor.highlightLang = 'javascript';
                    break;
                case PANE_TYPE.UNKNOWN:
                default:
                    break;
            }
        },
        Render(wc: Readonly<widget_content_t>): void {
            CodeExecutor(_viewElem, wc);
        }
    };
    return _h;
}

export function Init(TPL: Element): void {
    _sectionContainer = TPL.querySelector('[slg-section-container]') as HTMLElement;
}
