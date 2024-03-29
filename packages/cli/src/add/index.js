const { prompt, Separator } = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const upath = require('upath');
const createProcess = require('./add');

const { resolve } = path;
module.exports = class AddManager {
	constructor(options = {}) {
		const defaultOptions = {
			// TODO
		};
		this.options = { ...defaultOptions, ...options };

		this.cwd = process.cwd();
		this.sourceDir = this.options.sourceDir;

		if (this.options.config) {
			this.configDir = path.resolve(this.options.config);
		}
	}

	// TODO:可以通过命令配置对question筛选下
	/**
	 * 1. 手机端不涉及导航页面
	 */
	_getQuesion() {
		return [
			{
				type: 'input',
				name: 'project',
				message: 'Project Name:',
				validate(val) {
					if (val === '') {
						return 'Project Name is required!';
					} else {
						return true;
					}
				}
			},
			{
				type: 'input',
				name: 'title',
				message: 'Page Title:',
				validate(val) {
					if (val === '') {
						return 'Page Title is required!';
					} else {
						return true;
					}
				}
			},
			{
				type: 'confirm',
				name: 'mobile',
				message: 'is mobile:',
				default: false
			},
			{
				type: 'list',
				name: 'navigation',
				when: (answers) => !answers.mobile,
				message: 'is navigation route & select nav level:',
				choices: [
					new Separator(' = For template = '),
					0,
					1,
					2,
					3
				],
				default: 0
			},
			{
				type: 'list',
				name: 'template',
				message: 'Select template:',
				choices: (answers) => {
					return [
						new Separator(' = For template = '),
						'basic',
						'paging',
						'scroll',
						'form'
					].filter((it) => (answers.mobile ? it !== 'paging' : it !== 'scroll'));
				},
				default: 'basic'
			},
			{
				type: 'list',
				name: 'pagingType',
				message: 'Select type:',
				when: (answers) => /(paging|scroll)/.test(answers.template),
				choices: [
					new Separator(' = For template = '),
					'basic',
					'tabs'
				],
				default: 'basic'
			},
			{
				type: 'list',
				name: 'pagingMode',
				message: 'Select mode:',
				when: (answers) => /(paging)/.test(answers.template),
				choices: [
					new Separator(' = For template = '),
					'table',
					'piece',
					'native'
				],
				default: 'table'
			},
			{
				type: 'checkbox',
				name: 'pagingFeature',
				message: 'Select feature:',
				when: (answers) => /(table)/.test(answers.pagingMode),
				choices: [
					new Separator(' = For template = '),
					'expand',
					'multiple'
				],
			},
			// 已经没有store了
			// {
			// 	type: 'confirm',
			// 	name: 'store',
			// 	message: 'use store(vuex):',
			// 	when: (answers) => !(/(paging|scroll)/.test(answers.template)),
			// 	default: false
			// },
			{
				type: 'input',
				name: 'path',
				message: 'RoutePath is required:',
				default: '/home',
				when: (answers) => answers.type !== 'none',
				validate(val) {
					if (val === '') {
						return 'Name is required!';
					} else {
						return true;
					}
				}
			},
			{
				type: 'input',
				name: 'dir',
				message: 'Where to in the project:',
				when: (answers) => answers.type !== 'none',
				default: (answers) => upath.normalize(`${process.cwd()}/src/`),
				// default: upath.normalize(`${process.cwd()}/tmp/`),
				// default: upath.normalize(`${process.cwd()}/tmp/src/`),
				validate(val) {
					if (val === `${process.cwd()}/tmp/`) {
						// shell.rm('-rf', 'tmp');
					}
					return true;
				}
			}
		];
	}

	_transform(arr = []) {
		const result = {
			template: ['form', 'basic', 'paging', 'scroll'].includes(arr[0]) ? arr[0] : undefined,
			pagingType: ['tabs', 'basic'].includes(arr[1]) ? arr[1] : undefined,
			pagingMode: ['native', 'piece', 'table'].includes(arr[2]) ? arr[2] : undefined,
		};
		return result;
	}

	_loopMake() {
		const config = require(resolve(this.options.config)); // eslint-disable-line
		const { routes, ...rest } = config.default || config;
		config.routes.forEach((item, index) => {
			createProcess({ 
				...rest, 
				...item, 
				...this._transform(item.template),
				force: true
			});
		});
	}

	/**
	 * 用于准备当前应用程序上下文的异步方法
	 * 其中包含加载页面和插件、应用插件等。
	 */
	async process() {
		
		// TODO: 检查是否存在stages和未unstages的文件
		this.options.config
			? this._loopMake()
			: prompt(this._getQuesion()).then(createProcess);
		// 	: createProcess({
		// 		project: 'qdb',
		// 		mobile: true,
		// 		template: 'basic',
		// 		path: '/tpl/asdf',
		// 		dir: '/Users/dongjiang/Documents/workspace/wya/qdb/qdb-wap/src/'
		//   });
	}
};

