<template>
    <div :class="$style['same-height']" :style="{ marginTop: -gaps[1] + 'px' }">
        <!-- <div :class="$style.row" v-for="(row, index) in listData" :key="index" :style="rowStyle">
            <div
                :class="$style.item"
                :style="{
                    marginLeft: gaps[0] + 'px',
                    width: item._width + 'px',
                }"
                v-for="(item, idx) in row.items"
                :key="item.id"
            >
                <slot :item="item" :index="idx" :width="item._width" :height="row.__rowHeight__" />
            </div>
        </div> -->
        <div
            :class="$style.row"
            v-for="item in renderData"
            :key="item.key"
            :style="{
                marginTop: gaps[1] + 'px',
                marginLeft: item._left + 'px',
                width: item._width + 'px',
            }"
        >
            <slot :item="item" :index="idx" :width="item._width" :height="item._max" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { Item, IRows } from '../types';
import { get } from '../../utils';

interface IData {
    listData: IRows[];
    lastRow: number;
    cacheKeys: string[];
}

export default defineComponent({
    name: 'SameHeight',
    props: {
        data: {
            type: Array as PropType<Item[]>,
            required: true,
        },
        /**
         * 某一缩放比例下对应的图片行高
         */
        rowHeight: {
            type: Number,
            default: 200,
        },
        keyProp: {
            type: String,
            default: '',
        },
        // 边距
        gap: {
            type: [Number, Array] as PropType<number[] | number>,
            default: 10,
        },
        clientWidth: {
            type: Number,
            required: true,
        },
        minRatio: {
            type: Number,
            default: 0.3,
        },
        maxRatio: {
            type: Number,
            default: 2,
        },
    },
    data(): IData {
        return {
            listData: [],
            lastRow: 0,
            cacheKeys: [],
        };
    },
    computed: {
        renderData() {
            const data = this.listData.map((row) => {
                const rowHeight = row.__rowHeight__;
                const tmp = row.items.map((item, i) => ({
                    ...item,
                    _max: rowHeight,
                    _left: i === 0 ? 0 : this.gaps[0],
                }));
                return tmp;
            });
            return data.flat();
        },
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
    },
    watch: {
        data(newVal, oldVal) {
            const prevLen = oldVal ? oldVal.length : 0;
            // 增加元素时
            if (newVal.length > prevLen) {
                this.handleAdd(newVal);
            } else {
                this.init();
            }
        },
        rowHeight() {
            this.init();
        },
        clientWidth() {
            if (this.clientWidth === 0) return;
            this.init();
        },
    },
    mounted() {
        this.$nextTick(() => {
            if (this.clientWidth) {
                this.init();
            }
        });
    },
    methods: {
        init() {
            this.lastRow = 0;
            this.listData = [];
            this.cacheKeys = [];
            this.initLayout(this.data, this.clientWidth);
        },
        initLayout(data: Item[], clientWidth: number) {
            const allData = this.listData;
            let rowWidth = clientWidth;
            data.forEach((item, i) => {
                this._initRow(allData, this.lastRow);
                const rowData = allData[this.lastRow];

                const { width, itemKey } = this._getComputedAttrs(item);
                // 间距
                const totalGap = rowData.items.length * this.gaps[0];

                if (rowWidth - width - totalGap === 0) {
                    rowData.itemTotalWidth += width;
                    rowData.items.push({
                        ...item,
                        _width: width,
                        key: itemKey,
                    });
                    this.lastRow++;
                    rowWidth = clientWidth;
                } else if (rowWidth - width - totalGap > 0) {
                    rowData.itemTotalWidth += width;
                    rowData.items.push({
                        ...item,
                        _width: width,
                        key: itemKey,
                    });
                    rowWidth -= width;
                    // 最后一行没填满
                    if (i === data.length - 1) {
                        rowData.__rowHeight__ = this.rowHeight;
                    }
                } else {
                    // 放大比例
                    const zoomInRatio = this.getHeightAfterZoom(rowData);
                    // 缩小比例
                    const zoomOutRatio = this.getHeightAfterZoom(rowData, width);
                    const zoomInHeight = zoomInRatio * this.rowHeight;
                    const zoomOutHeight = zoomOutRatio * this.rowHeight;
                    /**
                     * 取差值小较小的方案
                     * 放大后高度 - 指定高度 > 指定高度 - 缩小后高度
                     * 放大后高度 - 指定高度 < 指定高度 - 缩小后高度
                     * 放大后高度 - 指定高度 = 指定高度 - 缩小后高度
                     */
                    if (zoomInHeight - this.rowHeight > this.rowHeight - zoomOutHeight) {
                        rowData.itemTotalWidth += width;
                        rowData.items.push({
                            ...item,
                            _width: width,
                            key: itemKey,
                        });
                        this.updateRowItemsWidth(rowData, zoomOutRatio);
                        this.lastRow++;
                        rowWidth = clientWidth;
                    } else {
                        this.updateRowItemsWidth(rowData, zoomInRatio);
                        // 放大的情况下，当前数据被挤到下一行；在此处插入
                        this.lastRow++;
                        this._initRow(allData, this.lastRow);
                        const nextRowData = allData[this.lastRow];
                        const { width, itemKey } = this._getComputedAttrs(item);
                        nextRowData.itemTotalWidth += width;
                        nextRowData.items.push({
                            ...item,
                            _width: width,
                            key: itemKey,
                        });
                        rowWidth = clientWidth - width;
                    }
                }
                this.cacheKeys.push(itemKey);
            });
        },
        _getComputedAttrs(item: Item) {
            // 得到固定高度下缩放后对应的宽度(兼容最大宽高比1:5)
            const renderHeight = Math.floor(
                Math.max(
                    item.width * this.minRatio,
                    Math.min(item.width * this.maxRatio, item.height),
                ),
            );
            // 根据截取后的比例计算宽高比
            const picRatio = item.width / renderHeight;
            const width = this.rowHeight * picRatio;
            const itemKey = get(item, this.keyProp || '');
            return {
                width,
                itemKey,
            };
        },
        _initRow(data: IRows[], index: number) {
            if (!data[index]) {
                data.push({ itemTotalWidth: 0, items: [] });
            }
            return data;
        },
        // 获取缩放后比例
        getHeightAfterZoom(rowData: IRows, lastItemWidth?: number) {
            const gapSum =
                (lastItemWidth ? rowData.items.length : rowData.items.length - 1) * this.gaps[0];
            const itemWidth = rowData.itemTotalWidth + (lastItemWidth || 0);
            const totalWidth = this.clientWidth - gapSum;
            // 缩放比例
            return totalWidth / itemWidth;
        },
        updateRowItemsWidth(rowData: IRows, scaleRatio: number) {
            rowData.__rowHeight__ = this.rowHeight * scaleRatio;
            return rowData.items.map((item) => {
                item._width = item._width! * scaleRatio;
                return item;
            });
        },
        handleAdd(newData: Item[]) {
            const cacheLen = this.cacheKeys.length;
            const firstKey = get(newData[0], this.keyProp || '');
            const lastKey = get(newData[cacheLen], this.keyProp || '');

            // 向后追加
            if (this.cacheKeys[0] === firstKey && this.cacheKeys[cacheLen] === lastKey) {
                this.initLayout(newData.slice(cacheLen), this.clientWidth);
            } else {
                this.init();
            }
        },
    },
});
</script>
<style lang="less" module>
.same-height {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    transition: all 0.15s;
    .row {
        display: flex;
        flex-direction: column;
    }
}
</style>
