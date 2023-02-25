import { url_t } from "../common/types"
import Logger from "../common/logger"
import { RespondCode } from "../common/message"
import { GlobalPaths } from "./core/basic"
import * as FileIO from "./core/file-io"
import { PRIVILEGE, USER_TYPE } from "./core/privilege"
import { user_t } from "./core/user-type"
import UserFileUpdater from "./version-control/user-file-updater"

const VISITOR_ID = 'id-visitor';

const visitor: user_t = {
    account: VISITOR_ID,
    password: '',
    privilege: PRIVILEGE.READ,
    type: USER_TYPE.VISITOR,
    displayName: "visitor",
    registTime: new Date().toISOString(),
}

export class User {
    private _userInfo: user_t;

    constructor(data: user_t) {
        Logger.Info(`User info: account->${data.account}, name->${data.displayName}`);
        this._userInfo = data;
    }
    get account(): string { return this._userInfo.account; }
    get displayName(): string { return this._userInfo.displayName; }
    get privilege(): PRIVILEGE { return this._userInfo.privilege; }
    get type(): USER_TYPE { return this._userInfo.type; }
    get userInfo(): user_t {
        return JSON.parse(JSON.stringify(this._userInfo)) as user_t;
    }

    CheckPassword(pwd: string): boolean {
        //console.info(`check, user:${this._account}, pwd:${this._pwd}, inputPWD:${pwd}`);
        return this._userInfo.password === pwd;
    }
}

const users = new Map<string, User>();

(function() {
    const _userFileURL: url_t = GlobalPaths.ROOT_CONTENT + "users.json";
    const _str: string | undefined = FileIO.ReadFileUTF8(_userFileURL);
    if (!_str) {
        Logger.Error(`no users.josn file exist, please create manully.`);
    } else {
        const _arrUser: Array<user_t> = [];
        if (UserFileUpdater.Parse(_str, _arrUser)) {
            FileIO.WriteFileUTF8(_userFileURL, UserFileUpdater.Update(_arrUser));
        }
        if (_arrUser.length > 0) {
            for (let i = 0, _N = _arrUser.length; i < _N; ++i) {
                const _data: user_t = _arrUser[i];
                users.set(_data.account, new User(_data));
            }
            users.set(visitor.account, new User(visitor));
        } else {
            Logger.Error(`users.json file has NO info, please add manully.`);
        }
    }
})();

export function CheckAccount(account: string | undefined, pwd: string | undefined): RespondCode {
    if (account && pwd) {
        let _u = users.get(account);
        if (_u) {
            if (_u.CheckPassword(pwd)) {
                return RespondCode.OK;
            } else {
                return RespondCode.PASSWORD_ERROR;
            }
        }
        return RespondCode.ACCOUNT_NOT_EXIST;
    }
    return RespondCode.UNKNOW_ERROR;
}

export function GetUser(account: string): User | undefined {
    return users.get(account)
}

export function GetVisitor(): User {
    return GetUser(visitor.account) as User;
}
