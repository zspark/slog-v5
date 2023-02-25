import { ResposeCode } from "../common/i-server-client"
import { url_t, pid_t, wid_t } from "../common/i-types"
import { PagePropertyNode, page_property_t, summary_t } from "../common/i-page"
import { widget_t } from "../common/i-widget"
import * as Methods from "../common/methods"
///import * as Logger from "../common/logger"
import { PageHandler } from "./page-handler"
import * as Tree from "../common/tree"
import { GlobalPaths } from "./basic"
import * as IOSystem from "./io_system"

const _TEMPLATE_SUMMARY_: Readonly<summary_t> = {
    version: { major: 5, minor: 0, patch: 0 },
    items: [],
};

const _summaryFileURL: url_t = `${GlobalPaths.ROOT_CONTENT}pages/.summary.json`;


function _GetChildrenTransferJsonObject(parentNode, includeChildren) {
    const _children = [];
    let _node = parentNode.firstChildNode;
    while (_node) {
        _children.push(_node.GetTransferJsonObject(includeChildren));
        _node = _node.nextNode;
    }
    return _children;
}

class RootNode implements Tree.INode {
    constructor() {
    }
    GetTransferJsonObject(includeChildren) {
        return _GetChildrenTransferJsonObject(this, includeChildren);
    }
    get id(): Tree.ID_t { return "__ROOT_NODE__"; };
}

const _rootNode = new RootNode();
Tree.RegistNode(_rootNode);
const _mapNode = new Map<pid_t, PagePropertyNode>();

function _SaveSummary(): void {
    const _out = JSON.parse(JSON.stringify(_TEMPLATE_SUMMARY_));
    _out.items = _rootNode.GetTransferJsonObject(true);
    IOSystem.WriteFileUTF8(_summaryFileURL, JSON.stringify(_out));
}

function GetSummary() {
    const _out = JSON.parse(JSON.stringify(_TEMPLATE_SUMMARY_));
    _out.items = _rootNode.GetTransferJsonObject(true);
    return _out;
}

function AddMetaData(value: page_property_t): ResposeCode {
    let _node = _mapNode.get(value.PID);
    if (_node) {
        return ResposeCode.META_ALREADY_EXIST;
    } else {
        _node = new PagePropertyNode(value.PID);
        _node.CopyFrom(value);
        Tree.RegistNode(_node);
        _mapNode.set(value.PID, _node);

        let _pNode: Tree.INode | undefined;
        if (value.PPID) _pNode = _mapNode.get(value.PPID);
        _pNode = _pNode ?? _rootNode;
        Tree.Append(_node, _pNode);
        _SaveSummary();
        return ResposeCode.OK;
    }
}

function UpdateMetaData(value: page_property_t): ResposeCode {
    const _node = _mapNode.get(value.PID);
    if (_node) {
        _node.CopyFrom(value);
        _SaveSummary();
        return ResposeCode.OK;
    } else {
        return ResposeCode.META_NOT_EXIST;
    }
}

function DeletePage(PID: pid_t): ResposeCode {
    const _node = _mapNode.get(PID);
    if (_node) {
        if (Tree.UnregistNode(_node)) {
            _mapNode.delete(PID);
            _SaveSummary();
            PageHandler(PID).Delete();
            return ResposeCode.OK;
        }
    }
    return ResposeCode.META_NOT_EXIST;
}

function GetArticleData(PID: pid_t): string {
    return PageHandler(PID).GetPageString();
}

function AddSectionData(PID: pid_t, index: number, sectionData: widget_t): ResposeCode {
    ///Log.Info(`AddSectionData(),PID:${PID},index:${index},sectionData:${JSON.stringify(sectionData)}`);
    const _h = PageHandler(PID);
    const _config = _h.GetConfigJson();
    const _metas = _config.items;
    if (_metas[sectionData.WID]) {
        return ResposeCode.SECTION_ALREADY_EXIST;
    } else {
        //// save index;
        const _indexes = _config.indexes;
        index = Methods.Clamp<number>(0, _indexes.length - 1, index);
        _indexes.splice(index, 0, sectionData.WID);
        _metas[sectionData.WID] = {
            WID: sectionData.WID,
            type: sectionData.type,
        };
        _h.SetConfigJson(_config);
        return ResposeCode.OK;
    }
}

function MoveSectionData(PID: pid_t, WID: wid_t, index: number): ResposeCode {
    const _h = PageHandler(PID);
    const _config = _h.GetConfigJson();
    const _indexes = _config.indexes;
    const _oldIndex = _indexes.indexOf(WID);
    if (_oldIndex >= 0) {
        _indexes.splice(_oldIndex, 1);
        index = Methods.Clamp(0, _indexes.length - 1, index);
        _indexes.splice(index, 0, WID);
        _h.SetConfigJson(_config);
        return ResposeCode.OK;
    } else {
        return ResposeCode.SECTION_NOT_EXIST;
    }
}

function UpdateSectionData(PID: pid_t, sectionData: widget_t): ResposeCode {
    const _h = PageHandler(PID);
    const _config = _h.GetConfigJson();
    const _indexes = _config.indexes;
    const _idx = _indexes.indexOf(sectionData.WID);
    if (_idx >= 0) {
        _h.SetWidgetJson(sectionData.WID, sectionData.data);
        return ResposeCode.OK;
    } else {
        return ResposeCode.SECTION_NOT_EXIST;
    }
}

function DeleteSectionData(PID: pid_t, WID: wid_t): ResposeCode {
    ///Log.Info(`DeleteSectionData(),PID:${PID},WID:${WID}`);
    const _h = PageHandler(PID);
    const _config = _h.GetConfigJson();
    const _metas = _config.items;
    if (_metas[WID]) {
        delete _metas[WID];
    } else {
        return ResposeCode.SECTION_NOT_EXIST;
    }
    const _indexes = _config.indexes;
    const _idx = _indexes.indexOf(WID);
    if (_idx >= 0) {
        _indexes.splice(_idx, 1);
    } else {
        return ResposeCode.SECTION_NOT_EXIST;
    }
    _h.SetConfigJson(_config);

    /// delete widget;
    _h.DelWidget(WID);

    return ResposeCode.OK;
}

(function() {
    const _configObject: summary_t = JSON.parse(IOSystem.ReadFileUTF8(_summaryFileURL) ?? JSON.stringify(_TEMPLATE_SUMMARY_));
    let _InsertToTree = function(parentNode: Tree.INode, arrChild: Array<page_property_t>) {
        for (let i = arrChild.length - 1; i >= 0; --i) {
            const _obj = arrChild[i];
            const _node = new PagePropertyNode(_obj.PID);
            _node.CopyFrom(_obj);
            Tree.RegistNode(_node);
            Tree.Append(_node, parentNode);
            _mapNode.set(_node.id, _node);
            _InsertToTree(_node, _obj.children);
        }
    }
    _InsertToTree(_rootNode, _configObject.items);
})()


export default {
    GetSummary,
    AddMetaData,
    UpdateMetaData,
    DeletePage,

    GetArticleData,
    AddSectionData,
    UpdateSectionData,
    MoveSectionData,
    DeleteSectionData,
}
