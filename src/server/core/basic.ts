import Logger from "../../common/logger"

const _ROOT = './';
export const GlobalPaths = Object.freeze({
    ROOT: _ROOT,
    ROOT_DEPLOYMENT: _ROOT + "../deployment/",
    ROOT_SERVER: _ROOT + "src/",
    ROOT_CONTENT: _ROOT + "../deployment/content/",
    ROOT_CLIENT: _ROOT + "../deployment/www/",
    ROOT_ASSETS: _ROOT + "../deployment/content/assets/",
})
Logger.Info(`root path is:${GlobalPaths.ROOT}
www(client) path is:${GlobalPaths.ROOT_CLIENT}
server path is:${GlobalPaths.ROOT_SERVER}
content path is:${GlobalPaths.ROOT_CONTENT}`);

