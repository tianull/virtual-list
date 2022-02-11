<template>
    <div :class="$style.grid" v-if="maxWidth" :style="{ marginTop: -gaps[1] + 'px' }">
        <!-- <div
            :class="$style.column"
            :style="{ width: columnWidth }"
            v-for="(column, index) in columnItems"
            :key="index"
        >
            <div
                :class="$style['column-item']"
                :style="{ marginTop: idx === 0 ? 0 : gaps[1] + 'px' }"
                v-for="(item, idx) in column"
                :key="item.key"
            >
                <slot :item="item" :index="item._index" :width="maxWidth" :height="maxWidth" />
            </div>
        </div> -->
        <div
            :class="$style.column"
            :style="{
                width: maxWidth + 'px',
                marginTop: gaps[1] + 'px',
                marginLeft: index % columns === 0 ? 0 : gaps[0] + 'px',
            }"
            v-for="(item, index) in renderData"
            :key="item.key"
        >
            <slot :item="item" :index="item._index" :width="maxWidth" :height="maxWidth" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { Item } from '../types';
import { get } from '../../utils';

export default defineComponent({
    name: 'Grid',
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
    },
    computed: {
        gaps() {
            return typeof this.gap === 'number' ? [this.gap, this.gap] : this.gap;
        },
        maxWidth() {
            return Math.floor(
                (this.clientWidth - (this.columns - 1) * this.gaps[0]) / this.columns,
            );
        },
        renderData() {
            return this.data.map((item, index) => {
                const tmp = { ...item };
                tmp.key = get(tmp, this.keyProp || '');
                tmp._index = index;
                return tmp;
            });
        },
    },
});
</script>
<style lang="less" module>
.grid {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    // justify-content: space-between;
    transition: all 0.15s;
    .column {
        display: flex;
        flex-direction: column;
    }
}
</style>
