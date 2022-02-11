<template>
    <div :class="$style['same-height']">
        <VirtualLayoutWF
            v-if="renderData.length"
            :width="clientWidth + 14"
            :height="clientHeight"
            :collection="renderData"
            :cellSizeAndPositionGetter="cellSizeAndPositionGetter"
        >
            <template #cell="{ item }">
                <!--
                    @slot 自定义内容区域，抛出{ item, index, width, height }
                -->
                <slot
                    :item="item"
                    :index="item._index"
                    :width="item._width"
                    :height="item._height"
                />
            </template>
        </VirtualLayoutWF>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { Item, IRows, CollectionItem } from '../types';
import { get } from '../../utils';
import VirtualLayoutWF from './virtual-layout-wf.vue';

interface IData {
    listData: IRows[];
    lastRow: number;
}

export default defineComponent({
    name: 'VirtualSameHeight',
    components: {
        VirtualLayoutWF,
    },
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
        clientHeight: {
            type: Number,
            required: true,
        },
        extraHeight: {
            type: Number,
            default: 30,
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
        };
    },
    computed: {
        renderData() {
            const data = this.listData.map((row, index) => {
                const rowHeight = row.__rowHeight__;
                let currentXPos = 0;
                const tmp = row.items.map((item) => {
                    const x = {
                        ...item,
                        _height: rowHeight,
                        x: currentXPos,
                        y: this.getYPos(this.listData, index),
                    };
                    currentXPos = currentXPos + (item._width || 0) + this.gaps[0];
                    return { data: x };
                });
                return tmp;
            });
            return data.flat();
        },
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
    },
    watch: {
        data() {
            this.init();
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
        getYPos(listData: IRows[], index: number) {
            if (index === 0 || listData.length === 0) return 0;
            let y = 0;
            for (let i = 0; i < index; i++) {
                y = y + listData[i].__rowHeight__! + this.extraHeight + this.gaps[1];
            }
            return y;
        },
        init() {
            this.lastRow = 0;
            this.listData = [];
            const PADDING = 5;
            this.initLayout(this.data, this.clientWidth - PADDING * 2);
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
        cellSizeAndPositionGetter(data: CollectionItem) {
            const { data: item } = data;
            return {
                width: item._width,
                height: item._height,
                x: item.x,
                y: item.y,
            };
        },
    },
});
</script>
<style lang="less" module>
.same-height {
    transition: all 0.15s;
}
</style>
