<template>
    <div :class="[$style['lazy-image'], { loaded: imageLoaded }]">
        <div :class="$style['img-wrapper']" v-if="useImgEl">
            <img
                ref="img"
                :class="$style.img"
                load="lazy"
                :style="customStyle"
                :src="lazyImg"
                :data-src="src"
                :alt="alt"
                @load="loaded ? onLoad(e) : null"
                @error="loaded ? onError(e) : null"
            />
            <div class="bg" v-if="!lazyImg" :style="customStyle"></div>
        </div>
        <div
            v-else
            ref="img"
            :class="$style.background"
            :style="{ backgroundImage: `url(${lazyImg})`, ...customStyle }"
            :data-src="src"
        >
            <slot />
        </div>
    </div>
</template>
<script lang="ts">
import ImagesLoaded from 'imagesloaded';
/**
 * 图片懒加载组件 [@jifeng](https://doc.huanleguang.com/spaces/viewspace.action?key=~jifeng)
 *
 * ## 使用
 *
 * ```js
 *  import { DLazyImage } from '@gaoding/dam-components'
 * ```
 */
let io: IntersectionObserver | null = null;
export default {
    name: 'DLazyImage',
    props: {
        /**
         * 图片地址
         */
        src: {
            type: String,
            default: '',
        },
        /**
         * 使用img标签模式 or backgroundImage模式
         */
        useImgEl: {
            type: Boolean,
            default: true,
        },
        /**
         * 图片说明
         */
        alt: {
            type: String,
            default: '',
        },
        /**
         * 占位图
         */
        placeHolderImg: {
            type: String,
            default: '',
        },
        /**
         * 图片自定义样式
         */
        customStyle: {
            type: Object,
            default: () => ({}),
        },
        /**
         * 计算交叉时添加到根(root)边界的矩形偏移量
         * https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
         */
        rootMargin: {
            type: String,
            default: '0px 0px 0px 0px',
        },
        /**
         * 一个包含阈值的列表, 按升序排列, 列表中的每个阈值都是监听对象的交叉区域与边界区域的比率
         * https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
         */
        thresholds: {
            type: Array,
            default: () => [0, 0.0000001, 0.25, 0.5, 0.75, 1],
        },
    },
    emits: [
        /**
         * 图片加载后触发
         */
        'loaded',
        /**
         * 图片加载时触发(使用img标签时可用)
         */
        'imgLoad',
        /**
         * 图片加载错误时触发(使用img标签时可用)
         */
        'imgError',
    ],
    data() {
        return {
            loaded: false,
            scrolling: false,
            imageLoaded: false,
        };
    },
    computed: {
        lazyImg() {
            return this.loaded && ((!this.useImgEl && this.imageLoaded) || this.useImgEl)
                ? this.src
                : this.placeHolderImg;
        },
    },
    mounted() {
        const options = {
            rootMargin: this.rootMargin,
            thresholds: this.thresholds,
        };
        io = new IntersectionObserver((entries) => {
            entries.forEach((item) => {
                if (item.isIntersecting) {
                    this.loaded = true;
                    if (!this.imageLoaded && !this.useImgEl) {
                        this.handleImageLoaded();
                    }
                    io?.unobserve(item.target);
                }
            });
        }, options);
        io.observe(this.$refs.img as Element);
    },
    beforeUnmount() {
        io?.unobserve(this.$refs.img as Element);
    },
    methods: {
        handleImageLoaded() {
            if (!this.$refs.img) return;
            const option = { background: this.$style.background };
            const imgLoaded = new ImagesLoaded(
                this.$refs.img,
                this.useImgEl ? {} : option,
                () => {},
            );
            imgLoaded.on('done', () => {
                this.imageLoaded = true;
                this.$emit('loaded');
            });
        },
        onLoad(e: Event) {
            this.$emit('imgLoad', e);
        },
        onError(e: Event) {
            this.$emit('imgError', e);
        },
    },
};
</script>
<style lang="less" module>
.lazy-image {
    display: inline-block;
    line-height: 0;
    .img-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        :global .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #fafbfc;
        }
    }
    .img {
        width: 100%;
        height: 100%;
    }
    .background {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    &:not(:global .loaded) {
        .bg,
        .background {
            background-color: #fafbfc;
        }
    }
}
</style>
