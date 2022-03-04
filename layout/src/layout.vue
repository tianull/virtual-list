<template>
    <div class="layout-container">
        <transition :name="animated ? 'component-fade' : 'normal'" mode="out-in">
            <component
                :is="layout"
                v-bind="$attrs"
                :clientWidth="clientWidth"
                :clientHeight="clientHeight"
                @scroll="handleScroll"
                @loadMore="loadMore"
            >
                <template #other>
                    <!--
                        @slot 瀑布流顶部区域，可用于写标题或者其他一些内容等；
                    -->
                    <slot name="other" />
                </template>
                <template #default="{ item, index, width, height }">
                    <!--
                        @slot 自定义内容区域，抛出{ item, index, width, height }
                    -->
                    <slot :item="item" :index="index" :width="width" :height="height" />
                </template>
            </component>
        </transition>
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
        /**
         * 容器高度，不传时取document.body.clientHeight
         */
        containerHeight: {
            type: Number,
            default: 0,
        },
        /**
         * 是否开启过渡动画
         */
        animated: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['loadMore', 'scroll'],
    data(): {
        clientWidth: number;
        clientHeight: number;
        observer: ResizeObserver | null;
    } {
        return {
            clientWidth: 0,
            clientHeight: 0,
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
    watch: {
        containerHeight(newVal) {
            if (newVal > 0) this.clientHeight = newVal;
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.clientWidth = this.$el.clientWidth;
            this.clientHeight = this.containerHeight || document.body.clientHeight;
            // 初始化observer
            this.initResizeObserver();
            window.addEventListener('resize', this.getClientHeight);
        });
    },
    beforeUnmount() {
        this.observer?.disconnect();
        window.removeEventListener('resize', this.getClientHeight);
    },
    methods: {
        getClientHeight() {
            this.clientHeight = this.containerHeight || document.body.clientHeight;
        },
        initResizeObserver() {
            this.observer = new ResizeObserver((mutations) => {
                setTimeout(() => {
                    this.clientWidth = (mutations[0]?.target as HTMLElement).clientWidth;
                }, 20);
            });
            this.observer.observe(this.$el);
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
<style lang="less">
.component-fade-enter-active,
.component-fade-leave-active {
    transition: opacity 0.3s ease-in-out;
}

.component-fade-enter-from,
.component-fade-leave-to {
    opacity: 0;
}
</style>
