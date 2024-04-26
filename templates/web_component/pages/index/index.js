import { Page } from './components/page.js';
import { Sider } from './components/sider.js';
import pageStyle from './components/page.css?raw';
import siderStyle from './components/sider.css?raw';
import { Router, addFuncToListener } from '../router/router.js';
import { Test } from '../demos/index.js';
import { Readme } from '../demos/index.js';

const { title } = window.params;
console.log(window.params);

const page = new Page({ style: pageStyle, title, theme: 'light' });
document.body.appendChild(page);

const test = new Test();
const readme = new Readme();

// 路由配置信息
let list = [
	{
		name: 'Demo',
		path: '/demo',
		component: page,
		slot: 'content',
		children: [
			{ name: 'Getting Started', path: '/readme', component: readme },
			{ name: 'Test', path: '/test', component: test },
		],
	},
];

list = prepareList([...list]);
function prepareList(list, key = '') {
	list?.forEach((item, index) => {
		item.key = key ? `${key}-${index}` : `${index}`;
		if (item?.children && item.children.length) {
			prepareList(item?.children, item.key);
		}
	});
	return list;
}

const router = new Router(list);

const sider = new Sider({
	style: siderStyle,
	list: list[0].children,
	onSelect: key => {
		const { path } = router.flatList.find(i => i.key === key);
		history.pushState({}, null, path);
	},
});
sider.slot = 'sider';
page.appendChild(sider);

// 路由监听
history.pushState = addFuncToListener(history.pushState, 'pushState');
window.addEventListener(
	'pushState',
	function (e) {
		const path = e.detail[2];
		router.switch(path);
	},
	false
);
