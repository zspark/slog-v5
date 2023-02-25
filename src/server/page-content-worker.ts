import { url_t, path_t, pid_t, wid_t, page_content_t, widget_content_t, WIDGET_TYPE } from "../common/types"
import { GenID } from "../common/id-generator"
import Logger from "../common/logger"
import { USER_TYPE } from "./core/privilege"
import { GlobalPaths } from "./core/basic"
import * as FileIO from "./core/file-io"


const _PAGES_PATH_: path_t = `${GlobalPaths.ROOT_CONTENT}pages/`;

export enum content_flag {
    config = 0,
}

export type IContentWorker = {
    CreateWidgetContent: (index: number) => widget_content_t,
    GetWidgetContent: (id: wid_t) => widget_content_t,
    UpdateWidgetContent: (wc: widget_content_t) => void,
    DeleteWidgetContent: (id: wid_t) => void,

    GetPageContent: (withWidgetContent: boolean) => page_content_t,
    /*
    SetContent: (v: page_content_t) => boolean,

    SetWidget: (id: wid_t, value: widget_content_t) => boolean,
    CreateWidget: () => widget_content_t,
    DeleteWidget: (id: wid_t) => boolean,
    */
}

const _TEMPLATE_CONFIG_: Readonly<page_content_t> = {
    id: '',
    indexes: [],
    sections: {},
}

function _SaveConfigFile(pc: page_content_t): void {
    const _data = {
        id: pc.id,
        indexes: [...pc.indexes],
        sections: {},
    };
    FileIO.WriteFileUTF8(`${_PAGES_PATH_}${pc.id}/config.json`, JSON.stringify(_data));
}

function _GetWidgetContent(pid: pid_t, wid: wid_t): widget_content_t {
    //Logger.Debug(`_GetWidget`, path, wid);
    const _str: string | undefined = FileIO.ReadFileUTF8(`${_PAGES_PATH_}${pid}/${wid}`);
    if (_str) {
        try {
            let _obj = JSON.parse(_str) as widget_content_t;
            //Logger.Info(wid, _obj);
            return _obj;
        } catch (e) {
            Logger.Error(`json parsing error`);
        }
    }
    return { id: '', type: WIDGET_TYPE.UNKNOWN, data: { content: '', layout: '', action: "" } };
}
function _GetPageContent(pid: pid_t, withWidgetContent: boolean): page_content_t {
    const _out: string | undefined = FileIO.ReadFileUTF8(`${_PAGES_PATH_}${pid}/config.json`);
    if (_out) {
        try {
            const _pc = JSON.parse(_out) as page_content_t;
            if (withWidgetContent) {
                for (let i = 0, N = _pc.indexes.length; i < N; ++i) {
                    const _id: wid_t = _pc.indexes[i];
                    _pc.sections[_id] = _GetWidgetContent(pid, _id);
                }
            }
            return _pc;
        } catch (e) {
            Logger.Error(`json parsing error`);
        }
    }
    const _pc: page_content_t = JSON.parse(JSON.stringify(_TEMPLATE_CONFIG_));
    _pc.id = pid;
    _SaveConfigFile(_pc);
    return _pc;
}
function _UpdateWidgetContent(pid: pid_t, wc: widget_content_t): void {
    const _url: url_t = `${_PAGES_PATH_}${pid}/${wc.id}`;
    FileIO.WriteFileUTF8(_url, JSON.stringify(wc));
}
function _DeleteWidgetContent(pid: pid_t, wid: wid_t): void {
    const _url: url_t = `${_PAGES_PATH_}${pid}/${wid}`;
    FileIO.DeleteFile(_url);
}
//function _SetContent(v: page_content_t): boolean { }
//function _CreateContent(): page_content_t { }
//function _DeleteContent(pid: pid_t): void { }
//function _GetWidget(id: pid_t): widget_content_t { }
//function _SetWidget(pid: pid_t, wid: wid_t, value: widget_content_t): boolean { }
//function _CreateWidget(pid: pid_t): widget_content_t { }
//function _DeleteWidget(pid: pid_t, wid: wid_t): boolean { }

function ContentReadWorker(pid: pid_t): IContentWorker {
    Logger.Info(`create page manipulator(readonly) to deal with pid:${pid}`);
    const _path: path_t = `${_PAGES_PATH_}${pid}/`;
    FileIO.CreateFolderIfNotExist(_path);

    return {
        CreateWidgetContent: (index: number = Number.MAX_SAFE_INTEGER): widget_content_t => {
            return { id: '', type: WIDGET_TYPE.UNKNOWN, data: { content: '', layout: '', action: "" } };
        },
        GetWidgetContent: _GetWidgetContent.bind(undefined, pid),
        UpdateWidgetContent: (_: widget_content_t) => { },
        DeleteWidgetContent: (_: string) => { },
        GetPageContent: _GetPageContent.bind(undefined, pid),
        /*
        SetContent: (v: page_content_t) => boolean,
        CreateContent: () => page_content_t,
        DeleteContent: () => void,
        SetWidget: (id: wid_t, value: widget_content_t) => boolean,
        CreateWidget: () => widget_content_t,
        DeleteWidget: (id: wid_t) => boolean,
        */
    };
}
function ContentReadWriteWorker(pid: pid_t): IContentWorker {
    const _path: path_t = `${_PAGES_PATH_}${pid}/`;
    Logger.Info(`ContentReadWriteWorker, path:${_path}`);
    FileIO.CreateFolderIfNotExist(_path);

    return {
        CreateWidgetContent: (index: number = Number.MAX_SAFE_INTEGER): widget_content_t => {
            const _wc = { id: GenID(), type: WIDGET_TYPE.UNKNOWN, data: { content: '', layout: '', action: "" } };
            const _pc = _GetPageContent(pid, false);
            index = Math.min(index, _pc.indexes.length);
            _pc.indexes[index] = _wc.id;
            _SaveConfigFile(_pc);
            return _wc;
        },
        GetWidgetContent: _GetWidgetContent.bind(undefined, pid),
        UpdateWidgetContent: _UpdateWidgetContent.bind(undefined, pid),
        DeleteWidgetContent: (wid: wid_t): void => {
            const _pc = _GetPageContent(pid, false);
            const _idx = _pc.indexes.indexOf(wid);
            if (_idx >= 0) {
                _pc.indexes.splice(_idx, 1);
                _SaveConfigFile(_pc);
            }
            _DeleteWidgetContent(pid, wid);
        },
        GetPageContent: _GetPageContent.bind(undefined, pid),
        /*
        SetContent: (v: page_content_t) => boolean,
        CreateContent: () => page_content_t,
        DeleteContent: () => void,
        SetWidget: (id: wid_t, value: widget_content_t) => boolean,
        CreateWidget: () => widget_content_t,
        DeleteWidget: (id: wid_t) => boolean,
        */
    };
}

export function GetPageContentWorker(userType: USER_TYPE, id: pid_t): IContentWorker {
    switch (userType) {
        case USER_TYPE.FORBIDDANCE:
        case USER_TYPE.UNKNOWN:
        case USER_TYPE.VISITOR:
            return ContentReadWorker(id);
        case USER_TYPE.EDITOR:
        case USER_TYPE.MASTER:
            return ContentReadWriteWorker(id);
    }
}

