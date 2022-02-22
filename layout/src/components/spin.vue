<template>
    <div :class="$style.spin" :style="customStyle">
        <GSpin>
            <template #indicator>
                <DLoadingIcon spin :class="$style.loading" />
            </template>
        </GSpin>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue-demi';
import { Spin as GSpin } from '@gaoding/gd-antd-plus';
import Icon from '../../../icon';

export default defineComponent({
    name: 'Spin',
    components: {
        GSpin,
        DLoadingIcon: Icon.LoadingIcon,
    },
    props: {
        customStyle: {
            type: Object,
            default: () => ({}),
        },
    },
});
</script>
<style lang="less" module>
.spin {
    margin-top: -150px;
    text-align: center;
    .loading {
        font-size: 24px;
        color: #000;
    }
}
</style>
