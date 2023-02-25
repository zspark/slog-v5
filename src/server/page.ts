import { pid_t, url_t, page_property_t, page_content_t } from "../common/types"

export type page_layout_t = {
    TOC: boolean;
    cover: boolean;
    info: boolean;
};

export type page_t = {
    id: pid_t,
    layout: page_layout_t,
    property: page_property_t,
    content?: page_content_t,
}

