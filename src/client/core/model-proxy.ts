import { pid_t, wid_t } from "../../common/types";
import Logger from "../../common/logger";
import { page_property_t } from "./data-types"
import * as Events from "./event-types";
import ServerProxy from "./server-interactor";
import { EventHandler } from "./framework";

const _eh = new EventHandler();
//const _arrPageContent = new Collection<PID_t, PageContent>();

/*
const _GenWID = Utils.GUID.bind(null, "W");

function _DeleteAllPages(): void {
    _mapNode.forEach((v: Tree.INode, _: Tree.ID_t) => {
        Tree.UnregistNode(v);
    });
    _mapNode.clear();
}
*/


/*
function CreateWidgetContent(PID: PID_t, offset: number, type: WIDGET_TYPE): void {
    //Logger.log(PID, offset);
    const _pContent = _arrPageContent.GetByKey(PID);
    if (_pContent) {
        const _wContent = new WidgetContent(_GenWID(), type);
        if (_pContent.data.Insert(_wContent, offset)) {
            ServerProxy.AddWidgetContent(PID, offset, _wContent.GenTransformData());
            _eh.Dispatch({ type: 'content-created', PID: PID, widgetContent: _wContent, index: offset });
        }
    }
}

function UpdateWidgetContent(PID: PID_t, WID: WID_t): boolean {
    const _pContent = _arrPageContent.GetByKey(PID);
    if (_pContent) {
        const _wContent = _pContent.data.GetByKey(WID);
        if (_wContent) {
            ///_pContent.data.DebugPrint("UpdateWidgetContent");
            ServerProxy.UpdateWidgetContent(PID, _wContent.GenTransformData());
            //_eh.Dispatch(_F({type: _API.EVT_DATASTORAGE_SECTION_MODIFIED, PID, widgetContent: _wContent}));
            return true;
        }
    }
    return false;
}
function UpdateWidgetContentIndex(PID: PID_t, WID: WID_t, index: number): boolean {
    let _pContent = _arrPageContent.GetByKey(PID);
    if (_pContent) {
        const _wContent = _pContent.data.GetByKey(WID);
        if (_wContent) {
            _pContent.data.MoveToIndex(_wContent, index);
            ServerProxy.MoveWidgetContent(PID, WID, index);
            return true;
        }
    }
    return false;
}
function DeleteWidgetContent(PID: PID_t, WID: WID_t): boolean {
    const _pContent = _arrPageContent.GetByKey(PID);
    if (_pContent) {
        const _r: boolean = _pContent.data.RemoveByKey(WID);
        if (_r) {
            ServerProxy.DeleteWidgetContent(PID, WID);
        }
        return _r;
    }
    return false;
}
function GetWidgetContentIndex(PID: PID_t, WID: WID_t): number {
    const _pContent = _arrPageContent.GetByKey(PID);
    if (_pContent) {
        return _pContent.data.GetIndexByKey(WID);
    }
    return -1;
}

function FetchPageContent(PID: PID_t): void {
    const _v = _arrPageContent.GetByKey(PID);
    if (_v) {
        _eh.Dispatch({ type: 'page-fetched', pageContent: _v });
    } else {
        _RequestArticleData(PID);
    }
}
function _RequestArticleData(PID: PID_t): void {
    ServerProxy.GetPageContent(PID).then((data) => {
        let _pContent = new PageContent(PID);
        if (_arrPageContent.Insert(_pContent)) {
            try {
                const _data = JSON.parse(data);
                for (let i = 0, N = _data.indexes.length; i < N; ++i) {
                    const _WID = _data.indexes[i];
                    const _sectionJsonData = _data.sections[_WID];
                    let _wContent: WidgetContent = WidgetContent.FromRemoteData(_sectionJsonData);
                    if (!_pContent.data.Insert(_wContent)) {
                        Messager.DisplayErrorToast(`internal error, check console error for more information.`);
                        Logger.Error(`internal error: push to unique array.\n comming data:${_sectionJsonData}\nstored data:${_data}`);
                    }
                }
            } catch (e) { }
            _eh.Dispatch({ type: 'page-fetched', pageContent: _pContent });
        } else {
            Messager.DisplayWarnToast(`duplicated server PageContent, slog discarded. PID: ${PID}`);
        }
    });
}

function GetPageProperty(PID: PID_t): PageProperty | undefined {
    const _node = _mapNode.get(<Tree.ID_t>PID);
    return _node ? <PageProperty>_node : undefined;
}

function UpdatePageProperty(value: PageProperty): boolean {
}

function AddPageProperty(value: PageProperty): boolean {
}

function DeletePage(PID: PID_t): boolean {
}

function GetNode(PID: PID_t): Tree.INode | undefined {
    return _mapNode.get(PID);
}

function GetFolderContentInfo(path: string): void {
    ServerProxy.GetFolderContentInfo(path).then((data) => {
        _eh.Dispatch({ type: 'content-info', data });
    });
}


let _API = {
    Subscribe: _eh.Subscribe,
    Unsubscribe: _eh.Unsubscribe,

    GetPageProperty,
    GetNode,
    UpdatePageProperty,
    AddPageProperty,
    DeletePage,

    FetchPageContent,
    CreateWidgetContent,
    UpdateWidgetContent,
    UpdateWidgetContentIndex,
    DeleteWidgetContent,
    GetWidgetContentIndex,

    GetFolderContentInfo,
};
*/
