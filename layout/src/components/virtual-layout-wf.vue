<template>
    <div :class="$style.virtual" :style="outerStyle" @scroll.passive="onScroll" ref="outer">
        <slot name="other" />
        <div :class="$style.container" ref="inner" :style="containerStyle">
            <div
                :class="$style['cell-container']"
                v-for="item in displayItems"
                :key="item.key"
                :style="getComputedStyle(item)"
            >
                <slot name="cell" :item="item.data" />
            </div>
        </div>
        <slot name="bottom" />
    </div>
</template>
<script>
import { defineComponent } from 'vue-demi';
import GroupManager from '../group-manager';

export default defineComponent({
    name: 'VirtualLayoutWF',
    props: {
        collection: {
            type: Array,
            required: true,
        },
        cellSizeAndPositionGetter: {
            type: Function,
            required: true,
        },
        width: {
            type: [String, Number],
            default: '100%',
        },
        height: {
            type: [String, Number],
            default: '100vh',
        },
        // 每个区域框大小
        sectionSize: {
            type: Number,
            default: 300,
        },
        // 加载更多 触底距离
        preloadDistance: {
            type: [Number, String],
            required: false,
            default: 50,
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
    data() {
        return {
            totalHeight: 0,
            displayItems: [],
            slotHeight: 0,
        };
    },
    computed: {
        outerStyle() {
            return {
                height: this.height + 'px',
                width: this.width + 'px',
            };
        },
        containerStyle() {
            return {
                height: this.totalHeight + this.fixedHeight + 'px',
                width: '100%',
            };
        },
    },
    watch: {
        collection() {
            this.refreshCollection();
        },
        otherSlotHeight() {
            this.slotHeight = this.otherSlotHeight + this.$refs.outer?.scrollTop;
        },
    },
    created() {
        this.groupManagers = [];
        this.onCollectionChanged();
    },
    mounted() {
        this.$nextTick(() => {
            this.slotHeight = this.otherSlotHeight + this.$refs.outer?.scrollTop;
            setTimeout(() => {
                this.onScroll();
            }, 300);
        });
    },
    methods: {
        getComputedStyle(item) {
            if (!item) return;

            // Currently displayed items may no longer exist
            // if collection has been modified since
            const groupManager = this.groupManagers[item.groupIndex];
            if (!groupManager) return;

            const cellMetadatum = groupManager.getCellMetadata(item.itemIndex);
            if (!cellMetadatum) return;

            const { width, height, x, y } = cellMetadatum;
            return {
                transform: `translateX(${x}px) translateY(${y}px)`,
                width: `${width}px`,
                height: `${height}px`,
            };
        },
        refreshCollection() {
            // Dispose previous groups and reset associated data
            // this.groupManagers.forEach((manager) => manager.dispose());
            this.groupManagers = [];
            this.totalHeight = 0;

            this.onCollectionChanged();
        },
        onCollectionChanged() {
            let collection = this.collection;

            // If the collection is flat, wrap it inside a single group
            if (collection.length > 0 && collection[0].group === undefined) {
                collection = [{ group: collection }];
            }

            // Create and store managers for each item group
            collection.forEach((groupContainer, i) => {
                const groupIndex = i; // Capture group index for closure
                // const unwatch = this.$watch(
                //     () => groupContainer,
                //     () => this.onGroupChanged(groupContainer.group, groupIndex),
                //     { deep: true },
                // );

                this.groupManagers.push(
                    new GroupManager(
                        groupContainer.group,
                        groupIndex,
                        this.sectionSize,
                        this.cellSizeAndPositionGetter,
                        // unwatch,
                    ),
                );
            });

            this.updateGridDimensions();
            this.flushDisplayItems();
        },
        updateGridDimensions() {
            this.totalHeight = Math.max(...this.groupManagers.map((it) => it.totalHeight));
            this.totalWidth = Math.max(...this.groupManagers.map((it) => it.totalWidth));
        },
        onGroupChanged(group, index) {
            this.groupManagers[index].updateGroup(group);
            this.updateGridDimensions();
            this.flushDisplayItems();
        },
        onScroll() {
            this.flushDisplayItems();
            const outerEl = this.$refs.outer;
            const scrollTop = outerEl.scrollTop;
            this.$nextTick(() => {
                this.$emit('scroll', { scrollTop: scrollTop || 0 });
                if (
                    scrollTop + outerEl.clientHeight >=
                    outerEl.scrollHeight - Number(this.preloadDistance)
                ) {
                    console.log('load-more');
                    this.$emit('loadMore');
                }
            });
        },
        flushDisplayItems() {
            let scrollTop = 0;
            const scrollLeft = 0;
            if (this.$refs.outer) {
                scrollTop = this.$refs.outer.scrollTop - this.slotHeight;
            }

            const displayItems = [];
            this.groupManagers.forEach((groupManager, groupIndex) => {
                const indices = groupManager.getCellIndices({
                    height: this.height,
                    width: this.width,
                    x: scrollLeft,
                    y: scrollTop,
                });

                indices.forEach((itemIndex) => {
                    displayItems.push(
                        Object.freeze({
                            groupIndex,
                            itemIndex,
                            key: displayItems.length,
                            ...groupManager.getItem(itemIndex),
                        }),
                    );
                });
            });

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(() => {
                    this.displayItems = displayItems;
                    this.$forceUpdate();
                });
            } else {
                this.displayItems = displayItems;
                this.$forceUpdate();
            }
        },
    },
});
</script>
<style lang="less" module>
.virtual {
    -webkit-overflow-scrolling: touch;
    width: 100%;
    padding: 2px;
    // transition: all 0.15s;
    .container {
        position: relative;
    }
    .cell-container {
        position: absolute;
        top: 0;
        left: 0;
    }

    overflow: auto;
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
</style>
