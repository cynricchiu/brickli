// 私有属性
const LIFECYCLE_CREATE = Symbol(),
	LIFECYCLE_RENDER = Symbol();

class Component extends HTMLElement {
	static template = '';
	static useShadow = true; // 可选是否使用shadowDom

	// 注册组件
	static createElement(tag, template, base = class extends Component {}) {
		base.template = template;
		customElements.define(tag, base);
	}

	constructor(props = {}) {
		super();
		this.props = { ...props };
		this[LIFECYCLE_CREATE]();
	}

	// 生命周期
	onBeforeCreated() {
		// shadowDOM创建前
	}

	onCreated() {
		// template和style已经准备好，但是未组装，组件的html仍然为空
	}

	onRender() {
		// 组件渲染
	}

	onAdded() {
		// 组件被挂载到dom节点时
	}

	onRemoved() {
		// 组件从dom节点卸载时
	}

	connectedCallback() {
		this.onAdded();
	}

	disconnectedCallback() {
		this.onRemoved();
	}

	[LIFECYCLE_CREATE]() {
		this.onBeforeCreated();
		const useShadow = this.constructor.useShadow;
		if (useShadow && !this.shadowRoot) {
			this.attachShadow({ mode: 'open' });
		}
		this.root = this.shadowRoot || this;
		this[LIFECYCLE_RENDER]();
	}

	[LIFECYCLE_RENDER]() {
		const template = this.constructor.template;
		const tpl = document.createElement('template');
		tpl.innerHTML = template;
		this.onCreated();
		this.root.appendChild(tpl.content);
		const { style } = this.props;
		if (style) {
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(style);
			this.root.adoptedStyleSheets.push(sheet);
		}
		this.onRender();
	}
}

export { Component as Brick };
