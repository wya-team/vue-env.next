
const recast = require("recast");
const { namedTypes } = require('ast-types');
const { parserConfig } = require('./config');
const { createIdentifier, createImportDeclaration, getPropValue } = require('./utils');

/**
 * layout/nav-config.js 文件插入代码片段
 * @param {*} source 原文件内容
 */
module.exports = (source, opts) => {
	const { moduleName } = opts || {};
	const sourceAST = recast.parse(source, parserConfig);
	const regex = new RegExp(`${moduleName}/index$`);
	const navConfigName = `${moduleName}NavConfig`;
	
	recast.visit(sourceAST, {
		visitImportDeclaration(path) {
			const body = path.parent.node.body;
			const isImported = body.some((it) => {
				return namedTypes.ImportDeclaration.check(it) && regex.test(it.source.value);
			});
			if (isImported) return this.abort();
			
			const insertIndex = body.reduce((pre, cur, index) => {
				if (namedTypes.ImportDeclaration.check(cur)) pre = index + 1;
				return pre;
			}, 0);
			const importDeclaration = createImportDeclaration({ 
				name: moduleName,
				isDefault: false,
				variableName: navConfigName,
				importPath: `@modules/${moduleName}/index`
			});
			body.splice(insertIndex, 0, importDeclaration);
			
			this.abort(); // 终止遍历
		},
	});
	recast.visit(sourceAST, {
		visitArrayExpression(path) {
			const node = path.node;
			const parentNode = path.parent.node;
			if (namedTypes.AssignmentExpression.check(parentNode) && parentNode.left.property.name === 'INITIAL_NAV_DATA') {
				const navArray = node.elements || [];
				const isExist = navArray.some((it) => it.name === navConfigName);
				if (!isExist) {
					const identifier = createIdentifier({ name: navConfigName });
					navArray.push(identifier);
				}
				return this.abort(); // 终止遍历
			}
			this.traverse(path);
		},
	});
	
	return recast.print(sourceAST).code;
};