import DynamicImport from "../common/dynamic-import";
import Logger from "../common/logger";
import ServerProxy from "./core/server-proxy"
import { LoadScriptWithHTMLScriptTag } from "./utils"

type windowWithMd5 = Window & typeof globalThis & { MD5: Function };

const _con: HTMLElement = document.querySelector('[before-loaded]') as HTMLElement;
const _loading: HTMLElement = _con.querySelector('[slg-loading]') as HTMLElement;
const _debugOn = true;
const _arrPromise: Promise<any>[] = [];

const _uiFilePath: string = "../ui/";
const _URL = new URL(window.location.href);
const _action = _URL.searchParams.get("action");
if (_action) {
    switch (_action) {
        case "login":
            const _arr: Array<Promise<any>> = [];
            _arr.push(LoadScriptWithHTMLScriptTag('./lib/md5/md5.min.js'));
            _arr.push(DynamicImport(_debugOn ? `${_uiFilePath}login.ui.js` : `${_uiFilePath}login.ui.js`));
            Promise.all(_arr).then(arrModel => {
                const _doc = new DOMParser().parseFromString(arrModel[1].default, 'text/html');
                const _targetElem: HTMLElement | null = _doc.querySelector("body [slg-login]");
                if (_targetElem) {
                    _con.append(_targetElem);
                    const _button: HTMLButtonElement = _targetElem.querySelector('[slg-login-button]') as HTMLButtonElement;
                    _button.onclick = e => {
                        const _r: string = (_targetElem.querySelector("input[name='rem']") as HTMLInputElement).value;
                        const _a: string = (_targetElem.querySelector("input[name='account']") as HTMLInputElement).value;
                        const _p: string = (_targetElem.querySelector("input[name='pwd']") as HTMLInputElement).value;
                        ServerProxy.Login(_a, (window as windowWithMd5).MD5(_p)).then(_ => {
                            Logger.Info('login successfully');
                            Promise.all(_arrPromise).then((arrData) => {
                                const Application: any = arrData[1].default;
                                const _doc2 = new DOMParser().parseFromString(arrData[0].default, 'text/html');
                                new Application(_doc2.body);

                                const _arrElem: Array<Node> = [];
                                _doc2.body.childNodes.forEach(n => {
                                    _arrElem.push(n);
                                });
                                document.body.replaceChildren(..._arrElem);

                            });
                        }, _ => { }).finally(() => {
                            _button.onclick = null;
                        });
                    }
                    _loading.remove();
                }
            });
            break;
        case "open":
        default:
            break;
    }
    _arrPromise.push(DynamicImport(_debugOn ? `${_uiFilePath}main.ui.js` : `${_uiFilePath}main.ui.js`));
    _arrPromise.push(DynamicImport(_debugOn ? `./main.bundle.js` : `./main.bundle.min.js`));
}

/*
const _targetElem: HTMLElement = document.querySelector('[slg-login]');
const _buttonSVG: SVGElement = _targetElem.querySelector('[slg-login-button] svg');

*/


//_arrPromise.push(DynamicImport(_debugOn ? "./init.bundle.js" : "./init.bundle.min.js"));
//_arrPromise.push(DynamicImport(_debugOn ? "" : ""));


