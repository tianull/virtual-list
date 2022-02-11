<template>
    <div :class="$style['virtual-list']" ref="virtualList" @scroll.passive="onScroll">
        <div class="virtual-scroll-bar" ref="scrollBar"></div>
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
            default: '100%',
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
        interval: {
            type: [Number, String],
            default: 0,
        },
    },
    data(): IData {
        return {
            startIndex: 0,
            endIndex: 0,
            offset: 0,
            scrollTop: 0,
            variableData: [],
        };
    },
    computed: {
        transform() {
            return {
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
    },
    watch: {
        data(newData) {
            if (this.type === TYPE.FIXED) {
                (this.$refs.scrollBar as HTMLElement).style.height =
                    newData.length * Number(this.size) + 'px';
            } else {
                this.variableData = this.getVisiblePosition(newData);
            }
        },
        size() {
            (this.$refs.scrollBar as HTMLElement).style.height =
                this.data.length * Number(this.size) + 'px';

            const minListHeight = Math.min(Number(this.remain), this.data.length);
            if (this.type === TYPE.VARIABLE) {
                this.variableData = this.getVisiblePosition(this.data);
                (this.$refs.virtualList as HTMLElement).style.height = this.outerHeight;
            } else {
                (this.$refs.virtualList as HTMLElement).style.height =
                    minListHeight * Number(this.size) + 'px';
            }
        },
    },
    mounted() {
        if (!this.size) {
            throw new Error('请传入size属性');
        }
        (this.$refs.scrollBar as HTMLElement).style.height =
            this.data.length * Number(this.size) + 'px';
        this.endIndex = this.startIndex + Number(this.remain);

        const minListHeight = Math.min(Number(this.remain), this.data.length);
        if (this.type === TYPE.VARIABLE) {
            this.variableData = this.getVisiblePosition(this.data);
            (this.$refs.virtualList as HTMLElement).style.height = this.outerHeight;
        } else {
            (this.$refs.virtualList as HTMLElement).style.height =
                minListHeight * Number(this.size) + 'px';
        }

        this.onScroll = this._throttle(this.handleScroll, Number(this.interval));
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
        _throttle(fn: Function, delay: number): Function {
            let isRunning = false;
            return () => {
                if (isRunning) return;
                isRunning = true;
                setTimeout(() => {
                    fn && fn();
                    isRunning = false;
                }, delay);
            };
        },
        getVisiblePosition(data: any) {
            if (!data.length) return [];
            const result = data.map((item: any, index: number) => ({
                index: index,
                height: this.size,
                top: index * Number(this.size),
                bottom: (index + 1) * Number(this.size),
            }));
            return result;
        },
        handleScroll() {
            const virtualListEl = this.$refs.virtualList as HTMLElement;
            const scrollTop = virtualListEl.scrollTop;
            if (this.type === TYPE.FIXED) {
                this.startIndex = Math.floor(scrollTop / Number(this.size));
                this.endIndex = this.startIndex + Number(this.remain);
                this.offset = (this.startIndex - this.prevCount) * Number(this.size);
            } else {
                this.startIndex = this.getCurrentIndex(scrollTop, this.variableData) || 0;
                this.endIndex = this.startIndex + Number(this.remain);
                this.offset = this.variableData[this.startIndex - this.prevCount].top || 0;
            }
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
    overflow-y: auto;
    position: relative;
}
.scroll-list {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}
</style>
