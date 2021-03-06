const path = require('path');
const buble = require('@rollup/plugin-buble');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const { terser } = require('rollup-plugin-terser');
const helperModelImports = require('@babel/helper-module-imports');

let wm = new WeakMap();

const builds = {
	cli: {
		script: 'babel packages/cli/src --out-dir packages/cli/dist --copy-files --ignore **.test.js,**.md,examples/**',
	},
	eslint: {
		script: 'babel packages/eslint/src --out-dir packages/eslint/dist --copy-files --ignore **.test.js,**.md,examples/**',
		rollup: {
			entry: 'packages/eslint/src/index.js',
			dest: 'packages/eslint/dist/eslint.min.js',
			format: 'cjs'
		}
	}
};

class Config {
	static getConfig = (name) => {
		return {
			...builds[name],
			rollup: Config.getRollupConfig(name)
		};
	}

	static getRollupConfig = (name) => {
		let opts = builds[name].rollup;
		if (!opts) return;

		let config = {
			input: opts.entry,
			external: opts.external,
			plugins: [
				nodeResolve(), 
				babel({
					babelrc: true,
					exclude: 'node_modules/**',
					babelHelpers: 'runtime'
				}),
				commonjs({}), 
				buble({
					objectAssign: 'Object.assign' // ...Object spread and rest
				}),
				replace({
					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
					preventAssignment: false
				}),
				process.env.NODE_ENV === 'production' && terser()
			],
			output: {
				file: opts.dest,
				format: opts.format,
				// named: opts.moduleName || name,
				exports: 'named'
			}
		};
		return config;
	}

	static getAllBuilds = () => {
		return Object.keys(builds).map(Config.getConfig);
	}
}

module.exports = Config;
