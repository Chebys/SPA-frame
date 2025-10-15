class Game2048 {
    constructor() {
        this.size = 4; // 4x4 网格
        this.grid = [];
        this.score = 0;
        this.highScore = localStorage.getItem('2048-high-score') || 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        
        this.initializeGrid();
        const initialTiles = this.addInitialTiles();
        this.lastMoveInfo = {
            movedTiles: [],
            mergedTiles: [],
            newTiles: initialTiles,
            scoreAdded: 0
        };
    }
    
    // 初始化网格
    initializeGrid() {
        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.grid[y][x] = null;
            }
        }
    }
    
    // 添加初始的两个方块
    addInitialTiles() {
        const tiles = [];
        // 第一个方块
        const pos1 = this.getRandomEmptyPosition();
        this.grid[pos1.y][pos1.x] = Math.random() < 0.9 ? 2 : 4;
        tiles.push({...pos1, value: this.grid[pos1.y][pos1.x]});
        
        // 第二个方块（确保与第一个位置不同）
        let pos2;
        do {
            pos2 = this.getRandomEmptyPosition();
        } while (pos1.x === pos2.x && pos1.y === pos2.y);
        
        this.grid[pos2.y][pos2.x] = Math.random() < 0.9 ? 2 : 4;
        tiles.push({...pos2, value: this.grid[pos2.y][pos2.x]});
        
        return tiles;
    }
    
    // 获取随机空位置
    getRandomEmptyPosition() {
        const availableCells = [];
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.grid[y][x]) {
                    availableCells.push({ x, y });
                }
            }
        }
        
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }
    
    // 在随机空位置添加新方块并返回其信息
    addNewTile() {
        const cell = this.getRandomEmptyPosition();
        if (!cell) return null;
        
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[cell.y][cell.x] = value;
        
        return { ...cell, value };
    }
    
    // 向左移动方块
    moveLeft() {
        // 记录移动前网格快照（深拷贝）
        const prevGrid = this.grid.map(row => row.slice());
        
        let scoreAdded = 0;
        const movedTiles = [];
        const mergedTiles = [];
        
        for (let y = 0; y < this.size; y++) {
            let row = this.grid[y].filter(cell => cell !== null);
            const originalRow = [...row];
            let newRow = [];
            let merged = new Array(row.length).fill(false);
            
            for (let x = 0; x < row.length; x++) {
                if (merged[x]) continue;
                
                if (x < row.length - 1 && row[x] === row[x + 1] && !merged[x + 1]) {
                    // 合并相同数字
                    const mergedValue = row[x] * 2;
                    newRow.push(mergedValue);
                    scoreAdded += mergedValue;
                    
                    // 记录合并信息
                    mergedTiles.push({
                        from: [
                            {x: x, y: y, value: row[x]},
                            {x: x + 1, y: y, value: row[x + 1]}
                        ],
                        to: {x: newRow.length - 1, y: y, value: mergedValue}
                    });
                    
                    merged[x] = true;
                    merged[x + 1] = true;
                } else {
                    newRow.push(row[x]);
                }
            }
            
            // 补充空值到 row 长度为 4
            while (newRow.length < this.size) {
                newRow.push(null);
            }
            
            // 记录移动的方块（基于压缩前后的相对索引）
            for (let x = 0; x < originalRow.length; x++) {
                if (merged[x]) continue;
                
                // 找到在新行中的位置（只在 newRow 中查找对应值）
                // 从左侧开始查找，不使用偏移，因为我们比较的是压缩前后的相对位置
                let newX = newRow.indexOf(originalRow[x]);
                // 处理找不到的情况（不应发生，但保守处理）
                if (newX === -1) newX = x;
                
                // 但是 newX 是相对于完整 newRow 的索引（包含 nulls）
                // 原来压缩时的 x 对应到完整行的 x 为：same as x (since we're comparing compressed positions)
                // 为避免复杂错误，我们只在最后通过 prevGrid vs this.grid 来判断整体是否移动
                movedTiles.push({
                    from: {x: x, y: y, value: originalRow[x]},
                    to: {x: newX, y: y, value: originalRow[x]}
                });
            }
            
            this.grid[y] = newRow;
        }
        
        this.score += scoreAdded;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('2048-high-score', this.highScore);
        }
        
        // 比较前后整个网格来判断是否真的发生移动
        let moved = false;
        outer:
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (prevGrid[y][x] !== this.grid[y][x]) {
                    moved = true;
                    break outer;
                }
            }
        }
        
        // 添加新方块（仅当确实发生移动）
        const newTile = moved ? this.addNewTile() : null;
        
        this.lastMoveInfo = {
            movedTiles,
            mergedTiles,
            newTiles: newTile ? [newTile] : [],
            scoreAdded,
            moved
        };
        
        return this.lastMoveInfo;
    }
    
    // 向右移动方块
    moveRight() {
        // 记录移动前网格快照（深拷贝）
        const prevGrid = this.grid.map(row => row.slice());
        
        let scoreAdded = 0;
        const movedTiles = [];
        const mergedTiles = [];
        
        for (let y = 0; y < this.size; y++) {
            let row = this.grid[y].filter(cell => cell !== null);
            const originalRow = [...row];
            let newRow = [];
            let merged = new Array(row.length).fill(false);
            
            for (let x = row.length - 1; x >= 0; x--) {
                if (merged[x]) continue;
                
                if (x > 0 && row[x] === row[x - 1] && !merged[x - 1]) {
                    // 合并相同数字
                    const mergedValue = row[x] * 2;
                    newRow.unshift(mergedValue);
                    scoreAdded += mergedValue;
                    
                    // 记录合并信息
                    mergedTiles.push({
                        from: [
                            {x: x, y: y, value: row[x]},
                            {x: x - 1, y: y, value: row[x - 1]}
                        ],
                        to: {
                            x: this.size - newRow.length, 
                            y: y, 
                            value: mergedValue
                        }
                    });
                    
                    merged[x] = true;
                    merged[x - 1] = true;
                } else {
                    newRow.unshift(row[x]);
                }
            }
            
            // 补充空值到 row 长度为 4
            while (newRow.length < this.size) {
                newRow.unshift(null);
            }
            
            // 记录移动的方块（简单记录，最终以网格差异判断是否移动）
            for (let x = 0; x < originalRow.length; x++) {
                const originalFullX = this.size - originalRow.length + x;
                const newFullX = newRow.indexOf(originalRow[x], originalFullX);
                
                movedTiles.push({
                    from: {x: originalFullX, y: y, value: originalRow[x]},
                    to: {x: newFullX === -1 ? originalFullX : newFullX, y: y, value: originalRow[x]}
                });
            }
            
            this.grid[y] = newRow;
        }
        
        this.score += scoreAdded;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('2048-high-score', this.highScore);
        }
        
        // 比较前后整个网格来判断是否真的发生移动
        let moved = false;
        outer2:
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (prevGrid[y][x] !== this.grid[y][x]) {
                    moved = true;
                    break outer2;
                }
            }
        }
        
        // 添加新方块（仅当确实发生移动）
        const newTile = moved ? this.addNewTile() : null;
        
        this.lastMoveInfo = {
            movedTiles,
            mergedTiles,
            newTiles: newTile ? [newTile] : [],
            scoreAdded,
            moved
        };
        
        return this.lastMoveInfo;
    }
    
    // 向上移动方块
    moveUp() {
        // 记录移动前网格快照（深拷贝）
        const prevGrid = this.grid.map(row => row.slice());
        
        let scoreAdded = 0;
        const movedTiles = [];
        const mergedTiles = [];
        
        for (let x = 0; x < this.size; x++) {
            // 提取当前列
            let column = [];
            for (let y = 0; y < this.size; y++) {
                if (this.grid[y][x] !== null) {
                    column.push(this.grid[y][x]);
                }
            }
            
            const originalColumn = [...column];
            let newColumn = [];
            let merged = new Array(column.length).fill(false);
            
            for (let y = 0; y < column.length; y++) {
                if (merged[y]) continue;
                
                if (y < column.length - 1 && column[y] === column[y + 1] && !merged[y + 1]) {
                    // 合并相同数字
                    const mergedValue = column[y] * 2;
                    newColumn.push(mergedValue);
                    scoreAdded += mergedValue;
                    
                    // 记录合并信息
                    mergedTiles.push({
                        from: [
                            {x: x, y: y, value: column[y]},
                            {x: x, y: y + 1, value: column[y + 1]}
                        ],
                        to: {x: x, y: newColumn.length - 1, value: mergedValue}
                    });
                    
                    merged[y] = true;
                    merged[y + 1] = true;
                } else {
                    newColumn.push(column[y]);
                }
            }
            
            // 补充空值到 column 长度为 4
            while (newColumn.length < this.size) {
                newColumn.push(null);
            }
            
            // 记录移动的方块（简单记录，最终以网格差异判断是否移动）
            for (let y = 0; y < originalColumn.length; y++) {
                let newY = newColumn.indexOf(originalColumn[y]);
                if (newY === -1) newY = y;
                
                movedTiles.push({
                    from: {x: x, y: y, value: originalColumn[y]},
                    to: {x: x, y: newY, value: originalColumn[y]}
                });
            }
            
            // 更新原网格
            for (let y = 0; y < this.size; y++) {
                this.grid[y][x] = newColumn[y];
            }
        }
        
        this.score += scoreAdded;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('2048-high-score', this.highScore);
        }
        
        // 比较前后整个网格来判断是否真的发生移动
        let moved = false;
        outer3:
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (prevGrid[y][x] !== this.grid[y][x]) {
                    moved = true;
                    break outer3;
                }
            }
        }
        
        // 添加新方块（仅当确实发生移动）
        const newTile = moved ? this.addNewTile() : null;
        
        this.lastMoveInfo = {
            movedTiles,
            mergedTiles,
            newTiles: newTile ? [newTile] : [],
            scoreAdded,
            moved
        };
        
        return this.lastMoveInfo;
    }
    
    // 向下移动方块
    moveDown() {
        // 记录移动前网格快照（深拷贝）
        const prevGrid = this.grid.map(row => row.slice());
        
        let scoreAdded = 0;
        const movedTiles = [];
        const mergedTiles = [];
        
        for (let x = 0; x < this.size; x++) {
            // 提取当前列
            let column = [];
            for (let y = 0; y < this.size; y++) {
                if (this.grid[y][x] !== null) {
                    column.push(this.grid[y][x]);
                }
            }
            
            const originalColumn = [...column];
            let newColumn = [];
            let merged = new Array(column.length).fill(false);
            
            for (let y = column.length - 1; y >= 0; y--) {
                if (merged[y]) continue;
                
                if (y > 0 && column[y] === column[y - 1] && !merged[y - 1]) {
                    // 合并相同数字
                    const mergedValue = column[y] * 2;
                    newColumn.unshift(mergedValue);
                    scoreAdded += mergedValue;
                    
                    // 记录合并信息
                    mergedTiles.push({
                        from: [
                            {x: x, y: y, value: column[y]},
                            {x: x, y: y - 1, value: column[y - 1]}
                        ],
                        to: {
                            x: x, 
                            y: this.size - newColumn.length, 
                            value: mergedValue
                        }
                    });
                    
                    merged[y] = true;
                    merged[y - 1] = true;
                } else {
                    newColumn.unshift(column[y]);
                }
            }
            
            // 补充空值到 column 长度为 4
            while (newColumn.length < this.size) {
                newColumn.unshift(null);
            }
            
            // 记录移动的方块（简单记录，最终以网格差异判断是否移动）
            for (let y = 0; y < originalColumn.length; y++) {
                const originalFullY = this.size - originalColumn.length + y;
                const newFullY = newColumn.indexOf(originalColumn[y], originalFullY);
                
                movedTiles.push({
                    from: {x: x, y: originalFullY, value: originalColumn[y]},
                    to: {x: x, y: newFullY === -1 ? originalFullY : newFullY, value: originalColumn[y]}
                });
            }
            
            // 更新原网格
            for (let y = 0; y < this.size; y++) {
                this.grid[y][x] = newColumn[y];
            }
        }
        
        this.score += scoreAdded;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('2048-high-score', this.highScore);
        }
        
        // 比较前后整个网格来判断是否真的发生移动
        let moved = false;
        outer4:
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (prevGrid[y][x] !== this.grid[y][x]) {
                    moved = true;
                    break outer4;
                }
            }
        }
        
        // 添加新方块（仅当确实发生移动）
        const newTile = moved ? this.addNewTile() : null;
        
        this.lastMoveInfo = {
            movedTiles,
            mergedTiles,
            newTiles: newTile ? [newTile] : [],
            scoreAdded,
            moved
        };
        
        return this.lastMoveInfo;
    }
    
    // 检查游戏是否结束
    checkGameOver() {
        // 检查是否有空位
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === null) {
                    return false; // 还有空位，游戏未结束
                }
            }
        }
        
        // 检查是否还有可合并的方块
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const current = this.grid[y][x];
                // 检查右侧
                if (x < this.size - 1 && current === this.grid[y][x + 1]) {
                    return false;
                }
                // 检查下方
                if (y < this.size - 1 && current === this.grid[y + 1][x]) {
                    return false;
                }
            }
        }
        
        this.gameOver = true;
        return true;
    }
    
    // 检查是否获胜（达到2048）
    checkWin() {
        if (this.won && !this.keepPlaying) {
            return true;
        }
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] >= 2048) {
                    this.won = true;
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 重新开始游戏
    restart() {
        this.initializeGrid();
        const initialTiles = this.addInitialTiles();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        
        this.lastMoveInfo = {
            movedTiles: [],
            mergedTiles: [],
            newTiles: initialTiles,
            scoreAdded: 0,
            moved: true
        };
        
        return this.lastMoveInfo;
    }
}

return Game2048;
