import { pid_t, wid_t, WIDGET_TYPE, widget_content_t, page_property_t, page_content_t } from "./types"

export enum RequestCode {
    GET_PAGE_LIST = 2,
    GET_PAGE = 6,
    ADD_PAGE = 3,
    UPDATE_PAGE = 4,
    DELETE_PAGE = 5,
    ADD_WIDGET = 7,
    UPDATE_WIDGET = 8,
    MOVE_SECTION_DATA = 9,
    DELETE_WIDGET = 10,
    GET_FOLDER_CONTENT_INFO = 20,
    UPDATE_EXTERNAL_WEB_INNFO = 30,
    UPLOAD_FILES = 40,
    LOGIN = 50,
    CLIENT_STATUS = 998,
    ARCHIVE = 999,
}

export enum RespondCode {
    FAIL = -1,
    FILE_NOT_EXIST = -2,
    ACCOUNT_NOT_EXIST = -4,
    SESSION_NOT_EXIST = -5,
    PASSWORD_ERROR = -8,
    PAGE_NOT_EXIST = -9,
    META_ALREADY_EXIST = -10,
    SECTION_ALREADY_EXIST = -11,
    SECTION_NOT_EXIST = -12,
    JSON_PARSING_ERROR = -50,
    NOT_PUBLISHED = -100,
    FORBIDDEN = -400,
    SHELL_CALL_ERROR = -999,
    INVALID_ARGUMENT = -1000,
    UNKNOW_ERROR = -999999,

    UNKNOWN = 0,

    OK = 1,
    OK_WITH_INFO = 2,
    HEART_BEAT = 999999,
};

export enum DataType {
    ARTICLE = 10,
    TAG = 10,
    NOTEBOOK = 10,
}
export enum HistoryActionType {
    UNKNOWN = "unknown",
    NEW = "new",
    DELETE = "deleted",
    MODIFIED = "modified",
}

export interface action_GetPageList {
    request_t: {
        code: RequestCode.GET_PAGE_LIST,
    },
    respond_t: {
        code: RespondCode,
        data: Array<page_property_t>,
        msg?: string,
    },
}

export interface action_GetPage {
    request_t: {
        code: RequestCode.GET_PAGE,
        data: { id: pid_t },
    },
    respond_t: {
        code: RespondCode,
        data?: {
            property: page_property_t,
            content: page_content_t,
        },
        msg?: string
    },
}

export interface action_AddPage {
    request_t: {
        code: RequestCode.ADD_PAGE,
    },
    respond_t: {
        code: RespondCode,
        data?: page_property_t,
        msg?: string,
    },
}

export interface action_AddWidget {
    request_t: {
        code: RequestCode.ADD_WIDGET,
        data: {
            pid: pid_t,
            type: WIDGET_TYPE,
            index: number,
        }
    },
    respond_t: {
        code: RespondCode,
        data?: {
            widgetContent: widget_content_t
        },
        msg?: string,
    },
}

export type Messages = {
    'updatePage': {
        request_t: {
            code: RequestCode.UPDATE_PAGE,
            data: {
                pp: page_property_t,
            }
        },
        respond_t: {
            code: RespondCode,
            data: {
                pid: pid_t,
                index: number,
            },
            msg?: string,
        },
    },
    'deletePage': {
        request_t: {
            code: RequestCode.DELETE_PAGE,
            data: {
                id: pid_t
            }
        },
        respond_t: {
            code: RespondCode,
            data?: {},
            msg?: string,
        },
    },
    'login': {
        request_t: {
            code: RequestCode.LOGIN,
            data: {
                remeberMe: boolean,
                account: string,
                pwd: string,
            },
        },
        respond_t: {
            code: RespondCode,
            data?: {},
            msg?: string,
        },
    },
    'updateWidget': {
        request_t: {
            code: RequestCode.UPDATE_WIDGET,
            data: {
                pid: pid_t,
                wc: widget_content_t,
            }
        },
        respond_t: {
            code: RespondCode,
            data?: {},
            msg?: string,
        },
    },
    'deleteWidget': {
        request_t: {
            code: RequestCode.DELETE_WIDGET,
            data: {
                pid: pid_t,
                wid: wid_t,
            }
        },
        respond_t: {
            code: RespondCode,
            data?: {},
            msg?: string,
        },
    },
};

export type request_t =
    action_GetPageList['request_t'] |
    action_GetPage['request_t'] |
    action_AddPage['request_t'] |
    Messages['updatePage']['request_t'] |
    Messages['deletePage']['request_t'] |
    Messages['login']['request_t'] |
    action_AddWidget['request_t'] |
    Messages['updateWidget']['request_t'] |
    Messages['deleteWidget']['request_t'];


export interface IServerRPC {
    Login(account: string, pwd: string): Promise<Messages['login']['respond_t']['data']>;
    GetPageList(): Promise<action_GetPageList['respond_t']['data']>;
    GetPage(id: pid_t): Promise<action_GetPage['respond_t']['data']>;
    AddPage(): Promise<action_AddPage['respond_t']['data']>;
    UpdatePage(pp: page_property_t): Promise<Messages['updatePage']['respond_t']['data']>;
    DeletePage(id: pid_t): Promise<Messages['deletePage']['respond_t']['data']>;
    AddWidget(id: pid_t, type: WIDGET_TYPE, index: number): Promise<action_AddWidget['respond_t']['data']>;
    UpdateWidget(id: pid_t, wc: widget_content_t): Promise<Messages['updateWidget']['respond_t']['data']>;
    DeleteWidget(id: pid_t, wid: wid_t): Promise<Messages['deleteWidget']['respond_t']['data']>;
    /*
    MoveWidgetContent(id: pid_t, wid: wid_t, index: number): Promise<any>;
    Archive(): Promise<any>;
    GetFolderContentInfo(path: path_t): Promise<any>;
    Log(): Promise<any>;
    */
}

