import { Storage, Cookie } from '@wya/utils';
import { EventStore } from '@wya/ps';
import { TOKEN_TAG, BRANCH_TAG } from '../constants';
import { Network } from './network';

class GlobalManager extends EventStore {
	constructor() {
		super();
		// 版本号
		this.version = '1.0';
		this.branch = process.env.BRANCH || 'master';
		this.forceBranch = this.branch;
		this.app = null;
		this.routes = null;
		this.router = null;

		this.user = {}; // TODO: 是否需要响应式

		this.initial();
	}

	/**
	 * 初始化数据
	 * 1. 缓存版本号
	 * 2. 当前客服端想使用的哪个分支做测试
	 */
	initial() {
		Storage.setVersion(this.version);
		Cookie.setVersion(this.version);

		this.forceBranch = (this.branch === 'develop' && Storage.get(BRANCH_TAG)) || this.branch;
		Network.setGlobal(this);
	}

	/**
	 * 判断是否已经登录
	 * 
	 * @returns {boolean} ~
	 */
	isLoggedIn() {
		const user = Storage.get(TOKEN_TAG);
		// return !!user; // TODO: 对接好登录后可删除
		return true;
	}

	/**
	 * 清理登录
	 */
	async clearLoginAuth() {
		this.user = {};
		Storage.remove(TOKEN_TAG);
		window.dispatchEvent(new Event('@wya/logout'));
	}

	async createLoginAuth(config) {
		this.user = config;

		Storage.set(TOKEN_TAG, config);
		window.dispatchEvent(new Event('@wya/login'));

		if (this.routes && this.router) {
			this.routes.reset();
			this.router.push('/');
		}
	}

	updateUser(config) {
		this.user = Object.assign(this.user, config);
		Storage.set(TOKEN_TAG, this.user);
	}

	// Vue 注册用
	install(app, options) {
		const { Router, Routes } = options;
		app.config.globalProperties.$request = Network.request;
		app.config.globalProperties.$global = this;

		this.router = Router;
		this.routes = Routes;
		this.app = app;
	}
}

export const Global = new GlobalManager();
