import { WIDGET_TYPE } from "../common/types"
//import { EventHandler } from "./core/event"
//import { EventPhase } from "./core/event-types"
import * as Utils from "./utils"
import Logger from "../common/logger"
import PageController from "./page-controller"

/*
interface MenuEventMap {
    'menu-selected-event': {
        readonly phase: EventPhase;
        readonly name: string;
    },
}
const _eh = new EventHandler<MenuEventMap>();
*/

const _Rec: Record<string, WIDGET_TYPE> = {
    'markdown': WIDGET_TYPE.MARKDOWN,
    'math': WIDGET_TYPE.MATH,
    'custom': WIDGET_TYPE.CUSTOM,
}
let _comfirmElement: HTMLElement;
let _menuElement: HTMLElement;
function Init(TPL: Element): void {
    let _value = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-widgets]');
    if (_value) {
        _menuElement = _value as HTMLElement;
    } else _menuElement = document.createElement('div');

    _value = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-comfirm]');
    if (_value) {
        _comfirmElement = _value as HTMLElement;
    } else _comfirmElement = document.createElement('div');

    document.addEventListener('click', e => {
        __removeAll();
    });
}

const _arrHideFunc: Array<Function> = [];
function __removeAll(): void {
    _arrHideFunc.forEach(fn => { fn() });
    _arrHideFunc.length = 0;
}

function ShowMenuAt(x: number, y: number, cbFunc: (type: WIDGET_TYPE) => void): void {
    __removeAll();
    const _finalPos = Utils.CalcuDropdowPos(_menuElement, { x, y });
    _menuElement.style.top = `${_finalPos.y}px`;
    _menuElement.style.left = `${_finalPos.x}px`;
    _menuElement.onclick = e => {
        const name: string = String((e.target as HTMLElement).dataset['slgMenu']);
        Logger.Info(`selected: ${name}`);
        //_eh.Dispatch('menu-selected-event', { phase: EventPhase.BEFORE_RESPOND, name });
        //_eh.Dispatch('menu-selected-event', { phase: EventPhase.RESPOND, name });
        //_eh.Dispatch('menu-selected-event', { phase: EventPhase.AFTER_RESPOND, name });
        cbFunc && cbFunc(_Rec[name]);
    }
    document.body.append(_menuElement);
    _arrHideFunc.push(() => {
        //Logger.Info(`mouse pos:${e.clientX},${e.clientY}`);
        _menuElement.remove();
        _menuElement.onclick = null;
    });
}

function ShowComfirmAt(x: number, y: number, cbFunc: (state: number) => void): void {
    __removeAll();
    const _finalPos = Utils.CalcuDropdowPos(_comfirmElement, { x, y });
    _comfirmElement.style.top = `${_finalPos.y}px`;
    _comfirmElement.style.left = `${_finalPos.x}px`;
    Utils.GetElement(_comfirmElement, '[slg-btn-comfirm]').onclick = e => {
        cbFunc && cbFunc(1);
    }
    document.body.append(_comfirmElement);
    _arrHideFunc.push(() => {
        //Logger.Info(`mouse pos:${e.clientX},${e.clientY}`);
        _comfirmElement.remove();
        _comfirmElement.onclick = null;
    });
}

//const Subscribe = _eh.Subscribe.bind(_eh);
//const Unsubscribe = _eh.Unsubscribe.bind(_eh);
//const Dispatch = _eh.Dispatch.bind(_eh);
//export default { Subscribe, Unsubscribe, ShowMenuAt, Init }
export default { ShowMenuAt, ShowComfirmAt, Init }
