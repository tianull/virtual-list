<template>
    <div :class="$style.list">
        <VirtualLayout type="fixed" :data="renderData" :size="rowHeight" :remain="remain">
            <template #default="{ item, idx }">
                <slot :item="item" :index="idx" :height="rowHeight" :width="rowHeight" />
            </template>
        </VirtualLayout>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue-demi';
import { Item } from '../types';
import { get } from '../../utils';
import VirtualLayout from './virtual-layout.vue';

export default defineComponent({
    name: 'List',
    components: {
        VirtualLayout,
    },
    props: {
        data: {
            type: Array as PropType<Item[]>,
            required: true,
        },
        rowHeight: {
            type: [Number, String],
            default: 24,
        },
        keyProp: {
            type: String,
            default: '',
        },
        remain: {
            type: Number,
            default: 30,
        },
    },
    computed: {
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
