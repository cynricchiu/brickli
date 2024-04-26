import { Brick } from '../../router/component.js';
import html from './readme.html?raw';

export class Readme extends Brick {
	constructor(props = {}) {
		super(props);
	}
}

Brick.createElement('w-demos-readme', html, Readme);
