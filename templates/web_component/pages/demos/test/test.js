import { Brick } from '../../router/component.js';
import html from './test.html?raw';

export class Test extends Brick {
	constructor(props = {}) {
		super(props);
	}
}

Brick.createElement('w-demos-test', html, Test);
