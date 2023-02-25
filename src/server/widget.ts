import { wid_t, WIDGET_TYPE } from "../common/types"
import { ICollectionItem } from "./core/collection"


export interface IWidgetContent extends ICollectionItem<wid_t> {
    readonly WID: wid_t;
    readonly type: WIDGET_TYPE;

    new(WID: wid_t, type: WIDGET_TYPE, data?: Record<string, string>): IWidgetContent;
    GetContentOfField(fname: string): string;
    SetContentOfField(fname: string, content: string): void;
    GenTransformData(): Object;
}

