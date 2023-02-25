export enum EventPhase {
    UNKNOWN = -999,
    BEFORE_REQUEST = -2,
    BEFORE_RESPOND = -1,
    RESPOND = 0,
    AFTER_RESPOND = 1,
    AFTER_REQUEST = 2,
}

export type event_feedback_t = {
    ok: boolean,
    reason?: string,
}

