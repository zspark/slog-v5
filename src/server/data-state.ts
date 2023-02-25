import { pid_t, wid_t } from "../common/types"

const _mapSync = new Map<pid_t | wid_t, sync_id_t>();
type sync_id_t = number;
function GetSyncId(target: pid_t | wid_t): sync_id_t | undefined {
    return _mapSync.get(target);
}
function UpdateSyncId(target: pid_t | wid_t): sync_id_t {
    const _v = Date.now();
    _mapSync.set(target, _v);
    return _v;
}
export default { GetSyncId, UpdateSyncId };
