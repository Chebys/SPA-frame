let Game2048 = require('game')
let AnimController = require('anim')

class GameController {
    constructor() {
        this.game = new Game2048();
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.gameOverElement = document.getElementById('game-over');
        this.gameWinElement = document.getElementById('game-win');
        this.finalScoreElement = document.getElementById('final-score');
		this.anim = new AnimController(this.gameBoard, 100 / this.game.size);
        
        // 按钮
        this.newGameButton = document.getElementById('new-game');
        this.restartButton = document.getElementById('restart');
        this.continueButton = document.getElementById('continue');
        this.newWinGameButton = document.getElementById('new-win-game');
        
        // 初始化游戏界面
        this.initializeBoard();
        this.updateScore();
        this.setupEventListeners();
        
        // 绘制初始方块
        this.drawInitialTiles();
    }
    
    // 初始化游戏板
    initializeBoard() {
        // 清空游戏板
        this.gameBoard.innerHTML = '';
        
        // 创建网格单元格
        for (let y = 0; y < this.game.size; y++) {
            for (let x = 0; x < this.game.size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    // 绘制初始方块
    drawInitialTiles() {
        const { newTiles } = this.game.lastMoveInfo;
        newTiles.forEach(tile => {
            this.anim.newTile(tile.x, tile.y, tile.value);
        });
    }
    
    // 绘制当前状态的方块（无动画）
    drawTiles() {
        // 先移除所有现有的方块
        const existingTiles = document.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        
        // 绘制所有方块
        for (let y = 0; y < this.game.size; y++) {
            for (let x = 0; x < this.game.size; x++) {
                const value = this.game.grid[y][x];
                if (value) {
                    this.createStaticTile(x, y, value);
                }
            }
        }
    }
    
    // 创建静态方块（无动画）
    createStaticTile(x, y, value) {
        const cellSize = 100 / this.game.size;
        const tile = document.createElement('div');
        tile.classList.add('tile', `tile-${value}`);
        tile.textContent = value;
        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.style.width = `${cellSize}%`;
        tile.style.height = `${cellSize}%`;
        tile.style.left = `${x * cellSize}%`;
        tile.style.top = `${y * cellSize}%`;
        
        this.gameBoard.appendChild(tile);
        return tile;
    }
    
    // 更新分数显示
    updateScore() {
        this.scoreElement.textContent = this.game.score;
        this.highScoreElement.textContent = this.game.highScore;
        this.finalScoreElement.textContent = this.game.score;
    }
    
    // 处理移动并添加动画效果
    async handleMove(direction) {
        if (this.game.gameOver || (this.game.won && !this.game.keepPlaying)) {
            return;
        }
        
        const previousScore = this.game.score;
        
        // 执行移动并获取移动信息
        let moveInfo;
        switch (direction) {
            case 'left':
                moveInfo = this.game.moveLeft();
                break;
            case 'right':
                moveInfo = this.game.moveRight();
                break;
            case 'up':
                moveInfo = this.game.moveUp();
                break;
            case 'down':
                moveInfo = this.game.moveDown();
                break;
        }
        //console.log(moveInfo)
        const { moved, movedTiles, mergedTiles, newTiles, scoreAdded } = moveInfo;
        
        // 如果有移动，执行动画
        if (moved) {
            // 先移除现有方块（保留用于动画的临时方块）
            const existingTiles = document.querySelectorAll('.tile');
            existingTiles.forEach(tile => tile.remove());
            
            // 执行移动和合并动画
            await this.anim.move(movedTiles, mergedTiles);
			this.drawTiles();
            
            // 添加新方块并执行出现动画
            if (newTiles.length > 0) {
                for (const tile of newTiles) {
                    await this.anim.newTile(tile.x, tile.y, tile.value);
                }
            }
            
            // 更新分数并添加分数动画
            if (scoreAdded > 0) {
                this.animateScoreChange(previousScore, this.game.score);
            } else {
                this.updateScore();
            }
            
            // 检查游戏状态
            if (this.game.checkWin()) {
                this.gameWinElement.style.display = 'flex';
            } else if (this.game.checkGameOver()) {
                this.gameOverElement.style.display = 'flex';
            }
        }
    }
    
    // 分数变化动画
    animateScoreChange(from, to) {
        let current = from;
        const increment = Math.ceil((to - from) / 20); // 分20步完成动画
        const scoreElement = this.scoreElement;
        
        const updateScore = () => {
            current += increment;
            if ((increment > 0 && current >= to) || (increment < 0 && current <= to)) {
                current = to;
                scoreElement.textContent = current;
                this.highScoreElement.textContent = this.game.highScore;
                return;
            }
            
            scoreElement.textContent = current;
            requestAnimationFrame(() => {
                setTimeout(updateScore, 15);
            });
        };
        
        updateScore();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.handleMove('left');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.handleMove('right');
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.handleMove('up');
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.handleMove('down');
                    break;
            }
        });
        
        // 触摸屏滑动控制
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, false);
        
        document.addEventListener('touchend', (event) => {
            if (!touchStartX || !touchStartY) {
                return;
            }
            
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // 确定滑动方向（水平或垂直）
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // 水平滑动
                if (diffX > 0) {
                    this.handleMove('right');
                } else {
                    this.handleMove('left');
                }
            } else {
                // 垂直滑动
                if (diffY > 0) {
                    this.handleMove('down');
                } else {
                    this.handleMove('up');
                }
            }
            
            // 重置
            touchStartX = 0;
            touchStartY = 0;
        }, false);
        
        // 按钮事件
        this.newGameButton.addEventListener('click', () => this.resetGame());
        this.restartButton.addEventListener('click', () => this.resetGame());
        this.continueButton.addEventListener('click', () => {
            this.game.keepPlaying = true;
            this.gameWinElement.style.display = 'none';
        });
        this.newWinGameButton.addEventListener('click', () => this.resetGame());
    }
    
    // 重置游戏
    resetGame() {
        const moveInfo = this.game.restart();
        this.drawTiles();
        this.updateScore();
        this.gameOverElement.style.display = 'none';
        this.gameWinElement.style.display = 'none';
        
        // 为新游戏的初始方块添加动画
        setTimeout(() => {
            const existingTiles = document.querySelectorAll('.tile');
            existingTiles.forEach(tile => tile.remove());
            moveInfo.newTiles.forEach(tile => {
                this.anim.newTile(tile.x, tile.y, tile.value);
            });
        }, 50);
    }
}

importFont('FontAwesome', Assets['fontawesome-webfont.ttf'])
applyCSS(Assets['font-awesome.min.css'])
applyCSS(Assets['style.css'])
document.body.innerHTML = Assets['body.xml']

// 初始化游戏
new GameController()
