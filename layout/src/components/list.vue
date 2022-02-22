<template>
    <div :class="$style.list" :style="{ paddingRight: gaps[1] + 'px' }">
        <div :class="$style.item" v-for="(item, idx) in data" :key="item.key">
            <slot :item="item" :index="idx" :height="rowHeight" :width="rowHeight" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { Item } from '../types';
import { get } from '../../utils';

export default defineComponent({
    name: 'List',
    props: {
        data: {
            type: Array as PropType<Item[]>,
            required: true,
        },
        // 边距
        gap: {
            type: [Number, Array] as PropType<number[] | number>,
            default: 10,
        },
        rowHeight: {
            type: [Number, String],
            default: 24,
        },
        keyProp: {
            type: String,
            default: '',
        },
    },
    computed: {
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
        renderData() {
            return this.data.map((item) => {
                const tmp = { ...item };
                tmp.key = get(tmp, this.keyProp || '');
                return tmp;
            });
        },
    },
});
</script>
<style lang="less" module>
.list {
    width: 100%;
    transition: all 0.15s;
}
</style>
