// 直接引用vue组件
import DLayout from '@dam-components/src/layout/src/layout.vue';

// 或者引用打包编译后的
// import { DLayout } from '@dam-components';

const data = [
    {
        width: 1242,
        height: 1242,
        src: 'https://st-gdx.dancf.com/gaodingx/4426/configs/system/20211219-164550-3a3e.svg',
        mainColor: '#eeeeee',
        isDefaultPreview: true,
        size: '12MB',
        name: 'name0先帝创业未半而中道崩出今天下三分.jpg',
        time: '2021/11/16 下午4:22:04',
        type: 'svg',
    },
    {
        width: 1242,
        height: 1242,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210723-145542-b59a.png',
        mainColor: '#eeeeee',
        size: '12MB',
        name: 'name0先帝创业未半而中道崩出今天下三分.jpg',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 5385,
        height: 1842,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210901-150348-c336.png',
        mainColor: '#7a87b6',
        size: '12MB',
        name: 'name1',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210730-142727-c9ce.png',
        mainColor: '#e5e8e4',
        size: '12MB',
        name: 'name2',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1000,
        height: 1159,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210827-115444-88d7.png',
        mainColor: '#7470da',
        size: '12MB',
        name: 'name3',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 1242,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210927-110006-93c5.png',
        mainColor: '#bfe5e7',
        size: '12MB',
        name: 'name4',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 708,
        height: 1133,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210924-162250-176a.png',
        mainColor: '#1d1c18',
        size: '12MB',
        name: 'name5',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 3094,
        height: 909,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210806-095438-9462.png',
        mainColor: '#fbe6c1',
        size: '12MB',
        name: 'name6',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210127-232134-beae.png',
        mainColor: '#dce9e8',
        size: '12MB',
        name: 'name7',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210831-095914-93a9.png',
        mainColor: '#fbf4bc',
        size: '12MB',
        name: 'name8',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210407-155620-95fe.png',
        mainColor: '#c3d6c6',
        size: '12MB',
        name: 'name9',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 708,
        height: 1133,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210901-155759-f0a9.png',
        mainColor: '#18263f',
        size: '12MB',
        name: 'name10',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210618-000916-e6c7.png',
        mainColor: '#f1e8d8',
        size: '12MB',
        name: 'name11',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210526-172014-358a.png',
        mainColor: '#cad2d1',
        size: '12MB',
        name: 'name12',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 800,
        height: 2000,
        src: 'https://st-gdx.dancf.com/gaodingx/359/design/20190713-104448-030d.png',
        mainColor: '#131657',
        size: '12MB',
        name: 'name13',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210823-164920-01aa.png',
        mainColor: '#ac5544',
        size: '12MB',
        name: 'name14',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2128,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210201-184431-3e53.png',
        mainColor: '#768bbf',
        size: '12MB',
        name: 'name15',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1400,
        height: 1400,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210407-180703-9774.png',
        mainColor: '#42c492',
        size: '12MB',
        name: 'name16',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 1746,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210319-103655-fdbe.png',
        mainColor: '#657b8d',
        size: '12MB',
        name: 'name17',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1724,
        height: 2551,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20211110-104802-dfaa.png',
        mainColor: '#9d94a1',
        size: '12MB',
        name: 'name18',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
    {
        width: 1242,
        height: 2208,
        src: 'https://st-gdx.dancf.com/gaodingx/0/uxms/design/20210811-154913-34a6.png',
        mainColor: '#afb1b9',
        size: '12MB',
        name: 'name19',
        time: '2021/11/16 下午4:22:04',
        type: 'jpg',
    },
];

export default {
    component: DLayout,
    title: 'ui组件/DLayout',
    // 进一步对 props进行描述：https://storybook.js.org/docs/react/api/argtypes#gatsby-focus-wrapper
    argTypes: {
        keyProp: {
            description: '唯一索引，传入data数据中的某个键，如id',
        },
        data: {
            description: '数据',
        },
        columns: {
            description: '瀑布流与宫格布局列数',
        },
        gap: {
            description: '同一列上下间距',
        },
        minRatio: {
            description: '最小宽高比(瀑布流1:0.3, 等高1:0.3)',
        },
        maxRatio: {
            description: '最大宽高比(瀑布流1:5, 等高1:2)',
        },
    },
};

const Template = (args) => ({
    // 注册组件
    components: { DLayout },
    data() {
        return {
            args,
        };
    },
    computed: {
        columns() {
            return this.args.scale > 2 ? 5 : this.args.scale <= 1 ? 7 : 6;
        },
    },
    methods: {
        handleChange(e) {
            this.args.scale = e.target.value;
        },
    },
    template: `
        <input
            type="range"
            min="0.6"
            max="3"
            step="0.2"
            :value="args.scale"
            @change="handleChange"
        />
        <DLayout :data="args.data" :layoutMode="args.layoutMode" :gap="[20, 24]" :columns="columns">
            <template #default="{ item, index, width, height }">
                <div class="grid-item" :data-index="index">
                    <img :style="{ width: width + 'px', height: height + 'px' }" :src="item.src" alt="" />
                </div>
                <div class="ext" style="text-align: center;white-space: nowrap;
                overflow: hidden;text-overflow: ellipsis;">
                    <span class="name">{{ item.name }}</span>
                </div>
            </template>
        </DLayout>
    `,
});
const Template1 = (args) => ({
    // 注册组件
    components: { DLayout },
    data() {
        return {
            args,
        };
    },
    computed: {
        columns() {
            return this.args.scale > 2 ? 5 : this.args.scale <= 1 ? 7 : 6;
        },
    },
    methods: {
        handleChange(e) {
            this.args.scale = e.target.value;
        },
        itemStyle(width, height) {
            const max = width > height ? width : height;
            return {
                width: max + 'px',
                height: max + 'px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            };
        },
    },
    template: `
        <input
            type="range"
            min="0.6"
            max="3"
            step="0.2"
            :value="args.scale"
            @change="handleChange"
        />
        <DLayout :data="args.data" virtual :layoutMode="args.layoutMode" :gap="[20, 24]" :columns="columns">
            <template #default="{ item, index, width, height }">
                <div class="grid-item" :style="itemStyle(width, height)" :data-index="index">
                    <img :src="item.src" class="img" :style="{border: '1px solid #ccc', width: width + 'px', height: height + 'px'}" />
                </div>
                <div class="ext"
                    style="text-align: center;white-space: nowrap;
                        overflow: hidden;text-overflow: ellipsis;"
                >
                    <span class="name">{{ item.name }}</span>
                </div>
            </template>
        </DLayout>
    `,
});
const Template2 = (args) => ({
    // 注册组件
    components: { DLayout },
    data() {
        return {
            args,
        };
    },
    computed: {
        rowHeight() {
            return this.args.scale * 200;
        },
    },
    methods: {
        handleChange(e) {
            this.args.scale = e.target.value;
        },
    },
    template: `
        <input
            type="range"
            min="0.6"
            max="3"
            step="0.2"
            :value="args.scale"
            @change="handleChange"
        />
        <DLayout :data="args.data" virtual :layoutMode="args.layoutMode" :gap="[20, 24]" :rowHeight="rowHeight">
            <template #default="{ item, index, width }">
                <div
                    class="same-height-item"
                    :style="{ width: width + 'px', height: height + 'px' }"
                >
                    <img class="img" style="width: 100%; object-fit: contain;" :src="item.src" alt="" />
                </div>
                <div class="ext"
                :style="{ width: width + 'px' }"
                    style="text-align: center;white-space: nowrap;
                        overflow: hidden;text-overflow: ellipsis;"
                >
                    <span class="name">{{ item.name }}</span>
                </div>
            </template>
        </DLayout>
    `,
});
const Template3 = (args) => ({
    // 注册组件
    components: { DLayout },
    data() {
        return {
            args,
        };
    },
    computed: {
        rowHeight() {
            return this.args.scale * 24;
        },
    },
    methods: {
        handleChange(e) {
            this.args.scale = e.target.value;
        },
        itemStyle(item, width) {
            return {
                backgroundImage: `url(${item.src})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                width: width + 'px',
                height: width + 'px',
                border: '1px solid #ccc',
            };
        },
    },
    template: `
        <input
            type="range"
            min="0.6"
            max="3"
            step="0.2"
            :value="args.scale"
            @change="handleChange"
        />
        <DLayout :data="args.data" :layoutMode="args.layoutMode" :rowHeight="rowHeight">
            <template #default="{ item, index, height }">
                <div class="list-content" style="display: flex;flex-direction: row;align-items: center;">
                    <div :style="itemStyle(item, height)" ></div>
                    <div class="list" style="display: flex;align-items: center;flex: 1;">
                        <div class="list-item list-item--name" style="flex-basis: 50%; padding-left: 16px;">{{ item.name }}</div>
                        <div class="list-item list-item--time" style="flex-basis: 20%">{{ item.time }}</div>
                        <div class="list-item list-item--size" style="flex-basis: 20%">{{ item.size }}</div>
                        <div class="list-item list-item--type" style="flex-basis: 20%">{{ item.type }}</div>
                    </div>
                </div>
            </template>
        </DLayout>
    `,
});

export const Base = Template.bind({});
Base.storyName = '瀑布流';
Base.args = {
    data,
    layoutMode: 'waterfall',
    scale: 1,
};

export const Grid = Template1.bind({});
Grid.storyName = '宫格';
Grid.args = {
    data,
    layoutMode: 'grid',
    scale: 1,
};

export const SameHeight = Template2.bind({});
SameHeight.storyName = '等高';
SameHeight.args = {
    data,
    layoutMode: 'same-height',
    scale: 1,
};

export const list = Template3.bind({});
list.storyName = '列表';
list.args = {
    data,
    layoutMode: 'list',
    scale: 1,
};
