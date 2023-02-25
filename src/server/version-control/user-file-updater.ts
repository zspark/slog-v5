import Logger from "../../common/logger"
import { PRIVILEGE, USER_TYPE } from "../core/privilege"
import { version_t, MakeVersion, GetVersionString } from "./version"
import { user_t } from "../core/user-type"

type user_file_base_format_t = {
    version: version_t,
    users: Array<any>,
}

type user_file_v0_5_t = {
    version: version_t,
    users: Array<{
        account: string,/// mail mostly.
        password: string,/// md5 encrypted.
        type: USER_TYPE,
        displayName: string,
        privilege: PRIVILEGE,
    }>
}

const _newestVersion = MakeVersion(0, 5, 0, 0);
const _newestVersionString = GetVersionString(_newestVersion, 2);
type _newestFileVersion = user_file_v0_5_t;

function Update(arrUser: Array<user_t>): string {
    const _tmp: _newestFileVersion = {
        version: _newestVersion,
        users: [],
    }
    for (let i = 0, N = arrUser.length; i < N; ++i) {
        _tmp.users.push({
            account: arrUser[i].account,
            password: arrUser[i].password,
            type: arrUser[i].type,
            displayName: arrUser[i].displayName,
            privilege: arrUser[i].privilege,
        });
    }
    return JSON.stringify(_tmp);
}

type parser_func_t = (a: user_file_base_format_t, out: Array<user_t>) => void;
const _Parsers: Record<string, parser_func_t> = {};
_Parsers[GetVersionString(MakeVersion(0, 5, 0, 0), 2)] = (input: user_file_v0_5_t, out: Array<user_t>): void => {
    for (let i = 0, N = input.users.length; i < N; ++i) {
        const _tmp = input.users[i];
        let _u: user_t = {
            account: _tmp.account,
            password: _tmp.password,
            displayName: _tmp.displayName,
            type: _tmp.type ?? USER_TYPE.VISITOR,
            privilege: _tmp.privilege ?? PRIVILEGE.READ,
            registTime: new Date().toISOString(),
        };
        out.push(_u);
    }
}

function Parse(input: string, out: Array<user_t>): boolean {
    try {
        const _tmp = JSON.parse(input) as user_file_base_format_t;
        const _V = GetVersionString(_tmp.version, 2);
        const _parser = _Parsers[_V];
        if (_parser) {
            _parser(_tmp, out);
            if (out.length <= 0) {
                Logger.Error(`users.json file has NO content, please add manully.`);
            }
            return _V !== _newestVersionString;
        } else {
            Logger.Error('there is No such parser for user file of version:', _V);
            return false;
        }
    } catch (e: any) {
        Logger.Error('user file parse error!\n', e);
        return false;
    }
}

export default { Parse, Update };
