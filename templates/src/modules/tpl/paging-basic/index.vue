<template>
	<vcc-set-title title="" class="v-tpl-paging-basic" style="padding: 24px">
		<vcc-paging
			ref="paging"
			:page-options="pageOptions"
			:table-options="tableOptions"
			:filter-options="filterOptions"
			:load-data="loadData"
			:disabled="disabled"
			:history="true"
			:router="true"
			:footer="true"
		>
			<vc-table-column
				prop="date"
				label="日期"
				width="180"
				sortable
			/>
			<vc-table-column
				prop="name"
				label="姓名"
				width="180"
			/>
			<vc-table-column
				prop="address"
				label="地址"
			/>
		</vcc-paging>
	</vcc-set-title>
</template>
<script setup>
import { ref, reactive, defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Network } from '@globals';

const getFakeData = (page, pageSize) => {
	let fakeData = [];
	for (let i = 0; i < pageSize; i++) {
		fakeData.push({
			id: `${page}_${i}`,
			name: page + '-Business' + Math.floor(Math.random() * 100 + 1),
			status: Math.floor(Math.random() * 3 + 1),
			opt: Math.floor(Math.random() * 3 + 1),
			date: '2016-05-02',
			address: '上海市普陀区金沙江路 1518 弄'
		});
	}
	return fakeData;
};

const route = useRoute();
const router = useRouter();

const disabled = ref(false);
const paging = ref(null);
const pageOptions = ref();
const tableOptions = reactive({});
const filterOptions = reactive({
	modules: [
		{
			type: 'input',
			label: '关键词',
			field: 'input',
			options: {
				placeholder: '请输入关键词进行搜索'
			}
		},
		{
			type: 'select',
			label: '下拉选择项',
			field: 'select',
			dataSource: [
				{ label: '选项一', value: 1 },
				{ label: '选项二', value: 2 }
			]
		},
		{
			type: 'cascader',
			label: '级联选择',
			field: 'cascader',
			dataSource: [
				{ label: '选项一', value: 1 },
				{ label: '选项二', value: 2 },
				{ 
					label: '选项三',
					value: 3,
					children: [
						{ label: '选项三 - 1', value: 31 },
						{ label: '选项三 - 2', value: 32 }    
					]
				}
			]
		}
	]
});

const loadData = async (page, pageSize) => {
	try {
		const res = await Network.request({
			url: 'TPL_PAGING_BASIC_GET',
			param: {
				page,
				pageSize,
				...route.query
			},
			localData: {
				status: 1,
				data: {
					page: {
						current: page,
						total: 100,
						count: pageSize * 100,
					},
					list: getFakeData(page, pageSize)
				}

			}
		});
		console.log(`page: ${page}@success`);

		return res;
	} catch (e) {
		// throw e;
		console.log(e);
	}
};
</script>
