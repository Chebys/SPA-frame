const { $n } = require(':spa')

class AnimController{
	constructor(gameBoard, cellSize){
		this.gameBoard = gameBoard
		this.cellSize = cellSize
	}
	
	getCellPos(x, y){
		let cell = this.gameBoard.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`)
		return {
			left: cell.offsetLeft,
			top: cell.offsetTop,
			size: cell.clientWidth
		}
	}
	
	createTileEl({x, y, value}, zIndex='20'){
		const {top, left, size} = this.getCellPos(x, y);
		let el = $n('div', {
			className: `tile tile-${value}`,
			content: String(value),
			style: {
				position: 'absolute',
				width: size+'px',
				height: size+'px',
				left: left+'px',
				top: top+'px',
				zIndex
			}
		});
		this.gameBoard.appendChild(el);
		return el;
	}
	
	// 执行移动和合并动画
	async move(movedTiles, mergedTiles) {
		return new Promise(resolve => {
			const animationElements = [];
			const cellSize = this.cellSize;
			
			// 先处理移动的方块
			movedTiles.forEach(tile => {
				const element = this.createTileEl(tile.from);
				animationElements.push(element);
				
				// 启动移动动画
				setTimeout(() => {
					element.style.transition = 'all 0.2s ease';
					element.style.left = `${tile.to.x * cellSize}%`;
					element.style.top = `${tile.to.y * cellSize}%`;
				}, 10);
			});
			
			// 处理合并的方块
			mergedTiles.forEach(merge => {
				// 第一个方块移动到合并位置
				const element1 = this.createTileEl(merge.from[0]);
				animationElements.push(element1);
				
				// 第二个方块移动到合并位置并消失
				const element2 = this.createTileEl(merge.from[1]);
				animationElements.push(element2);
				
				// 合并后的方块
				const mergedElement = this.createTileEl(merge.to, '25');
				mergedElement.style.transform = 'scale(0)';
				animationElements.push(mergedElement);
				
				// 启动合并动画
				setTimeout(() => {
					// 移动两个方块到合并位置
					element1.style.transition = 'all 0.2s ease';
					element1.style.left = `${merge.to.x * cellSize}%`;
					element1.style.top = `${merge.to.y * cellSize}%`;
					
					element2.style.transition = 'all 0.2s ease';
					element2.style.left = `${merge.to.x * cellSize}%`;
					element2.style.top = `${merge.to.y * cellSize}%`;
					element2.style.opacity = '0';
					
					// 显示合并后的方块并添加缩放动画
					setTimeout(() => {
						mergedElement.style.transition = 'transform 0.15s ease';
						mergedElement.style.transform = 'scale(1.1)';
						
						setTimeout(() => {
							mergedElement.style.transform = 'scale(1)';
						}, 150);
					}, 200);
				}, 10);
			});
			
			// 等待所有动画完成
			setTimeout(() => {
				// 清除动画元素
				animationElements.forEach(el => el.remove());
				// 绘制最终状态的方块
				resolve();
			}, 350);
		});
	}

	// 新增方块的出现动画
	async newTile(x, y, value) {
		return new Promise(resolve => {
			const tile = this.createTileEl({x, y, value}, '40');
			tile.style.transform = 'scale(0)';
			
			// 执行出现动画
			setTimeout(() => {
				tile.style.transition = 'transform 0.2s ease';
				tile.style.transform = 'scale(1)';
				
				// 等待动画完成
				setTimeout(() => {
					resolve();
				}, 200);
			});
		});
	}

}

return AnimController;