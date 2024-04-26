import { Brick } from '../../router/component.js';
import html from './page.html?raw';

export class Page extends Brick {
	constructor(props = {}) {
		super(props);
		this.setTheme(props.theme || 'light');
	}

	onRender() {
		const { title } = this.props;
		this.root.querySelector('header h1').innerHTML = title;
		this.root.querySelector('.changeTheme')?.addEventListener('click', () => {
			this.theme === 'light' ? this.setTheme('dark') : this.setTheme('light');
		});
	}

	setTheme(theme) {
		this.setAttribute('theme', theme);
		this.theme = theme;
	}
}

Brick.createElement('w-page', html, Page);
