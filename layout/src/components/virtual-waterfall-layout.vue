<template>
    <VirtualLayoutWF
        v-if="collection.length"
        :width="clientWidth"
        :height="clientHeight"
        :collection="collection"
        :cellSizeAndPositionGetter="cellSizeAndPositionGetter"
        :otherSlotHeight="otherSlotHeight"
        :fixedHeight="fixedHeight"
        @scroll="handleScroll"
        @loadMore="loadMore"
    >
        <template #other>
            <slot name="other" />
        </template>
        <template #cell="{ item }">
            <!--
                    @slot 自定义内容区域，抛出{ item, index, width, height }
                -->
            <slot :item="item" :index="item._index" :width="actualWidth" :height="item._height" />
        </template>
        <template #bottom>
            <Spin v-show="loading" />
        </template>
    </VirtualLayoutWF>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { get } from '../../utils';
import { CollectionItem, IColumns, Item } from '../types';
import VirtualLayoutWF from './virtual-layout-wf.vue';
import Spin from './spin.vue';

export default defineComponent({
    name: 'Waterfall',
    components: {
        VirtualLayoutWF,
        Spin,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Array as PropType<Item[]>,
            required: true,
        },
        columns: {
            type: Number,
            default: 5,
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
        extraHeight: {
            type: Number,
            default: 30,
        },
        clientWidth: {
            type: Number,
            required: true,
        },
        clientHeight: {
            type: Number,
            required: true,
        },
        minRatio: {
            type: Number,
            default: 0.3,
        },
        maxRatio: {
            type: Number,
            default: 3,
        },
        otherSlotHeight: {
            type: Number,
            default: 0,
        },
        // 页面非滚动区域所占高度（搜索+筛选+padding)
        fixedHeight: {
            type: Number,
            default: 200,
        },
    },
    emits: ['scroll', 'loadMore'],
    data(): {
        columnItems: IColumns[];
        collection: CollectionItem[];
    } {
        return {
            columnItems: [],
            collection: [],
        };
    },
    computed: {
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
        actualWidth() {
            if (this.clientWidth === 0) return 0;
            return Math.round((this.clientWidth - this.columns * this.gaps[0]) / this.columns);
        },
    },
    watch: {
        columns() {
            this.refreshColumns();
        },
        data() {
            this.refreshColumns();
        },
        extraHeight() {
            this.refreshColumns();
        },
    },
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                this.refreshColumns();
            });
        });
    },
    methods: {
        handleScroll(data: any) {
            this.$emit('scroll', data);
        },
        loadMore() {
            this.$emit('loadMore');
        },
        reset() {
            this.columnItems = [];
            this.collection = [];
        },
        refreshColumns() {
            if (!this.columns) return;
            this.reset();
            for (let index = 0; index < this.columns; index++) {
                this.columnItems.push({ height: 0, len: 0, items: [] });
            }
            this.handleColumnData(this.data, this.columnItems);
            this.flatColumnData();
        },
        handleColumnData(data: Item[], columns: IColumns[], lastIndex?: number) {
            if (!data) return;
            // 似乎可以用ServiceWorker?
            data.forEach((item, i) => {
                const height = this.getItemSize(item);
                // 图片高度+每张图片margin
                const perPicTotalHeight = height + this.gaps[1];
                // 获取高度最低的，往里面添加内容
                const minColumns = columns.reduce(
                    (a, b) => (a.height > b.height ? b : a),
                    columns[0],
                );
                minColumns.len++;
                minColumns.height += perPicTotalHeight;
                const tmp = {
                    ...item,
                    _index: (lastIndex || 0) + i,
                    _width: this.actualWidth,
                    _height: height,
                    key: get(item, this.keyProp || ''),
                };
                minColumns.items.push(tmp);
            });
        },
        flatColumnData() {
            const lengths = this.columnItems.map((item) => item.len!);
            const maxLen = Math.max.apply(null, lengths);
            for (let i = 0; i < maxLen; i++) {
                this.columnItems.forEach((columnItem, index) => {
                    if (columnItem.items[i]) {
                        const tmp = {
                            ...columnItem.items[i],
                            x: index * this.actualWidth + index * this.gaps[0],
                            y: this.getItemYOffset(columnItem.items, i),
                        };
                        this.collection.push({ data: tmp });
                    }
                });
            }
        },
        getItemYOffset(data: Item[], index: number) {
            if (index === 0) return 0;
            let y = 0;
            for (let i = 0; i < index; i++) {
                y += data[i]._height! + this.gaps[1] + this.extraHeight;
            }
            return y;
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
        getItemSize(item: Item) {
            const height = (item.height / item.width) * this.actualWidth;
            return Math.floor(
                Math.max(
                    Math.min(this.actualWidth * this.maxRatio, height),
                    this.actualWidth * this.minRatio,
                ),
            );
        },
    },
});
</script>
