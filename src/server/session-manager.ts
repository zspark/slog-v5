import { pid_t } from "../common/types"
import Logger from "../common/logger"
import {GenID} from "../common/id-generator"
import { User, GetVisitor } from "./user-manager"
import * as PropertyWorker from "./page-property-worker"
import * as ContentWorker from "./page-content-worker"

export type sid_t = string;

export class Session {
    readonly sid: sid_t;
    private _user: User;

    constructor(id: sid_t, user: User) {
        this.sid = id;
        this._user = user;
    }

    GetHandleOfContent(pid: pid_t): ContentWorker.IContentWorker {
        return ContentWorker.GetPageContentWorker(this._user.type, pid);
    }

    GetHandleOfProperty(): PropertyWorker.IPropertyWorker {
        //Logger.Debug(`pid:`, pid, " ", this._propertyManipulator);
        return PropertyWorker.GetPagePropertyWorker(this._user.type);
    }
}

type SessionInfo = {
    createTime: string,
    lastSyncTime: string,
    session: Session,
    readonly user: User,
}
function CreateSessionInfo(s: Session, user: User): SessionInfo {
    return {
        createTime: new Date().toISOString(),
        lastSyncTime: new Date().toISOString(),
        session: s,
        user,
    }
}


export class SessionManager {
    private _mapSession = new Map<sid_t, SessionInfo>();
    private _visitorSession: Session;
    private _timerId: number;

    constructor() {
        this._visitorSession = new Session('visitor-session-id', GetVisitor());
        this._timerId = setInterval(_ => {
            this._mapSession.forEach(sInfo => {
            });
            this._mapSession.clear();
        }, 24 * 60 * 60 * 1000);
    }

    GetSession(sid: sid_t | undefined): Session | undefined {
        if (sid) {
            return this._mapSession.get(sid)?.session;
        }
    }

    GetVisitorSession(): Session { return this._visitorSession; }

    DeleteSession(sid: sid_t): void {
        const _sInfo: SessionInfo | undefined = this._mapSession.get(sid);
        if (_sInfo) {
            this._mapSession.delete(sid);
        }
    }

    CreateSession(user: User): Session {
        const _s: Session = new Session(GenID(), user);
        this._mapSession.set(_s.sid, CreateSessionInfo(_s, user));
        return _s;
    }
}

