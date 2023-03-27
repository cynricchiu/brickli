import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import packageJson from './package.json';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ command, mode, ssrBuild }) => {
	const common = {
		publicDir: 'public',
		resolve: {
			alias: {
				'@styles': path.resolve(__dirname, './src/assets/styles'),
				'@images': path.resolve(__dirname, './src/assets/images'),
				'@data': path.resolve(__dirname, './src/assets/data'),
				'@js': path.resolve(__dirname, './src/assets/js'),
			},
		},
		plugins: [
			ViteEjsPlugin({
				title: packageJson.name,
				params: JSON.stringify({
					demoList: getHtmlTree('./demos'),
				}).replaceAll('\\', '\\\\'), // 转成字符串才能传递给ejs，且路径中的\\替换成\\\\才能正确JSON.parse
			}),
		],
	};
	if (command === 'serve') {
		// dev
		return {
			...common,
			server: {
				host: 'localhost',
				port: '8080',
				open: true,
				https: false,
				cors: true,
			},
			build: {
				rollupOptions: {
					input: {
						index: path.resolve(__dirname, 'index.html'),
						demo: path.resolve(__dirname, 'demo/createMap.html'),
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
					minify: 'terser', // terser需要另行安装
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
								react: 'React',
							},
						},
						external: ['react'], // 不需要打包的文件
					},
				},
			};
		} else {
			// build环境，但是lib模式
			return {
				...common,
				// 打包配置
				build: {
					target: 'modules',
					outDir: 'dist', //指定输出路径
					assetsDir: 'assets', // 指定生成静态资源的存放路径
					minify: 'terser', // terser需要另行安装
					lib: {
						entry: path.resolve(__dirname, './src/main.js'),
						name: 'mylib',
						fileName: format => `mylib.${format}.js`,
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

// 将demos目录结构组织为树形JSON
const getHtmlTree = (dirPath, tree = []) => {
	if (isNodeDir(dirPath)) {
		const dirName = path.basename(dirPath);
		const parentNode = {
			name: format(dirName),
			path: dirPath,
			children: [],
		};
		tree.push(parentNode);
		const files = fs.readdirSync(parentNode.path);
		files.forEach(file => {
			const childNode = {
				name: format(file),
				path: path.join(parentNode.path, file),
				children: [],
			};
			if (path.extname(file).toLocaleLowerCase() === '.html') {
				parentNode.children.push(childNode);
			} else if (isNodeDir(childNode.path)) {
				getHtmlTree(childNode.path, parentNode.children);
			}
		});
	}
	return tree;
};

// 首字母大写
const format = str => {
	return str.toLowerCase().replace(/( |^)[a-z]/g, letter => letter.toUpperCase());
};
