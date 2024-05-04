const { demoList } = window.params;
const html = document.querySelector('html');
const iframe = document.querySelector('iframe');
console.log(window.params);

// 创建树形组件
function createCardComp(node, ele = document.createDocumentFragment()) {
	const { name, id, href, children } = node;
	const ul = document.createElement('ul');
	ul.setAttribute('key', id);
	ul.setAttribute('expand', 'true');
	ele.appendChild(ul);
	if (children.length) {
		ul.innerHTML = `<li class="title">${name}</li>`;
		const li = document.createElement('li');
		li.className = 'list';
		ul.appendChild(li);
		children.forEach(child => createCardComp(child, li));
	} else {
		const a = document.createElement('a');
		a.setAttribute('key', id);
		a.className = 'iframe';
		// a.setAttribute('href', `${href}/index.html`);
		// a.setAttribute('target', 'demo'); // 绑定到iframe
		a.setAttribute('route', `${href}`);
		a.innerHTML = name;
		const span = document.createElement('span');
		span.className = 'blank';
		span.setAttribute('route', `${href}/index.html`);
		a.appendChild(span);
		ul.appendChild(a);
	}
	return ele;
}
function createTreeComp(list = [], parentEle = document.createDocumentFragment()) {
	list.sort((a, b) => {
		return a.name < b.name ? -1 : 1;
	});
	list.forEach(item => {
		parentEle.appendChild(createCardComp(item));
	});
	return parentEle;
}

// 主页
const treeCom = createTreeComp(demoList.children);
document.querySelector('.sider').appendChild(treeCom);
// 主题切换
document.querySelectorAll('.title').forEach(ele => {
	ele.addEventListener('click', e => {
		const ul = e.target.parentElement;
		const expand = ul.getAttribute('expand');
		expand === 'true' ? ul.setAttribute('expand', 'false') : ul.setAttribute('expand', 'true');
	});
});
// 侧栏点击
// 页内切换
document.querySelectorAll('a').forEach(ele => {
	ele.addEventListener(
		'click',
		e => {
			const route = e.target.getAttribute('route');
			history.replaceState({}, null, route);
		},
		false
	);
});
// 打开新页面
document.querySelectorAll('.blank').forEach(ele => {
	ele.addEventListener(
		'click',
		e => {
			e.stopPropagation(); // 阻止触发a的事件
			const route = e.target.getAttribute('route');
			window.open(route);
		},
		false
	);
});
// 设置主题
function setTheme(theme = 'light') {
	html.setAttribute('theme', theme);
	iframe.contentDocument.querySelector('html').setAttribute('theme', theme);
	iframe.contentDocument.querySelector('article')?.setAttribute('data-theme', theme);
}
document.querySelector('.changeTheme').addEventListener('click', () => {
	html.getAttribute('theme') === 'light' ? setTheme('dark') : setTheme('light');
});
// 路由切换
function addFuncToListener(targetFunc, name) {
	return function (...args) {
		const event = new CustomEvent(name, { bubbles: true, detail: args });
		const result = targetFunc.apply(this, args);
		dispatchEvent(event);
		return result;
	};
}
history.replaceState = addFuncToListener(history.replaceState, 'replaceState');
window.addEventListener(
	'replaceState',
	function (e) {
		const route = e.detail[2];
		// 跳转iframe
		const url = new URL(`${route}/index.html`, location.href);
		iframe.src = url.href;
		// 对齐theme
		iframe.onload = e => {
			const theme = html.getAttribute('theme');
			e.target.contentDocument.querySelector('html').setAttribute('theme', theme);
			e.target.contentDocument.querySelector('article')?.setAttribute('data-theme', theme);
		};
		// 侧栏选中
		document.querySelectorAll('a').forEach(ele => {
			ele.removeAttribute('selected');
		});
		const currentLink = document.querySelector(`[route="${route}"]`);
		if (currentLink && !currentLink.hasAttribute('selected')) {
			currentLink.setAttribute('selected', '');
		}
	},
	false
);
// 首页加载
setTheme('light');
const defaultRoute = window.params.demoList?.children[0]?.href; // 默认路由
history.replaceState({}, null, defaultRoute);
