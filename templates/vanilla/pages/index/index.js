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
		a.setAttribute('route', `${href}/index.html`);
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
document.querySelectorAll('a').forEach(ele => {
	ele.addEventListener(
		'click',
		e => {
			document.querySelectorAll('a').forEach(e => {
				e.removeAttribute('selected');
			});
			if (!e.target.hasAttribute('selected')) {
				e.target.setAttribute('selected', '');
			}
			// 跳转iframe
			const route = e.target.getAttribute('route');
			const url = new URL(route, location.href);
			iframe.src = url.href;
			// 对齐theme
			iframe.onload = e => {
				const theme = html.getAttribute('theme');
				e.target.contentDocument.querySelector('html').setAttribute('theme', theme);
				e.target.contentDocument.querySelector('article')?.setAttribute('data-theme', theme);
			};
		},
		false
	);
});
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
function setTheme(theme = 'light') {
	html.setAttribute('theme', theme);
	iframe.contentDocument.querySelector('html').setAttribute('theme', theme);
	iframe.contentDocument.querySelector('article')?.setAttribute('data-theme', theme);
}
setTheme('light');
document.querySelector('.changeTheme').addEventListener('click', () => {
	html.getAttribute('theme') === 'light' ? setTheme('dark') : setTheme('light');
});
