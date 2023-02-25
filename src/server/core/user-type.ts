import { PRIVILEGE, USER_TYPE } from "./privilege"
import { version_t } from "../version-control/version"

export type user_t = {
    account: string,/// mail mostly.
    password: string,/// md5 encrypted.
    privilege: PRIVILEGE,
    type: USER_TYPE,
    registTime: string,/// iso string of Date;
    displayName: string,
}

