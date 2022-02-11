<template>
    <div :class="$style.waterfall" v-if="actualWidth">
        <div
            :class="$style.column"
            :style="{ width: columnWidth }"
            v-for="(column, index) in columnItems"
            :key="index"
        >
            <div
                :class="$style['column-item']"
                :style="{ marginTop: idx === 0 ? 0 : gaps[1] + 'px' }"
                v-for="(item, idx) in column.items"
                :key="item.key"
            >
                <slot
                    :item="item"
                    :index="item._index"
                    :width="actualWidth"
                    :height="item._height"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { get } from '../../utils';
import { IColumns, Item } from '../types';

export default defineComponent({
    name: 'Waterfall',
    props: {
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
            default: 3,
        },
    },
    data(): {
        columnItems: IColumns[];
        cacheKeys: string[];
        // appendData: Item[];
    } {
        return {
            columnItems: [],
            cacheKeys: [],
            // appendData: [], // 向前新增数据
        };
    },
    computed: {
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
        columnWidth() {
            return `calc((100% - ${(this.columns - 1) * this.gaps[0]}px) / ${this.columns})`;
        },
        actualWidth() {
            if (this.clientWidth === 0) return 0;
            return Math.round(
                (this.clientWidth - (this.columns - 1) * this.gaps[0]) / this.columns,
            );
        },
        // columnItems() {
        //     if (!this.columns) return [];
        //     const columns = [];
        //     for (let index = 0; index < this.columns; index++) {
        //         columns.push({ height: 0, items: [] });
        //     }
        //     this.handleColumnData(this.data, columns);
        //     return columns;
        // },
    },
    watch: {
        columns() {
            this.initColumns();
        },
        data(newVal, oldVal) {
            const prevLen = oldVal ? oldVal.length : 0;
            // 增加元素时
            if (newVal.length > prevLen) {
                this.handleAdd(newVal);
            } else {
                this.initColumns();
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                this.initColumns();
            });
        });
    },
    methods: {
        reset() {
            this.cacheKeys = [];
            this.columnItems = [];
        },
        initColumns() {
            if (!this.columns) return;
            this.reset();
            for (let index = 0; index < this.columns; index++) {
                this.columnItems.push({ height: 0, items: [] });
            }
            this.handleColumnData(this.data, this.columnItems);
        },
        handleColumnData(data: Item[], columns: IColumns[], lastIndex?: number) {
            if (!data) return;
            data.forEach((item, i) => {
                const height = this.getItemSize(item);
                // 图片高度+每张图片margin
                const perPicTotalHeight = height + this.gaps[1];
                // 获取高度最低的，往里面添加内容
                const minColumns = columns.reduce(
                    (a, b) => (a.height > b.height ? b : a),
                    columns[0],
                );
                minColumns.height += perPicTotalHeight;
                const tmp = {
                    ...item,
                    _index: (lastIndex || 0) + i,
                    _height: height,
                    key: get(item, this.keyProp || ''),
                };
                this.cacheKeys.push(tmp.key);
                minColumns.items.push(tmp);
            });
        },
        handleAdd(newData: Item[]) {
            const cacheLen = this.cacheKeys.length;
            const firstKey = get(newData[0], this.keyProp || '');
            const lastKey = get(newData[cacheLen], this.keyProp || '');
            // 向后追加
            if (this.cacheKeys[0] === firstKey && this.cacheKeys[cacheLen] === lastKey) {
                this.handleColumnData(newData.slice(cacheLen), this.columnItems, cacheLen);
            } else {
                this.initColumns();
            }
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
<style lang="less" module>
.waterfall {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
    transition: all 0.15s;
    .column {
        display: flex;
        flex-direction: column;
    }
}
</style>
