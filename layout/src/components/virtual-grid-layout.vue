<template>
    <VirtualLayoutWF
        v-if="renderData.length"
        :width="clientWidth"
        :height="clientHeight"
        :collection="renderData"
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
            <slot :item="item" :index="item._index" :width="maxWidth" :height="maxWidth" />
        </template>
        <template #bottom>
            <Spin v-show="loading" />
        </template>
    </VirtualLayoutWF>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { CollectionItem, Item } from '../types';
import { get } from '../../utils';
import VirtualLayoutWF from './virtual-layout-wf.vue';
import Spin from './spin.vue';

export default defineComponent({
    name: 'VirtualGrid',
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
    emits: ['loadMore', 'scroll'],
    computed: {
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
        maxWidth() {
            return Math.floor((this.clientWidth - this.columns * this.gaps[0]) / this.columns);
        },
        renderData() {
            if (this.maxWidth <= 0) return [];
            return this.data.map((item, index) => {
                const tmp = { ...item };
                tmp.key = get(tmp, this.keyProp || '');
                tmp._index = index;
                tmp._width = this.maxWidth;
                tmp._height = this.maxWidth;
                tmp.x = (index % this.columns) * (this.maxWidth + this.gaps[0]);
                tmp.y =
                    Math.floor(index / this.columns) *
                    (this.maxWidth + this.gaps[1] + this.extraHeight);
                return { data: tmp };
            });
        },
    },
    methods: {
        cellSizeAndPositionGetter(data: CollectionItem) {
            const { data: item } = data;
            return {
                width: item._width,
                height: item._height,
                x: item.x,
                y: item.y,
            };
        },
        handleScroll(data: any) {
            this.$emit('scroll', data);
        },
        loadMore() {
            this.$emit('loadMore');
        },
    },
});
</script>
