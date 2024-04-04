const { demoList } = window.params;
const fragEle = document.createDocumentFragment();

// 创建树形组件
function createTreeComponent(root, element = document.createDocumentFragment()) {
	const { children, htmlList, id, name } = root;

	const figEle = document.createElement('figure');
	figEle.className = 'card';
	figEle.setAttribute('key', id);
	figEle.innerHTML = `<figcaption>${name}</figcaption>`;
	element.appendChild(figEle);

	// file node
	htmlList.sort((a, b) => {
		return a.name < b.name ? -1 : 1;
	});
	htmlList.forEach(attr => {
		const { name, id, href } = attr;
		const aEle = document.createElement('a');
		aEle.setAttribute('key', id);
		aEle.setAttribute('href', href);
		aEle.setAttribute('target', '_blank');
		aEle.innerHTML = name;
		figEle.appendChild(aEle);
	});
	// dir node
	children.forEach(child => {
		createTreeComponent(child, figEle);
	});
}

// 根据目录树展示所有卡片
const treeCom = document.createDocumentFragment();
createTreeComponent(demoList, treeCom);
document.querySelector('.content').appendChild(treeCom);
