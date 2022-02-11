<template>
    <div :class="$style.virtual" :style="outerStyle" @scroll.passive="onScroll" ref="outer">
        <div :class="$style.container" :style="containerStyle">
            <div
                :class="$style['cell-container']"
                v-for="item in displayItems"
                :key="item.key"
                :style="getComputedStyle(item)"
            >
                <slot name="cell" :item="item.data" />
            </div>
        </div>
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
            default: 500,
        },
    },
    data() {
        return {
            totalHeight: 0,
            displayItems: [],
        };
    },
    computed: {
        outerStyle() {
            return {
                height:
                    this.height > this.totalHeight ? this.totalHeight + 'px' : this.height + 'px',
                width: this.width + 'px',
            };
        },
        containerStyle() {
            return {
                height: this.totalHeight + 'px',
                width: '100%',
            };
        },
    },
    watch: {
        collection() {
            this.refreshCollection();
        },
    },
    created() {
        this.groupManagers = [];
        this.onCollectionChanged();
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
            this.groupManagers.forEach((manager) => manager.dispose());
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
                const unwatch = this.$watch(
                    () => groupContainer,
                    () => this.onGroupChanged(groupContainer.group, groupIndex),
                    { deep: true },
                );

                this.groupManagers.push(
                    new GroupManager(
                        groupContainer.group,
                        groupIndex,
                        this.sectionSize,
                        this.cellSizeAndPositionGetter,
                        unwatch,
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
        },
        flushDisplayItems() {
            let scrollTop = 0;
            const scrollLeft = 0;
            if (this.$refs.outer) {
                scrollTop = this.$refs.outer.scrollTop;
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
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    padding: 5px;
    transition: all 0.15s;
    .container {
        position: relative;
    }
    .cell-container {
        position: absolute;
        top: 0;
        left: 0;
    }
}
</style>
