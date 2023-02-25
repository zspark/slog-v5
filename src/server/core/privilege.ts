export enum PRIVILEGE {
    UNKNOWN = 0x0,
    READ = 0x1,
    MODIFY = 0x1 << 1,
    CREATE = 0x1 << 2,
    DELETE = 0x1 << 3,
}

export enum USER_TYPE {
    FORBIDDANCE = -9999,
    UNKNOWN = 0,
    VISITOR = 1,
    EDITOR = 10,
    MASTER = 9999,
}

export enum ACCESSIBILITY {
    UNKNOWN = 0x0,
    CAN_BE_READ = 0x1,
    CAN_BE_MODIFIED = 0x1 << 1,
    CAN_BE_DELETED = 0x1 << 2,
}

export enum VISIBILITY {
    UNKNOWN = 0x0,
    HIDEN_TO_VISITOR = 0x1 << 3,
    HIDEN_TO_EDITOR = 0x1 << 6,
}

