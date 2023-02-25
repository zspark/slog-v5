import Logger from "./logger";

export type id_t = string;
export interface INodeData {
    get id(): id_t;
};
export type callback_func_t<T extends INodeData> = (n: TreeNode<T>) => boolean;
/*
export enum INFO_FLAG {
    DEPTH = 1,
    PARENT = 2,
}
*/
export type TreeNode<T extends INodeData> = {
    readonly data: T;
    readonly id: id_t;
    readonly pId?: id_t;
    readonly depth: number;
    readonly index: number;
    readonly numberChildren: number;
    ChildAt(index: number): TreeNode<T> | undefined;
};

class Node_internal<T extends INodeData> {
    private _parent?: Node_internal<T>;
    private _children: Array<Node_internal<T>> = [];
    private _data: T;
    private _nodeInfo: TreeNode<T>;

    constructor(data: T) {
        this._data = data;

        const _that = this;
        this._nodeInfo = {
            ChildAt(idx: number): TreeNode<T> | undefined {
                return _that.GetChildAt(idx)?.GetInfo();
            },
            get data() { return _that._data; },
            get id(): id_t { return _that.id; },
            get pId(): id_t | undefined { return _that.pId; },
            get index(): number { return _that.index; },
            get depth(): number { return _that.depth; },
            get numberChildren(): number { return _that.numberChildren; },
        };
    }

    get id(): id_t { return this._data.id; }
    get pId(): id_t | undefined { return this._parent ? this._parent.id : undefined; }
    get index(): number { return this._parent ? this._parent.GetChildIndex(this) : -1; }
    get parent(): NodeOrUnd<T> { return this._parent; }
    set parent(p: NodeOrUnd<T>) { this._parent = p; }
    get numberChildren(): number { return this._children.length; }
    get depth(): number {
        let _v = 0;
        let _pNode = this._parent;
        while (_pNode) {
            ++_v;
            _pNode = _pNode._parent;
        }
        return _v;
    }
    Destroy() {
        this._parent = undefined;
        this._children.length = 0;
    }
    GetChildIndex(node: Node_internal<T>): number {
        return this._children.indexOf(node);
    }
    GetChildAt(index: number): NodeOrUnd<T> {
        return this._children[index];
    }
    AddChildAt(node: Node_internal<T>, index: number = Number.MAX_SAFE_INTEGER): boolean {
        const _index = this._children.indexOf(node);
        if (_index > -1) {
            if (_index === index) return true;
            this._children.splice(_index, 1);
        }

        index = Math.max(0, Math.min(index, this._children.length));
        this._children.splice(index, 0, node);
        return true;
    }
    ReplaceChildAt(node: Node_internal<T>, index: number): boolean {
        index = Math.max(0, Math.min(index, this._children.length));
        this._children[index] = node;
        return true;
    }
    RemoveChildAt(index: number): boolean {
        return this._children.splice(index, 1).length > 0;
    }
    RemoveChild(node: Node_internal<T>): boolean {
        const _index = this._children.indexOf(node);
        return this._children.splice(_index, 1).length > 0;
    }
    GetInfo(): TreeNode<T> {
        return this._nodeInfo;
    }
}

type NodeOrUnd<T extends INodeData> = Node_internal<T> | undefined;

function _CheckSwitchable<T extends INodeData>(nodeA: Node_internal<T>, nodeB: Node_internal<T>): boolean {
    if (nodeA === nodeB) return false;
    let _dA: number = nodeA.depth;
    let _dB: number = nodeB.depth;
    let _deltaDepth = _dA - _dB;
    if (_deltaDepth === 0) return true;
    else {
        const _pivotNode: Node_internal<T> = _deltaDepth > 0 ? nodeB : nodeA;
        let _node: Node_internal<T> = _deltaDepth > 0 ? nodeA : nodeB;
        _deltaDepth = Math.abs(_deltaDepth);

        while (_deltaDepth !== 0) {
            _node = <Node_internal<T>>_node.parent;
            --_deltaDepth;
        }

        if (_pivotNode !== _node) return true;
        else return false;
    }
}

export type tree_option_t = {
}
export class Tree<T extends INodeData> {
    private _mapNodes = new Map<id_t, Node_internal<T>>();

    constructor(options?: tree_option_t) {
    }

    Get(data: T): TreeNode<T> {
        //Logger.Debug(`Tree::Get(), id is:${data.id}`);
        let _node: NodeOrUnd<T> = this._mapNodes.get(data.id);
        if (!_node) {
            _node = new Node_internal<T>(data);
            this._mapNodes.set(data.id, _node);
        }
        return _node.GetInfo();
    }
    Delete(node: TreeNode<T>): boolean {
        let _node: NodeOrUnd<T> = this._mapNodes.get(node.id);
        return this._Delete(_node);
    }
    DeleteById(id: id_t): TreeNode<T> | undefined {
        let _node: NodeOrUnd<T> = this._mapNodes.get(id);
        return this._Delete(_node) ? _node?.GetInfo() : undefined;
    }
    Append(node: TreeNode<T>, parentNode: TreeNode<T>, index: number = Number.MAX_SAFE_INTEGER): boolean {
        const _node: NodeOrUnd<T> = this._mapNodes.get(node.id);
        if (!_node) {
            Logger.Error(`node may has been deleted.`, node);
            return false;
        }
        const _parentNode: NodeOrUnd<T> = this._mapNodes.get(parentNode.id);
        if (!_parentNode) {
            Logger.Error(`parentNode may has been deleted. data of parent node:`, parentNode.id, parentNode.pId, parentNode.index);
            return false;
        }
        _node.parent?.RemoveChild(_node);
        _node.parent = _parentNode;
        return _parentNode.AddChildAt(_node, index);
    }
    After(node: TreeNode<T>, preNode: TreeNode<T>): boolean {
        if (preNode.pId) {
            const _parentNode: NodeOrUnd<T> = this._mapNodes.get(preNode.pId);
            if (_parentNode) {
                return this.Append(node, _parentNode.GetInfo(), preNode.index);
            }
            return false;
        } else {
            Logger.Error(`preNode has no parent node, preNode:`, preNode);
            return false;
        }
    }
    Exchange(nodeA: TreeNode<T>, nodeB: TreeNode<T>): boolean {
        const _nodeA: NodeOrUnd<T> = this._mapNodes.get(nodeA.id);
        if (!_nodeA) {
            Logger.Error(`nodeA may has been deleted.`, nodeA);
            return false;
        }
        const _nodeB: NodeOrUnd<T> = this._mapNodes.get(nodeB.id);
        if (!_nodeB) {
            Logger.Error(`nodeB may has been deleted.`, nodeB);
            return false;
        }

        if (_CheckSwitchable(_nodeA, _nodeB)) {
            const _preParentNodeA: NodeOrUnd<T> = _nodeA.parent;
            const _preParentNodeB: NodeOrUnd<T> = _nodeB.parent;
            const _indexA = _nodeA.index;
            const _indexB = _nodeB.index;
            _preParentNodeA?.ReplaceChildAt(_nodeB, _indexA);
            _nodeB.parent = _preParentNodeA;
            _preParentNodeB?.ReplaceChildAt(_nodeA, _indexB);
            _nodeA.parent = _preParentNodeB;
            return true;
        }
        Logger.Error(`can not switch two nodes with direct relationship.`);
        return false;
    }
    Remove(node: TreeNode<T>): boolean {
        const _node: NodeOrUnd<T> = this._mapNodes.get(node.id);
        if (!_node) {
            Logger.Error(`node may has been deleted.`, node);
            return false;
        }

        const _ret = _node.parent?.RemoveChild(_node);
        _node.parent = undefined;
        return !!_ret;
    }

    /**
     * depth first;
     * return true means to continue;
     */
    TraverseDescendants(node: TreeNode<T>, callBackFn: callback_func_t<T>): void {
        if (!callBackFn) return;
        function _InsertChildren(pNode: Node_internal<T>, arr: Node_internal<T>[]): void {
            let _index = 0;
            let _cNode: NodeOrUnd<T> = pNode.GetChildAt(_index);
            while (_cNode) {
                arr.push(_cNode);
                if (_cNode.numberChildren > 0) {
                    _InsertChildren(_cNode, arr);
                }
                _cNode = pNode.GetChildAt(++_index);
            }
        }

        const _parentNode: NodeOrUnd<T> = this._mapNodes.get(node.id);
        if (_parentNode) {
            const _arr: Array<Node_internal<T>> = [];
            _InsertChildren(_parentNode, _arr);
            for (let i = 0, N = _arr.length; i < N; ++i) {
                let _node: Node_internal<T> = _arr[i];
                if (!callBackFn(_node.GetInfo())) break;
            }
        } else {
            Logger.Error(`node may has been deleted.`, node);
        }
    }

    private _DebugPrint(n: TreeNode<T>): TreeNode<T> {
        Logger.Debug(`node -> id:${n.id}, pId:${n.pId}, depth:${n.depth}, index:${n.index}, childCount:${n.numberChildren}, data:`, n.data);
        return n;
    }

    Print(node: TreeNode<T>, traverse: boolean = false): TreeNode<T> {
        this._DebugPrint(node);
        if (traverse) {
            this.TraverseDescendants(node, (n) => {
                this._DebugPrint(n);
                return true;
            });
        }
        return node;
    }

    private _Delete(node: NodeOrUnd<T>): boolean {
        if (!!node) {
            node.parent?.RemoveChild(node);
            for (let i = 0, N = node.numberChildren; i < N; ++i) {
                let _cNode: NodeOrUnd<T> = node.GetChildAt(i);
                if (!!_cNode) {
                    _cNode.parent = undefined;
                }
            }
            this._mapNodes.delete(node.id);
            node.Destroy();
            return true;
        }
        return false;
    }
}

