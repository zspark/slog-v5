//import { CheckLogin, GetUserAccount } from "./core/utils"
//import * as http from 'http';
//import * as https from 'https';
//import * as URL from 'url';
import { page_property_t, page_content_t } from "../common/types"
import Logger from "../common/logger"
import {
    RespondCode, RequestCode, request_t,
    action_GetPageList,
    action_GetPage,
    action_AddPage,
    action_AddWidget,
    Messages
} from "../common/message"
//import { GlobalPaths, IOutputResult } from "./core/basic"
import { SessionManager, Session } from "./session-manager"
import * as UserManager from "./user-manager"
//const cheerio = require('cheerio');
//const Cacher = require("./module_data_cache");
//import Cacher from "./module_data_cache"
//const ShellCall = require("./shell-call");

type _fn_t = (res: any, session: Session | undefined, data: request_t) => void;

function GetPageList(res: any, session: Session | undefined, _: request_t): void {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('GetPageList', session.sid);
    const _h = session.GetHandleOfProperty();
    let _data: action_GetPageList['respond_t'] = {
        code: RespondCode.OK,
        data: _h.GetProperties(),
    };
    res.json(_data);
}

function AddPage(res: any, session: Session | undefined, data: request_t): void {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('AddPage', session.sid);

    const _h = session.GetHandleOfProperty();
    const _pp: page_property_t | undefined = _h.CreateProperty();
    type x_t = action_AddPage['respond_t'];
    if (_pp) {
        const _data: x_t = {
            code: RespondCode.OK,
            data: _pp,
        };
        res.json(_data);
    } else {
        Logger.Error(`property create failed`);
        const _data: x_t = {
            code: RespondCode.FAIL,
            msg: 'property create failed.',
        };
        res.json(_data);
    }
}

function UpdatePage(res: any, session: Session | undefined, data: request_t): void {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('UpdatePage', session.sid);
    data = data as Messages['updatePage']['request_t'];

    type x_t = Messages['updatePage']['respond_t'];
    const _infoBack: x_t = {
        code: RespondCode.UNKNOWN,
        data: { pid: data.data.pp.id, index: -1 },
    };
    const _h = session.GetHandleOfProperty();
    _infoBack.code = _h.UpdateProperty(data.data.pp);
    res.json(_infoBack);
}

function GetPage(res: any, session: Session | undefined, data: request_t): void {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('GetPage', session.sid);
    data = data as action_GetPage['request_t'];

    //console.log(`[debug] GetPage,data is :\n${String(data)}`);
    type x_t = action_GetPage['respond_t'];
    const _h2 = session.GetHandleOfProperty();
    const property = _h2.GetProperty(data.data.id);
    if (property) {
        const _h = session.GetHandleOfContent(data.data.id);
        const content: page_content_t = _h.GetPageContent(true);
        let _data: x_t = { code: RespondCode.OK, data: { content, property } };
        //Logger.Debug(`GetPage`, _data);
        res.json(_data);
    } else {
        let _data: x_t = { code: RespondCode.FAIL, msg: 'failed' };
        res.json(_data);
    }
}

function Login(res: any, session: Session | undefined, data: request_t): void {
    Logger.Debug('Login, sid:', session?.sid);
    data = data as Messages['login']['request_t'];

    const _acc = data.data.account;
    const _pwd = data.data.pwd;
    const _resCode = UserManager.CheckAccount(_acc, _pwd);
    if (_resCode === RespondCode.OK) {
        const _usr = UserManager.GetUser(_acc);
        if (_usr) {
            const _s = session ?? _SM.CreateSession(_usr);
            const _exp: number = (data.data.remeberMe ? 24 : 1) * 60 * 60 + Date.now();
            res.cookie('sid', _s.sid, { signed: true, expire: _exp });
        }
    }
    let _resData: Messages['login']['respond_t'] = {
        code: _resCode,
    }
    res.json(_resData);
}

function DeletePage(res: any, session: Session | undefined, data: request_t): void {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('UpdatePage', session.sid);

    data = data as Messages['deletePage']['request_t'];
    type x_t = Messages['deletePage']['respond_t'];
    const _h = session.GetHandleOfProperty();
    _h.DeleteProperty(data.data.id);
    /*
    const _h = session.GetHandleOfContent(data.data.id);

    */
    let _data: x_t = { code: RespondCode.OK };
    //Logger.Debug(`GetPage`, _data);
    res.json(_data);
}

function AddWidget(res: any, session: Session | undefined, data: request_t) {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('AddWidget', session.sid);

    data = data as action_AddWidget['request_t'];
    type x_t = action_AddWidget['respond_t'];
    const _h = session.GetHandleOfContent(data.data.pid);

    let _data: x_t = {
        code: RespondCode.OK, data: { widgetContent: _h.CreateWidgetContent(data.data.index) }
    }
    if (_data.data) {
        _data.data.widgetContent.type = data.data.type;
    }
    //Logger.Debug(`GetPage`, _data);
    res.json(_data);
}
function UpdateWidget(res: any, session: Session | undefined, data: request_t) {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('UpdateWidget', session.sid);

    data = data as Messages['updateWidget']['request_t'];
    type x_t = Messages['updateWidget']['respond_t'];
    const _h = session.GetHandleOfContent(data.data.pid);

    let _data: x_t = {
        code: RespondCode.OK, data: { wc: _h.UpdateWidgetContent(data.data.wc) }
    }
    //Logger.Debug(`GetPage`, _data);
    res.json(_data);
}

function DeleteWidget(res: any, session: Session | undefined, data: request_t) {
    session = session ?? _SM.GetVisitorSession();
    Logger.Debug('DeleteWidget', session.sid);

    data = data as Messages['deleteWidget']['request_t'];
    const _h = session.GetHandleOfContent(data.data.pid);
    _h.DeleteWidgetContent(data.data.wid);

    type x_t = Messages['deletePage']['respond_t'];
    let _data: x_t = { code: RespondCode.OK, data: {} }
    res.json(_data);
}
/*
 
function MoveSectionData(req: any, res: any, data: ITransactionData) {
    const _t = data as Required<Pick<ITransactionData, 'PID' | 'WID' | 'index'>>;
    let _package: IResposeData = {
        code: Cacher.MoveSectionData(_t.PID, _t.WID, _t.index),
        data: {}
    }
    res.json(_package);
}
 
function Archive(req: any, res: any, data: ITransactionData) {
    ShellCall.GitAdd((v1) => {
        console.log(`xxxxxxxxxxxxxxxxxx:A`);
        if (v1) {
            console.log(`xxxxxxxxxxxxxxxxxx:${v1}`);
            ShellCall.GitCommit(`archive at ${new Date().toString()}`, (v2) => {
                console.log(`xxxxxxxxxxxxxxxxxx:B`);
                if (v2) {
                    console.log(`xxxxxxxxxxxxxxxxxx:${v2}`);
                    //ShellCall.GitPush('origin', 'master', (v3) => {
                    let _package = { code: RespondCode.OK };
                    res.json(_package);
                    return;
                    //});
                }
            });
        }
    });
    //let _package = {code: RespondCode.SHELL_CALL_ERROR, msg: "archive failed."};
    //res.json(_package);
}
 
function GetClientStatus(req: any, res: any) {
    ShellCall.GitLog((ok, stdout) => {
        if (ok) {
            let _package = { code: RespondCode.OK, data: stdout };
            res.json(_package);
            return;
        }
    });
}
 
function GetFolderContentInfo(req: any, res: any, data: ITransactionData) {
    const _t = data as Required<Pick<ITransactionData, 'path'>>;
    let _path = GlobalPaths.ROOT_ASSETS;
    if (_t.path) {
        _path += _t.path;
    }
    const _data = {
        'path': data ? data.path : './',
        'folders': [],
        'imgs': [],
        'archives': [],
        'others': [],
    }
    FS.readdirSync(_path).forEach(function(name) {
        const filePath = PATH.join(_path, name);
        const stat = FS.statSync(filePath);
        if (stat.isFile()) {
            const _n = name.toLowerCase();
            if (_n.indexOf('jpg') > 0) _data.imgs.push(name);
            else if (_n.indexOf('jpeg') > 0) _data.imgs.push(name);
            else if (_n.indexOf('bmp') > 0) _data.imgs.push(name);
            else if (_n.indexOf('png') > 0) _data.imgs.push(name);
            else if (_n.indexOf('svg') > 0) _data.imgs.push(name);
            else if (_n.indexOf('webp') > 0) _data.imgs.push(name);
            else if (_n.indexOf('zip') > 0) _data.archives.push(name);
            else if (_n.indexOf('7z') > 0) _data.archives.push(name);
            else if (_n.indexOf('7zip') > 0) _data.archives.push(name);
            else if (_n.indexOf('gzip') > 0) _data.archives.push(name);
            else if (_n.indexOf('rar') > 0) _data.archives.push(name);
            else if (_n.indexOf('tar.gz') > 0) _data.archives.push(name);
            else _data.others.push(name);
        } else if (stat.isDirectory()) {
            if (name[0] !== '.') _data.folders.push(name);
        }
    });
    const _package: IResposeData = { code: RespondCode.OK, data: _data };
    res.json(_package);
}
*/

/*
function UpdateExternalWebInfo(req: any, res: any, data: ITransactionData) {
    const q = URL.parse(data.url, true);
    let _protocal;
    switch (q.protocol) {
        case "http:":
            _protocal = http;
            break;
        case "https:":
            _protocal = https;
            break;
    }
    if (_protocal) {
        ///Log.Info(`requesting url is: ${data.url}`);
        _protocal.get(data.url, function(_sy) {
            let str = '';
            //Logger.Info('Response is: ', _sy.statusCode);
 
            _sy.on('data', function(chunk) {
                //Logger.Info(`data stream...`);
                str += chunk;
            });
 
            _sy.on('end', function() {
                const $ = cheerio.load(str);
                ///Logger.Debug(str);
                //const _head = $('head');
                //Logger.Info(`head html is: ${_head.toString()}`);
                //<meta property="og:description" content="Documentation for the Tailwind CSS framework.">
                const url = data.url;
                const title = $('title').text();
                let desc = $("meta[name='description']").attr('content');
                desc = desc ?? $("meta[name='og:description']").attr('content');
                desc = desc ?? $("meta[name='twitter:description']").attr('content');
                let imgSrc = $("meta[property='image']").attr('content');
                imgSrc = imgSrc ?? $("meta[property='og:image']").attr('content');
                imgSrc = imgSrc ?? $("meta[property='twitter:image']").attr('content');
                if (imgSrc && !imgSrc.startsWith('http')) {
                    imgSrc = url + imgSrc;
                }
                let favIcon = $("link[type='image/png']").attr('href');
                if (favIcon && !favIcon.startsWith('http')) {
                    favIcon = url + favIcon;
                }
 
 
                const _package = { code: RespondCode.OK, data: { title, desc, url, favIcon, imgSrc } };
                res.json(_package);
            });
        });
    } else {
        const _package = { code: RespondCode.OK_WITH_INFO, msg: `can not recognise protocal of ${data.url}` };
        res.json(_package);
    }
}
*/

/*
const _mapHandler: Record<string, _fn_t> = {
RequestCode.GET_ALL_META_DATA: GetPageList,
RequestCode.GET_FOLDER_CONTENT_INFO: GetFolderContentInfo,
RequestCode.ADD_META_DATA: AddPage,
RequestCode.UPDATE_META_DATA: UpdatePage,
RequestCode.DELETE_META_DATA: DeletePage,
RequestCode.GET_ARTICLE_DATA: GetPage,
RequestCode.ADD_SECTION_DATA: AddWidget,
RequestCode.UPDATE_SECTION_DATA: UpdateWidget,
RequestCode.MOVE_SECTION_DATA: MoveSectionData,
RequestCode.DELETE_SECTION_DATA: DeleteWidget,
RequestCode.UPDATE_EXTERNAL_WEB_INNFO: UpdateExternalWebInfo,
RequestCode.ARCHIVE: Archive,
RequestCode.CLIENT_STATUS: GetClientStatus,
RequestCode.LOGIN: Login,
};
*/
const _mapHandler = new Map<RequestCode, _fn_t>();
_mapHandler.set(RequestCode.LOGIN, Login);
_mapHandler.set(RequestCode.GET_PAGE_LIST, GetPageList);
_mapHandler.set(RequestCode.GET_PAGE, GetPage);
_mapHandler.set(RequestCode.ADD_PAGE, AddPage);
_mapHandler.set(RequestCode.UPDATE_PAGE, UpdatePage);
_mapHandler.set(RequestCode.DELETE_PAGE, DeletePage);
_mapHandler.set(RequestCode.ADD_WIDGET, AddWidget);
_mapHandler.set(RequestCode.UPDATE_WIDGET, UpdateWidget);
_mapHandler.set(RequestCode.DELETE_WIDGET, DeleteWidget);
//_mapHandler.set(RequestCode.MOVE_SECTION_DATA, MoveSectionData);
//_mapHandler.set(RequestCode.GET_FOLDER_CONTENT_INFO, GetFolderContentInfo);
//_mapHandler.set(RequestCode.UPDATE_EXTERNAL_WEB_INNFO, UpdateExternalWebInfo);
//_mapHandler.set(RequestCode.ARCHIVE, Archive);
//_mapHandler.set(RequestCode.CLIENT_STATUS, GetClientStatus);
//

const _SM: SessionManager = new SessionManager();

export default function Server(req: any, res: any): void {
    let _package = req.body as request_t
    //Logger.Debug("request code:", _package.code);
    //console.log('Signed Cookies: ', req.signedCookies);
    let _fn: _fn_t | undefined = _mapHandler.get(_package.code);
    if (_fn) {
        Logger.Debug('cookies is:', req.signedCookies);
        let _s: Session | undefined = _SM.GetSession(req.signedCookies['sid'] as string);
        _fn(res, _s, _package);
    } else {
        Logger.Error(`no such requesting code: ${_package.code} `);
        res.end(JSON.stringify({ code: RespondCode.OK, msg: "error requesting code." }));
    }
}

