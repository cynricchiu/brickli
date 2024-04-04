import { defineConfig, loadEnv } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { visualizer } from 'rollup-plugin-visualizer';
import packageJson from './package.json';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ command, mode, ssrBuild }) => {
	const ENV = loadEnv(mode, process.cwd(), ''); // 获取环境变量
	const common = {
		publicDir: './public', // public目录存放不会被js访问的文件，可以"./文件名"访问
		resolve: {
			alias: {
				'@src': path.resolve(__dirname, './src'),
				'@styles': path.resolve(__dirname, './src/assets/styles'),
				'@images': path.resolve(__dirname, './src/assets/images'),
				'@data': path.resolve(__dirname, './src/assets/data'),
				'@libs': path.resolve(__dirname, './src/assets/libs'),
			},
		},
		plugins: [
			ViteEjsPlugin({
				title: format(packageJson.name),
				params: JSON.stringify({
					demoList: getHtmlTree(ENV.VITE_DEMO_DIR),
				}).replaceAll('\\', '\\\\'), // 转成字符串才能传递给ejs，且路径中的\\替换成\\\\才能正确JSON.parse
			}),
		],
	};
	if (command === 'serve') {
		// dev开发环境
		return {
			...common,
			server: {
				host: ENV.VITE_HOST || 'localhst',
				port: ENV.VITE_PORT || '8080',
				hmr: true,
				open: '/',
				https: false,
				cors: true,
				proxy: {
					// 通过地址代理实现伪路由，/pages/demos/test.html ==> /demos/test.html
					'/demos': {
						target: `http://${ENV.VITE_HOST || 'localhst'}:${ENV.VITE_PORT || '8080'}`,
						changeOrigin: true,
						rewrite: path => path.replace(/^\/demos/, ENV.VITE_DEMO_DIR),
					},
				},
			},
		};
	} else if (command === 'build') {
		// build打包环境
		// 添加打包体积分析工具
		common.plugins.push(
			visualizer({
				emitFile: true,
				filename: 'cache/stats.html',
			})
		);
		if (mode !== 'lib') {
			// 非lib模式
			return {
				...common,
				// 打包配置
				build: {
					target: 'modules',
					outDir: 'dist',
					assetsDir: 'assets',
					minify: 'esbuild',
					rollupOptions: {
						input: {
							main: path.resolve(__dirname, './src/main.js'),
						},
						output: {
							// 最小化拆分包
							manualChunks: id => {
								if (id.includes('node_modules')) {
									return id.toString().split('node_modules/')[1].split('/')[0].toString();
								}
							},
							entryFileNames: 'js/[name].[hash].js',
							chunkFileNames: 'js/[name].[hash].js',
							assetFileNames: assetInfo => {
								// 静态资源分类打包
								if (assetInfo.type === 'asset' && /\.(jpe?g|png|gif|svg)$/i.test(assetInfo.name)) {
									return 'img/[name].[hash].[ext]';
								}
								if (assetInfo.type === 'asset' && /\.(ttf|woff|woff2|eot)$/i.test(assetInfo.name)) {
									return 'fonts/[name].[hash].[ext]';
								}
								return '[ext]/[name].[hash].[ext]';
							},
							globals: {
								// react: 'React', // UMD构建模式下为依赖提供一个全局变量
							},
						},
						// external: ['react'], // 不打包依赖
					},
				},
			};
		} else {
			// lib模式
			const libName = `${packageJson.name}-lib`; // 库名称
			return {
				...common,
				build: {
					target: 'modules',
					outDir: 'dist',
					assetsDir: 'assets',
					minify: 'esbuild',
					lib: {
						entry: path.resolve(__dirname, './src/main.js'),
						name: libName,
						fileName: format => `${libName}.${format}.js`,
					},
				},
			};
		}
	}
});

// 将demos目录结构组织为树形JSON
const getHtmlTree = dirPath => {
	if (isNodeDir(dirPath)) {
		const dirName = path.basename(dirPath);
		const root = {
			children: [],
			htmlList: [], // html文件列表
			id: '0',
			fileName: dirName,
			filePath: dirPath, // 绝对路径
			name: 'Main',
			href: '/demos', // 访问链接
		};
		getNodeList(dirPath, root);
		return root;
	}
	return null;
};

// 仅将含有固定格式文件的目录识别为node
const isNodeDir = (dirPath, extNames = ['.html']) => {
	dirPath = path.resolve(__dirname, dirPath);
	if (fs.statSync(dirPath).isDirectory()) {
		const files = fs.readdirSync(dirPath);
		return !!files.find(file => {
			const extName = path.extname(file).toLocaleLowerCase();
			return extNames.indexOf(extName) !== -1;
		});
	}
	return false;
};

// 遍历文件夹构造目录树
const getNodeList = (dirPath, root, extNames = ['.html']) => {
	if (isNodeDir(dirPath)) {
		const { id, htmlList, children, href } = root;
		const files = fs.readdirSync(dirPath);
		files.forEach((file, i) => {
			const filePath = path.join(dirPath, file); //文件路径
			const attr = {
				id: `${id}-${i}`,
				fileName: file,
				filePath,
				name: format(path.parse(file).name), // 显示名
				href: `${href}/${file}`, // 访问链接
			};
			const extName = path.extname(file).toLocaleLowerCase();
			if (extNames.indexOf(extName) !== -1) {
				htmlList.push(attr);
			} else {
				if (isNodeDir(filePath)) {
					const child = {
						children: [],
						htmlList: [],
						...attr,
					};
					children.push(child);
					getNodeList(filePath, child);
				}
			}
		});
	}
};

// 字符串每个单词首字母大写
const format = (str, separator = ' ') => {
	const newStr = str.split(separator).reduce((pre, item) => {
		pre += item.charAt(0).toUpperCase() + item.slice(1) + separator;
		return pre;
	}, '');
	return newStr;
};
