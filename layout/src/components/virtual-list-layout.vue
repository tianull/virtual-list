<template>
    <div :class="$style['virtual-list']" ref="virtualList" @scroll.passive="handleScroll">
        <slot name="other" />
        <div class="virtual-scroll-bar" ref="scrollBar" :style="{ height: scrollBarHeight }"></div>
        <div :class="$style['scroll-list']" ref="scroll-list" :style="transform">
            <div
                ref="nodes"
                class="scroll-list-item"
                v-for="(item, index) in renderData"
                :data-index="item.index"
                :key="index"
            >
                <slot :item="item" :idx="index" />
            </div>
        </div>
        <slot name="bottom" />
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';

enum TYPE {
    FIXED = 'fixed',
    VARIABLE = 'variable',
}
interface IList {
    index: number;
    height: number;
    top: number;
    bottom: number;
}
interface IData {
    startIndex: number;
    endIndex: number;
    offset: number;
    scrollTop: number;
    variableData: IList[];
    slotHeight: number;
}

export default defineComponent({
    name: 'VirtualLayout',
    props: {
        type: {
            type: String,
            required: true,
            default: TYPE.FIXED,
        },
        data: {
            type: Array,
            default: () => [],
            require: true,
        },
        /** 前后屏缓冲条数 */
        screen: {
            type: Array as PropType<number[]>,
            require: true,
            default: () => [2, 2],
        },
        // 虚拟列表高度
        virtualHeight: {
            type: [Number, String],
            require: true,
            default: '100vh',
        },
        /** 每屏可见数据条数 */
        remain: {
            type: [Number, String],
            default: 8,
        },
        /** 每行数据高度 */
        size: {
            type: [Number, String],
            require: true,
            default: '',
        },
        gaps: {
            type: Array as PropType<number[]>,
            default: () => [],
        },
        interval: {
            type: [Number, String],
            default: 0,
        },
        // 加载更多 触底距离
        preloadDistance: {
            type: [Number, String],
            required: false,
            default: 50,
        },
        // 容器距离屏幕左上角固定高度
        topFixedHeight: {
            type: Number,
            default: 0,
        },
        // 滚动列表顶部slot高度
        otherSlotHeight: {
            type: Number,
            default: 0,
        },
    },
    emits: ['loadMore', 'scroll'],
    data(): IData {
        return {
            startIndex: 0,
            endIndex: 0,
            offset: 0,
            scrollTop: 0,
            variableData: [],
            slotHeight: 0,
        };
    },
    computed: {
        transform() {
            // FIXME: 内容标签高度，应外部传入
            const toggleHeight = 28;
            return {
                paddingRight: this.gaps[1] + 'px',
                marginTop: this.otherHeight + toggleHeight + 'px',
                transform: `translateY(${this.offset}px)`,
            };
        },
        outerHeight() {
            return typeof this.virtualHeight === 'number'
                ? this.virtualHeight + 'px'
                : this.virtualHeight;
        },
        prevCount() {
            return Math.min(this.startIndex, this.screen[0]);
        },
        nextCount() {
            return Math.min(this.data.length - this.endIndex, this.screen[1]);
        },
        // 把前后屏预览的item保留下来
        renderData() {
            return this.data.slice(
                this.startIndex - this.prevCount,
                this.endIndex + this.nextCount,
            );
        },
        // 滚动列表距离滚动区域顶部的高度
        otherHeight() {
            return Math.round(this.slotHeight - this.topFixedHeight);
        },
        actualSize() {
            return Number(this.size) + this.gaps[0] * 2;
        },
        scrollBarHeight() {
            return (this.data.length + 5) * this.actualSize + 'px';
        },
    },
    watch: {
        data(newData) {
            if (this.type === TYPE.VARIABLE) {
                this.variableData = this.getVisiblePosition(newData);
            }
        },
        size() {
            if (this.type === TYPE.VARIABLE) {
                this.variableData = this.getVisiblePosition(this.data);
            }
            (this.$refs.virtualList as HTMLElement).style.height = this.outerHeight;
        },
        otherSlotHeight() {
            const virtualListEl = this.$refs.virtualList as HTMLElement;
            this.slotHeight = this.otherSlotHeight + virtualListEl?.scrollTop;
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.endIndex = this.startIndex + Number(this.remain);
            if (!this.actualSize) return;
            if (this.type === TYPE.VARIABLE) {
                this.variableData = this.getVisiblePosition(this.data);
            }
            const virtualListEl = this.$refs.virtualList as HTMLElement;
            virtualListEl.style.height = this.outerHeight;
            this.slotHeight = this.otherSlotHeight + virtualListEl?.scrollTop;
        });
    },
    updated() {
        this.$nextTick(() => {
            const nodes = this.$refs.nodes as HTMLElement[];
            if (this.type === TYPE.VARIABLE && nodes && nodes.length) {
                // 用节点更新缓存
                nodes.forEach((node) => {
                    const { height } = node.getBoundingClientRect();
                    const index = +node.getAttribute('data-index')!;
                    const oldHeight = this.variableData[index].height;
                    const difference = oldHeight - height;
                    if (difference) {
                        this.variableData[index].height = height;
                        this.variableData[index].bottom =
                            this.variableData[index].bottom - difference;
                        for (let i = index + 1; i < this.variableData.length; i++) {
                            this.variableData[i].top = this.variableData[i - 1].bottom;
                            this.variableData[i].bottom = this.variableData[i].bottom - difference;
                        }
                    }
                });
                (this.$refs.scrollBar as HTMLElement).style.height =
                    this.variableData[this.variableData.length - 1].bottom + 'px';
            }
        });
    },
    methods: {
        getVisiblePosition(data: any) {
            if (!data.length) return [];
            const result = data.map((item: any, index: number) => ({
                index: index,
                height: this.actualSize,
                top: index * Number(this.actualSize),
                bottom: (index + 1) * Number(this.actualSize),
            }));
            return result;
        },
        handleScroll() {
            const virtualListEl = this.$refs.virtualList as HTMLElement;
            // 滚动列表距离顶部的高度
            const scrollTop = virtualListEl.scrollTop - this.otherHeight;
            if (this.type === TYPE.FIXED) {
                this.startIndex =
                    scrollTop < 0 ? 0 : Math.floor(scrollTop / Number(this.actualSize));
                this.endIndex = this.startIndex + Number(this.remain);

                this.offset = (this.startIndex - this.prevCount) * Number(this.actualSize);
            } else {
                this.startIndex = this.getCurrentIndex(scrollTop, this.variableData) || 0;
                this.endIndex = this.startIndex + Number(this.remain);
                this.offset = this.variableData[this.startIndex - this.prevCount].top || 0;
            }
            this.$nextTick(() => {
                this.$emit('scroll', { scrollTop: scrollTop || 0 });
                if (
                    scrollTop + this.otherHeight + virtualListEl.clientHeight >=
                    virtualListEl.scrollHeight - this.otherHeight - Number(this.preloadDistance)
                ) {
                    this.$emit('loadMore');
                }
            });
        },
        getCurrentIndex(value: number, positions: IList[]) {
            let start = 0;
            let end = positions.length - 1;
            let currentIndex = null;
            while (start <= end) {
                const middleIndex = Math.floor((start + end) / 2);
                const middleValue = positions[middleIndex].bottom;
                if (value === middleValue) {
                    return middleIndex + 1;
                } else if (middleValue < value) {
                    start = middleIndex + 1;
                } else if (middleValue > value) {
                    if (currentIndex == null || currentIndex > middleIndex) {
                        currentIndex = middleIndex;
                    }
                    end = middleIndex - 1;
                }
            }
            return currentIndex;
        },
    },
});
</script>
<style lang="less" module>
// https://vue-loader.vuejs.org/zh/guide/css-modules.html#%E7%94%A8%E6%B3%95
.virtual-list {
    position: relative;
    overflow-y: auto;
    overflow: overlay;

    &::-webkit-scrollbar {
        display: none;
    }

    &:hover::-webkit-scrollbar {
        display: block;
        width: 4px;

        &-thumb {
            height: 53px;
            background: #d6d7d8;
            border-radius: 29px;

            &:hover {
                background: #adafb2;
            }
        }

        &-track {
            display: none;
        }

        &-corner {
            display: none;
        }

        &-button {
            display: none;
        }
    }
}
.scroll-list {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}
</style>
