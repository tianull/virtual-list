<template>
    <div :class="$style.list">
        <VirtualLayout
            type="fixed"
            :data="renderData"
            :size="rowHeight"
            :topFixedHeight="topFixedHeight"
            :otherSlotHeight="otherSlotHeight"
            :remain="remain"
            :gaps="gaps"
            @scroll="handleScroll"
            @loadMore="loadMore"
        >
            <template #other>
                <slot name="other" />
            </template>
            <template #default="{ item, idx }">
                <slot :item="item" :index="idx" :height="rowHeight" :width="rowHeight" />
            </template>
            <template #bottom>
                <Spin
                    v-show="loading"
                    :customStyle="{ marginTop: -(rowHeight + gaps[0]) * 4 + 'px' }"
                />
            </template>
        </VirtualLayout>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { Item } from '../types';
import { get } from '../../utils';
import VirtualLayout from './virtual-list-layout.vue';
import Spin from './spin.vue';

export default defineComponent({
    name: 'List',
    components: {
        VirtualLayout,
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
        rowHeight: {
            type: [Number, String],
            default: 24,
        },
        // 边距
        gap: {
            type: [Number, Array] as PropType<number[] | number>,
            default: 10,
        },
        keyProp: {
            type: String,
            default: '',
        },
        remain: {
            type: Number,
            default: 30,
        },
        topFixedHeight: {
            type: Number,
            default: 0,
        },
        otherSlotHeight: {
            type: Number,
            default: 0,
        },
        clientHeight: {
            type: Number,
            required: true,
        },
    },
    emits: ['loadMore', 'scroll'],
    computed: {
        renderData() {
            return this.data.map((item) => {
                const tmp = { ...item };
                tmp.key = get(tmp, this.keyProp || '');
                return tmp;
            });
        },
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
    },
    methods: {
        handleScroll(data: any) {
            this.$emit('scroll', data);
        },
        loadMore() {
            this.$emit('loadMore');
        },
    },
});
</script>
<style lang="less" module>
.list {
    width: 100%;
    height: 100vh;
    transition: all 0.15s;
}
</style>
