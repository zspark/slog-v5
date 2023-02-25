import { pid_t, wid_t, WIDGET_TYPE, widget_content_t, page_property_t } from "../../common/types"
import {
    IServerRPC,
    RequestCode,
    Messages,
    action_GetPageList,
    action_GetPage,
    action_AddPage,
    action_AddWidget,
} from "../../common/message"

const _jsonHeader: Headers = new Headers();
_jsonHeader.append("Content-Type", "application/json");
const _formHeader: Headers = new Headers();
_formHeader.append("Content-Type", "multipart/form-data");

async function _Post(req: any, headers: Headers = _jsonHeader): Promise<any> {
    const response = await fetch("/service", { method: "POST", headers, body: JSON.stringify(req) });
    return response.json().then((cbData) => {
        if (cbData.code < 0) {
            console.error(cbData.msg);
            return Promise.reject();
        } else {
            return cbData.data;
        }
    }, (error) => {
        console.error(`net error:\n ${error}`);
        return Promise.reject();
    });
}

function ReadWriteAuthorization(): IServerRPC {
    return {
        Login(account: string, pwd: string): Promise<Messages['login']['respond_t']['data']> {
            return _Post({ code: RequestCode.LOGIN, data: { remeberMe: true, account, pwd } });
        },
        GetPageList(): Promise<action_GetPageList['respond_t']['data']> {
            return _Post({ code: RequestCode.GET_PAGE_LIST, data: {} });
        },
        GetPage(id: pid_t): Promise<action_GetPage['respond_t']['data']> {
            return _Post({ code: RequestCode.GET_PAGE, data: { id } });
        },
        AddPage(): Promise<action_AddPage['respond_t']['data']> {
            return _Post({ code: RequestCode.ADD_PAGE, data: {} });
        },
        UpdatePage(pp: page_property_t): Promise<Messages['updatePage']['respond_t']['data']> {
            return _Post({ code: RequestCode.UPDATE_PAGE, data: { pp } });
        },
        DeletePage(id: pid_t): Promise<Messages['deletePage']['respond_t']['data']> {
            return _Post({ code: RequestCode.DELETE_PAGE, data: { id } });
        },
        AddWidget(id: pid_t, type: WIDGET_TYPE, index: number = Number.MAX_SAFE_INTEGER): Promise<action_AddWidget['respond_t']['data']> {
            return _Post({ code: RequestCode.ADD_WIDGET, data: { pid: id, type, index } });
        },
        UpdateWidget(pid: pid_t, wc: widget_content_t): Promise<Messages['updateWidget']['respond_t']['data']> {
            return _Post({ code: RequestCode.UPDATE_WIDGET, data: { pid, wc } });
        },
        DeleteWidget(pid: pid_t, wid: wid_t): Promise<Messages['deleteWidget']['respond_t']['data']> {
            return _Post({ code: RequestCode.DELETE_WIDGET, data: { pid, wid } });
        },
        /*
        UpdatePageProperty(jsonObj: Object): Promise<any> {
            return _Post(RequestCode.UPDATE_META_DATA, { data: jsonObj });
        },
        DeletePageProperty(id: pid_t): Promise<any> {
            return _Post(RequestCode.DELETE_META_DATA, { id });
        },
        AddWidgetContent(id: pid_t, index: number, widgetContent: Object): Promise<any> {
            return _Post(RequestCode.ADD_SECTION_DATA, { id, index, data: widgetContent });
        },
        UpdateWidgetContent(id: pid_t, widgetContent: Object): Promise<any> {
            return _Post(RequestCode.UPDATE_SECTION_DATA, { id, data: widgetContent });
        },
        MoveWidgetContent(id: pid_t, WID: string, index: number): Promise<any> {
            return _Post(RequestCode.MOVE_SECTION_DATA, { id, WID, index });
        },
        DeleteWidgetContent(id: pid_t, WID: string): Promise<any> {
            return _Post(RequestCode.DELETE_SECTION_DATA, { id, WID });
        },
        GetFolderContentInfo(path: string): Promise<any> {
            return _Post(RequestCode.GET_FOLDER_CONTENT_INFO, { path });
        },
        Archive: _Post.bind(undefined, RequestCode.ARCHIVE),
        Log: _Post.bind(undefined, RequestCode.CLIENT_STATUS),
        */
    };
}
/*
function ReadOnlyAuthorization(): IServerRPC {
const _RejectFunc = () => { return Promise.reject(undefined); };
return {
GetPageList(): Promise<Messages['getPageList']['respond_t']['data']> {
    return _Post<'getPageList'>({ code: RequestCode.GET_PAGE_LIST, data: {} });
},
GetPage(id: pid_t): Promise<Messages['getPage']['respond_t']['data']> {
    return _Post<'getPage'>({ code: RequestCode.GET_PAGE, data: { id } });
},
AddPage(): Promise<Messages['addPage']['respond_t']['data']> {
    return Promise.reject();
},
UpdatePage(pp: page_property_t): Promise<Messages['updatePage']['respond_t']['data']> {
    return Promise.reject();
}
Login(user: string, pwd: string): Promise<any> {
    return _Post(RequestCode.LOGIN, { user, pwd });
},
 
GetFolderContentInfo: _RejectFunc,
AddPageProperty: _RejectFunc,
UpdatePageProperty: _RejectFunc,
DeletePageProperty: _RejectFunc,
AddWidgetContent: _RejectFunc,
UpdateWidgetContent: _RejectFunc,
MoveWidgetContent: _RejectFunc,
DeleteWidgetContent: _RejectFunc,
Archive: _RejectFunc,
Log: _RejectFunc,
};
}
*/

//const _api: IServerRPC = document.cookie.indexOf("user=") >= 0 ? ReadWriteAuthorization() : ReadOnlyAuthorization();
const _api: IServerRPC = ReadWriteAuthorization();
export default _api;

