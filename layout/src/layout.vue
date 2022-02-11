<template>
    <div class="layout-container" :class="[layoutMode]">
        <component
            :is="layout"
            v-bind="$attrs"
            :clientWidth="clientWidth"
            :clientHeight="clientHeight"
        >
            <template #default="{ item, index, width, height }">
                <!--
                    @slot 自定义内容区域，抛出{ item, index, width, height }
                -->
                <slot :item="item" :index="index" :width="width" :height="height" />
            </template>
        </component>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { LayoutMode } from './types';
import Waterfall from './components/waterfall-layout.vue';
import VirtualWaterfall from './components/virtual-waterfall-layout.vue';
import Grid from './components/grid-layout.vue';
import VirtualGrid from './components/virtual-grid-layout.vue';
import SameHeight from './components/same-height-layout.vue';
import VirtualSameHeight from './components/virtual-same-height-layout.vue';
import List from './components/list.vue';
import VirtualList from './components/virtual-list.vue';

/**
 * 文件主布局组件
 *
 * ## 使用
 *
 * ```js
 *  import { DLayout } from '@gaoding/dam-components'
 * ```
 */
export default defineComponent({
    name: 'DLayout',
    components: {
        Waterfall,
        VirtualWaterfall,
        Grid,
        VirtualGrid,
        SameHeight,
        VirtualSameHeight,
        List,
        VirtualList,
    },
    inheritAttrs: false,
    props: {
        /** 布局方式 waterfall/grid/list/same-height */
        layoutMode: {
            type: String as PropType<LayoutMode>,
            default: LayoutMode.Waterfall,
        },
        /** 虚拟列表 waterfall/grid/list/same-height */
        virtual: {
            type: Boolean,
            default: false,
        },
    },
    data(): {
        clientWidth: number;
        clientHeight: number;
        observer: ResizeObserver | null;
    } {
        return {
            clientWidth: 0,
            clientHeight: document.body.clientHeight,
            observer: null,
        };
    },
    computed: {
        // 首字母大写
        layout() {
            const mode = this.layoutMode.replace(/\b[a-z]/g, (w) => w.toUpperCase());
            return this.virtual ? 'Virtual' + mode : mode;
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.clientWidth = this.$el.clientWidth;
            // 初始化observer
            this.initResize();
        });
    },
    beforeUnmount() {
        this.observer?.disconnect();
    },
    methods: {
        initResize() {
            this.observer = new ResizeObserver((mutations) => {
                setTimeout(() => {
                    this.clientWidth = (mutations[0]?.target as HTMLElement).clientWidth;
                }, 20);
            });
            this.observer.observe(this.$el);
        },
    },
});
</script>
<style lang="less" module></style>
