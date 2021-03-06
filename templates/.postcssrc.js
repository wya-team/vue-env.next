module.exports = {
	plugins: [
		/**
		 * @imoport资源，引进使用的代码，而不是@import '../xxx';
		 */
		require('postcss-import')(),
		/**
		 * css 中 url相对路径转化
		 * inline 为使用base64
		 */
		require('postcss-flexbugs-fixes')(),
		/**
		 * 压缩代码，删除重复部分
		 */
		require('cssnano')(),
		/**
		 * 适配浏览器前缀
		 */
		require('autoprefixer')({ remove: false })
	]
};
