
const recast = require("recast");
const { parserConfig } = require('./config');
const { createStringProp } = require('./utils');

/**
 * api.js 文件插入代码片段
 * @param {*} source 原文件内容
 */
module.exports = (source, opts) => {
	const { template, pagingFeature, APIName } = opts || {};
	const sourceAST = recast.parse(source, parserConfig);
	
	const API_KEY_ARRAY = [];
	recast.visit(sourceAST, {
		visitIdentifier(path) {
			const node = path.node;
			API_KEY_ARRAY.push(node.name);
			this.traverse(path); // 继续遍历
		}
	});

	recast.visit(sourceAST, {
		visitObjectExpression(path) {
			const node = path.node;
			let key = `${APIName}_GET`;
			let value = '';
			if (['paging', 'scroll'].includes(template)) {
				key = `${APIName}_LIST_GET`;
				value = '/test';
			}
			if (template === 'paging' && pagingFeature.includes('expand')) {
				key = `_${APIName}_CHILDREN_GET`;
				value = '/test';
			}
			if (API_KEY_ARRAY.includes(key)) return this.abort(); // 终止遍历
			const APIObjectProperty = createStringProp(key, value);
			node.properties.push(APIObjectProperty);
			return this.abort(); // 终止遍历
		}
	});
	
	// prettyPrint会将源文件格式转换掉，这里可以使用，其他不建议使用
	return recast.prettyPrint(sourceAST, { useTabs: true, tabWidth: 4 }).code.replace(/\s{5}/g, "\n\t");
};