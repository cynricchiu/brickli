import { Brick } from '../../router/component.js';

export class Sider extends Brick {
	constructor(props = {}) {
		super(props);
		this.selectedKey = '';
	}

	onRender() {
		const { list } = this.props;
		const createTree = function (items, root = document.createDocumentFragment()) {
			items.forEach((item, index) => {
				const { name, children, key } = item;
				const ul = document.createElement('ul');
				ul.className = 'menu';
				ul.setAttribute('key', key);
				const li_name = document.createElement('li');
				li_name.innerHTML = name;
				li_name.className = 'name';
				ul.appendChild(li_name);
				root.append(ul);
				if (children?.length) {
					ul.className += ' folder';
					const li_content = document.createElement('li');
					li_content.className = 'content';
					ul.setAttribute('expand', 'true');
					ul.appendChild(li_content);
					createTree(children, li_content);
				}
			});
			return root;
		};
		this.root.appendChild(createTree(list));

		this.root.querySelectorAll('.name')?.forEach(ele => {
			ele.addEventListener('click', () => {
				// 展开效果
				const parent = ele.parentElement;
				if (parent.hasAttribute('expand')) {
					const expand = parent.getAttribute('expand');
					if (expand === 'false') {
						parent.setAttribute('expand', 'true');
					} else {
						parent.setAttribute('expand', 'false');
					}
				}
				// 选中效果
				if (!parent.hasAttribute('expand')) {
					this.root.querySelector('[selected]')?.removeAttribute('selected');
					parent.setAttribute('selected', '');
					this.selectedKey = parent.getAttribute('key');
					const { onSelect } = this.props;
					if (onSelect) {
						onSelect.apply(this, [this.selectedKey]);
					}
				}
			});
		});
	}

	onAdded() {}
}

Brick.createElement('w-page-sider', '', Sider);
