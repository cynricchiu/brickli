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
					title: format(packageJson.name),
					demoList: getIndexTree(ENV.VITE_DEMO_DIR, ENV.VITE_DEMO_ROUTE_PATH),
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
const getIndexTree = (dirPath, route) => {
	const root = {
		name: 'Main', // 显示名称
		id: '0',
		dirName: path.basename(dirPath),
		dirPath: path.resolve(__dirname, dirPath), // 绝对路径
		href: route, // 访问链接
		children: [],
	};
	getNodeList(root);
	return root;
};

// 仅将含有固定格式文件的目录识别为node
const isValidNode = (filePath, featureFile = 'index.html') => {
	const fullPath = path.resolve(__dirname, filePath);
	if (fs.statSync(fullPath).isDirectory()) {
		const files = fs.readdirSync(fullPath);
		return !!files.find(file => file === featureFile);
	}
	return false;
};

// 遍历文件夹构造目录树
const getNodeList = (root, featureFile = 'index.html') => {
	const { id, dirPath, href, children } = root;
	if (fs.statSync(dirPath).isDirectory()) {
		const files = fs.readdirSync(dirPath);
		files.forEach((file, index) => {
			const filePath = path.resolve(root.dirPath, file);
			if (isValidNode(filePath, featureFile)) {
				const fileName = path.basename(filePath);
				const node = {
					name: format(fileName),
					id: `${id}-${index}`,
					dirName: fileName,
					dirPath: path.resolve(__dirname, filePath),
					href: `${href}/${fileName}`,
					children: [],
				};
				children.push(node);
				getNodeList(node, featureFile);
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
