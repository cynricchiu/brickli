import { defineConfig, loadEnv } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import packageJson from './package.json';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ command, mode, ssrBuild }) => {
	const ENV = loadEnv(mode, process.cwd(), ''); // 获取环境变量
	const common = {
		publicDir: 'public',
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
					demoList: getHtmlTree('./pages/demos'),
				}).replaceAll('\\', '\\\\'), // 转成字符串才能传递给ejs，且路径中的\\替换成\\\\才能正确JSON.parse
			}),
		],
	};
	if (command === 'serve') {
		// dev
		return {
			...common,
			server: {
				host: ENV.VITE_HOST || 'localhst',
				port: ENV.VITE_PORT || '8080',
				hmr: true,
				open: '/home',
				https: false,
				cors: true,
				proxy: {
					// 地址代理，设置http://localhost:8080/home为主页面
					'/home': {
						target: `http://${ENV.VITE_HOST || 'localhst'}:${ENV.VITE_PORT || '8080'}`,
						changeOrigin: true,
						rewrite: path => path.replace(/^\/home/, 'pages/index/index.html'),
					},
					'/demos': {
						target: `http://${ENV.VITE_HOST || 'localhst'}:${ENV.VITE_PORT || '8080'}`,
						changeOrigin: true,
						rewrite: path => path.replace(/^\/demos/, 'pages/demos'),
					},
				},
			},
			build: {
				rollupOptions: {
					input: {
						index: path.resolve(__dirname, 'pages/index/index.html'),
					},
				},
			},
		};
	} else {
		if (mode !== 'lib') {
			// command === 'build'
			return {
				...common,
				// 打包配置
				build: {
					target: 'modules',
					outDir: 'dist', //指定输出路径
					assetsDir: 'assets', // 指定生成静态资源的存放路径
					minify: 'esbuild',
					rollupOptions: {
						input: path.resolve(__dirname, './src/main.js'), // 打包入口文件
						output: {
							// 最小化拆分包
							manualChunks: id => {
								if (id.includes('node_modules')) {
									return id.toString().split('node_modules/')[1].split('/')[0].toString();
								}
							},
							entryFileNames: 'js/[name].[hash].js',
							chunkFileNames: 'js/[name].[hash].js',
							assetFileNames: '[ext]/[name].[hash].[ext]',
							globals: {
								// react: 'React', // UMD构建模式下为依赖提供一个全局变量
							},
						},
						// external: ['react'], // 不打包依赖
					},
				},
			};
		} else {
			// build环境，但是lib模式
			const libName = `${packageJson.name}-lib`;
			return {
				...common,
				// 打包配置
				build: {
					target: 'modules',
					outDir: 'dist', //指定输出路径
					assetsDir: 'assets', // 指定生成静态资源的存放路径
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

// 仅将目录下有.html的识别为node
const isNodeDir = dirPath => {
	dirPath = path.resolve(__dirname, dirPath);
	if (fs.statSync(dirPath).isDirectory()) {
		const files = fs.readdirSync(dirPath);
		return !!files.find(file => {
			return path.extname(file).toLocaleLowerCase() === '.html';
		});
	}
	return false;
};

// 根据根节点构造目录树
const buildTree = root => {
	if (isNodeDir(root.path)) {
		const files = fs.readdirSync(root.path);
		files.forEach((file, i) => {
			const child = {
				name: format(file), // 显示名
				fileName: file, // 文件名
				path: path.join(root.path, file),
				children: [],
				id: `${root.id}-${i}`,
			};
			if (path.extname(file).toLocaleLowerCase() === '.html' || isNodeDir(child.path)) {
				root.children.push(child);
			}
			buildTree(child);
		});
	}
};

// 将demos目录结构组织为树形JSON
const getHtmlTree = dirPath => {
	if (isNodeDir(dirPath)) {
		const dirName = path.basename(dirPath);
		const root = {
			name: format(dirName), // 文件名遵循首字母大写规则
			fileName: dirName,
			path: dirPath,
			children: [],
			id: 0,
		};
		buildTree(root);
		return root;
	}
	return null;
};

// 首字母大写
const format = str => {
	return str.toLowerCase().replace(/( |^)[a-z]/g, letter => letter.toUpperCase());
};
