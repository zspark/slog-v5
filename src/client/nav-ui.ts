import { pid_t, page_property_t } from "../common/types"
import Logger from "../common/logger"
import { EventPhase } from "./core/event-types"
import * as Utils from "./utils"
import NavModel, { NavEventMap } from "./nav-model"
import * as DataModel from "./data-model"
import PageController from "./page-controller"
import NavController from "./nav-controller"

let _navDropdown: HTMLElement;
let _navDropdownItem: HTMLElement;
function Init(TPL: Element): void {
    NavModel.Subscribe('nav-history-appended-event', (evt: NavEventMap['nav-history-appended-event']) => {
        switch (evt.phase) {
            case EventPhase.RESPOND:
                _UpdateHistroyList(evt.historyList);
                if (evt.historyList.length > 0) {
                    _navPage.textContent = evt.historyList[0].title
                }
                break;
        }
    });
    DataModel.Subscribe('pagelist-fetch-event', (evt: DataModel.PageEventMap['pagelist-fetch-event']) => {
        switch (evt.phase) {
            case EventPhase.BEFORE_RESPOND:
                _navPage.innerHTML = '<i>click to show list of history pages.</i>';
                break;
        }
    });



    let _value = Utils.GetAndRemoveElement(TPL, '[slg-dropdown-nav]');
    if (_value) {
        _navDropdown = _value as HTMLElement;
        _navDropdownItem = Utils.GetAndRemoveElement(_value, 'ul li') as HTMLElement;
        _navDropdown.onclick = e => {
            const pid: string = String((e.target as HTMLElement).dataset['slgPid']);
            if (pid) {
                PageController.TryFetchPage(pid);
            }
        }
    }

    let _navHome: HTMLElement = Utils.GetElement(TPL, '[slg-nav-home]');
    _navHome.onclick = e => {
        PageController.TryFetchPageList();
    }

    let _navPage: HTMLElement = Utils.GetElement(TPL, '[slg-nav-page]');
    _navPage.onclick = e => {
        e.stopPropagation();
        //const _target: HTMLElement = _navPage;// e.target as HTMLElement;
        //debugger;
        const _finalPos = Utils.CalcuDropdowPos(_navDropdown, { x: e.clientX, y: _navPage.offsetTop + _navPage.offsetHeight + 4 });
        Show(_finalPos.x, _finalPos.y);
    }

    /*
    NavController.Subscribe('nav-clicked-event', (evt: NavEventMap['nav-clicked-event']) => {
        switch (evt.phase) {
            case EventPhase.BEFORE_RESPOND:
                break;
            case EventPhase.RESPOND:
                //PageController.TryFetchPage(evt.pid);
                break;
        }
    })
    */

}
function Show(x: number, y: number): void {
    _navDropdown.style.top = `${y}px`;
    _navDropdown.style.left = `${x}px`;
    document.body.append(_navDropdown);
    document.onclick = e => {
        Logger.Info(`clicked pos:${e.clientX},${e.clientY}`);
        _navDropdown.remove();
        document.onclick = null;
    }
}

function _UpdateHistroyList(list: Array<page_property_t>): void {
    const _ul = Utils.GetElement(_navDropdown, 'ul');
    _ul.replaceChildren();

    list.forEach(pp => {
        const _e: Element = _navDropdownItem.cloneNode(true) as Element;
        const _a = _e.querySelector('a');
        if (_a) {
            _a.setAttribute('data-slg-pid', pp.id);
            _a.textContent = pp.title;
            _ul.append(_e);
        }
    })
}

//const Dispatch = _eh.Dispatch.bind(_eh);
export default { Show, Init }

