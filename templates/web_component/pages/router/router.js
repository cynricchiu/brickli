// 将任意函数加入windows节点的事件监听
export function addFuncToListener(targetFunc, name) {
	return function (...args) {
		const event = new CustomEvent(name, { bubbles: true, detail: args });
		const result = targetFunc.apply(this, args);
		dispatchEvent(event);
		return result;
	};
}

// 路由管理类
export class Router {
	constructor(list = []) {
		this.list = list;
		// 根路由
		this.rootRoute = {
			slot: list[0]?.slot || '',
			path: '/',
			pathList: list[0]?.pathList || ['/'],
			component: list[0]?.component || null,
		};
		// 存储路由状态
		this.state = [this.rootRoute, this.rootRoute]; // [oldValue,curValue]
		this.flatList = this.toFlatList(list);
	}

	// 节点数据扁平化存储
	toFlatList(list, parentPath = this.rootRoute.path, parentPathList = [], result = []) {
		list.forEach(route => {
			let { slot, path, component, children, key } = route;
			const newPath = `${parentPath === '/' ? '' : parentPath}${path}`;
			const newParentPathList = [...parentPathList, newPath];
			result.push({
				slot,
				path: newPath,
				pathList: newParentPathList,
				component,
				key,
			});
			if (children?.length) {
				this.toFlatList(children, newPath, newParentPathList, result);
			}
		});
		return result;
	}

	// 路由是否存在
	exist(path) {
		return this.flatList.find(i => i.path === path);
	}

	// 切换路由
	switch(path) {
		const route = this.exist(path);
		if (route) {
			this.state = [this.state[1], route];
		}
		const [oldRoute, newRoute] = this.state;
		// console.log(`${oldRoute.path}到${newRoute.path}`);
		if (oldRoute && newRoute) {
			// 找到当前需要更新的节点
			const { appendList, removeList } = this._comparePathList(oldRoute.pathList, newRoute.pathList);
			if (oldRoute.path !== newRoute.path) {
				// 删除根路径下第一个子组件
				if (removeList.length >= 2) {
					const { component: parentComp } = this.flatList.find(item => item.path === removeList[0]);
					const { component: oldComp } = this.flatList.find(item => item.path === removeList[1]);
					parentComp.removeChild(oldComp);
				}
				// 逐级添加新组件
				for (let i = 0; i < appendList.length - 1; i++) {
					const { component: parentComp, slot } = this.flatList.find(item => item.path === appendList[i]);
					const { component: newComp } = this.flatList.find(item => item.path === appendList[i + 1]);
					if (slot) {
						newComp.slot = slot;
					}
					parentComp.appendChild(newComp);
				}
			}
		}
		return this.state;
	}

	// 比较新旧路径
	_comparePathList(oldPathList, newPathList) {
		let index = 0;
		let shortList = oldPathList;
		let longList = newPathList;
		if (oldPathList.length > newPathList.length) {
			shortList = newPathList;
			longList = oldPathList;
		}
		for (let i = 1; i < longList.length; i++) {
			if (shortList[i] !== longList[i]) {
				index = i - 1;
				break;
			}
		}
		const appendList = newPathList.slice(index); // 添加列表
		const removeList = oldPathList.slice(index); // 删除列表
		return { appendList, removeList };
	}
}
