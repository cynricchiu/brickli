#!/usr/bin/env node
const packageJson = require('./package.json');
const { program } = require('commander');
const prompts = require('prompts');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// package default config
const defaultConfig = {
	name: 'brickli',
	version: '1.0.0',
	description: '',
	repository: '',
	keywords: [],
	author: '',
	license: 'MIT',
};

// command list
const actions = {
	create: {
		alias: 'ct',
		desc: '根据模板快速创建工程',
		action: () => {
			prompts({
				type: 'select',
				name: 'template',
				message: chalk.green('请选择工程模板：'),
				choices: [
					{ title: 'vanilla', description: '用于基础开发', value: 'vanilla' },
					{ title: 'wasm', description: '用于C++&Webassembly开发', value: 'wasm' },
					{ title: 'react', description: '用于React开发', value: 'react' },
					{ title: 'react-ts', description: '用于React&TS开发', value: 'react-ts' },
					{ title: 'webgl', description: '用于WebGL开发', value: 'web component' },
				],
			}).then(response => {
				const { template } = response;
				if (!template) {
					console.log(chalk.red.bold('已取消'));
				} else {
					console.log(`已选择模板：${template}`);
					(async function () {
						const { name, version, description, repository, keywords, author, license } = defaultConfig;
						prompts([
							{
								type: 'text',
								name: 'name',
								message: 'Package Name: ',
								initial: `${name}`,
							},
							{
								type: 'text',
								name: 'version',
								message: 'Version: ',
								initial: `${version}`,
							},
							{
								type: 'text',
								name: 'description',
								message: 'Description: ',
								initial: `${description}`,
							},
							{
								type: 'text',
								name: 'repository',
								message: 'Git repository: ',
								initial: `${repository}`,
							},
							{
								type: 'text',
								name: 'keywords',
								message: 'Keywords: ',
								initial: `${keywords}`,
							},
							{
								type: 'text',
								name: 'author',
								message: 'Author: ',
								initial: `${author}`,
							},
							{
								type: 'text',
								name: 'licence',
								message: 'License: ',
								initial: `${license}`,
							},
						]).then(response => {
							if (!response) {
								console.log(chalk.red.bold('已取消'));
							} else {
								const { name, keywords } = response;
								response.keywords = keywords.split(',') || [];
								console.log(
									chalk.green(`\nAbout to write to ${path.resolve(__dirname, './package.json')}:\n`),
									response
								);
								const dir = path.resolve(__dirname, './templates', template);
								const dirNew = path.resolve('./', name);
								// copy template files
								copyDir(dir, dirNew);
								// update package.json
								const jsonPath = path.resolve(__dirname, `./templates/${template}/package.json`);
								const jsonPathNew = path.resolve('./', `${name}/package.json`);
								let packageJson = JSON.parse(fs.readFileSync(jsonPath));
								packageJson = { ...packageJson, ...response };
								fs.writeFileSync(jsonPathNew, JSON.stringify(packageJson, null, '\t'), {
									flag: 'w+',
								});
								console.log(
									chalk.green(`\n创建完成，按如下命令启动:`),
									chalk.yellow(`\ncd ./${name}\nyarn\nyarn dev`)
								);
							}
						});
					})();
				}
			});
		},
	},
	'*': {
		alias: '',
		desc: 'command not found',
		action: () => {
			console.log('未找到命令,请查看帮助-h');
		},
	},
};

program.version(packageJson.version, '-v, --version');
Object.keys(actions).forEach(key => {
	const { alias, desc, action } = actions[key];
	program
		.command(key)
		.alias(alias)
		.description(desc)
		.action((source, destination) => {
			action.call(null);
		});
});
program.parse(process.argv);

// other tool function
// fs copy dir
function isExistDir(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}
function copyDir(sourceDir, destinationDir) {
	isExistDir(destinationDir);
	const sourceFiles = fs.readdirSync(sourceDir, { withFileTypes: true });
	sourceFiles.forEach(file => {
		const newSourceDir = path.resolve(sourceDir, file.name);
		const newDestinationDir = path.resolve(destinationDir, file.name);
		if (file.isDirectory()) {
			isExistDir(newDestinationDir);
			copyDir(newSourceDir, newDestinationDir);
		} else {
			const newSourceFile = newSourceDir;
			const newDestinationFile = newDestinationDir;
			fs.copyFileSync(newSourceFile, newDestinationFile);
		}
	});
}
