export interface Item {
    /**
     * 宽度
     */
    width: number;
    /**
     * 高度
     */
    height: number;
    key: string;
    /**
     * 索引
     */
    _index?: number;
    _max?: number;
    _width?: number;
    _height?: number;
    x?: number;
    y?: number;
}

export interface CollectionItem {
    data: Item;
}

export interface IColumns {
    height: number;
    len: number;
    items: Item[];
}

export interface IRows {
    itemTotalWidth: number;
    __rowHeight__?: number;
    items: Item[];
}

export enum LayoutMode {
    Waterfall = 'waterfall',
    Grid = 'grid',
    List = 'list',
    SameHeight = 'same-height',
}
