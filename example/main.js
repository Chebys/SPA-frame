importFont('FontAwesome', Assets['fontawesome-webfont.ttf'])
applyCSS(Assets['font-awesome.min.css'])
applyCSS(Assets['style.css'])
document.body.innerHTML = Assets['body.xml']

// 游戏状态和配置
const gameState = {
	score: 0,
	time: 0,
	lives: 5,
	gameInterval: null,
	balloonInterval: null,
	isPlaying: false,
	balloons: [],
	difficulty: 1,
	maxBalloons: 5
};

// DOM 元素
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const endCard = document.getElementById('end-card');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('final-score');
const finalTimeDisplay = document.getElementById('final-time');
const balloonsContainer = document.getElementById('balloons-container');

// 气球颜色
const balloonColors = [
	'#EF4444', // 红色
	'#3B82F6', // 蓝色
	'#10B981', // 绿色
	'#F59E0B', // 黄色
	'#8B5CF6', // 紫色
	'#EC4899'  // 粉色
];

// 开始游戏
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

function startGame() {
	// 重置游戏状态
	resetGameState();
	
	// 显示游戏界面，隐藏开始界面
	startScreen.style.opacity = '0';
	setTimeout(() => {
		startScreen.style.display = 'none';
		gameScreen.style.display = 'block';
	}, 500);
	
	// 开始游戏循环
	gameState.isPlaying = true;
	gameState.gameInterval = setInterval(updateGame, 1000);
	
	// 开始生成气球
	spawnBalloon();
	gameState.balloonInterval = setInterval(spawnBalloon, 2000);
}

function resetGameState() {
	gameState.score = 0;
	gameState.time = 0;
	gameState.lives = 5;
	gameState.difficulty = 1;
	gameState.balloons = [];
	
	// 清空气球容器
	balloonsContainer.innerHTML = '';
	
	// 更新显示
	scoreDisplay.textContent = '0';
	timeDisplay.textContent = '0';
	livesDisplay.textContent = '5';
}

function updateGame() {
	// 更新游戏时间
	gameState.time++;
	timeDisplay.textContent = gameState.time;
	
	// 每10秒增加难度
	if (gameState.time % 10 === 0) {
		increaseDifficulty();
	}
	
	// 移动所有气球
	moveBalloons();
}

function increaseDifficulty() {
	gameState.difficulty += 0.2;
	
	// 调整气球生成速度
	clearInterval(gameState.balloonInterval);
	const interval = Math.max(500, 2000 - (gameState.difficulty - 1) * 200);
	gameState.balloonInterval = setInterval(spawnBalloon, interval);
}

function spawnBalloon() {
	if (!gameState.isPlaying) return;
	
	// 限制最大气球数量
	if (gameState.balloons.length >= gameState.maxBalloons + Math.floor(gameState.difficulty)) {
		return;
	}
	
	// 创建气球元素
	const balloon = document.createElement('div');
	balloon.classList.add('balloon');
	
	// 随机属性
	const size = Math.floor(Math.random() * 40) + 40; // 40-80px
	const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
	const leftPos = Math.floor(Math.random() * (window.innerWidth - size));
	
	// 设置气球样式
	balloon.style.width = `${size}px`;
	balloon.style.height = `${size}px`;
	balloon.style.backgroundColor = color;
	balloon.style.left = `${leftPos}px`;
	balloon.style.bottom = `-${size}px`;
	
	// 计算得分 (越小的气球得分越高)
	const points = Math.floor(100 / (size / 40));
	
	// 存储气球数据
	const balloonData = {
		element: balloon,
		speed: (Math.random() * 2 + 1) * gameState.difficulty,
		points: points
	};
	
	// 添加点击事件
	balloon.addEventListener('click', () => popBalloon(balloonData));
	
	// 添加到容器和数组
	balloonsContainer.appendChild(balloon);
	gameState.balloons.push(balloonData);
}

function moveBalloons() {
	for (let i = gameState.balloons.length - 1; i >= 0; i--) {
		const balloon = gameState.balloons[i];
		const currentBottom = parseFloat(balloon.element.style.bottom);
		
		// 移动气球
		balloon.element.style.bottom = `${currentBottom + balloon.speed}px`;
		
		// 检查是否飞出屏幕
		if (currentBottom > window.innerHeight) {
			// 移除气球
			removeBalloon(i);
			
			// 减少生命值
			loseLife();
		}
	}
}

function popBalloon(balloonData) {
	if (!gameState.isPlaying) return;
	
	// 找到气球索引
	const index = gameState.balloons.indexOf(balloonData);
	if (index === -1) return;
	
	// 添加爆炸效果
	balloonData.element.classList.add('balloon-popped');
	
	// 增加分数
	gameState.score += balloonData.points;
	scoreDisplay.textContent = gameState.score;
	
	// 播放爆炸音效 (这里只是视觉效果)
	setTimeout(() => {
		removeBalloon(index);
	}, 200);
}

function removeBalloon(index) {
	// 从DOM和数组中移除气球
	if (gameState.balloons[index]) {
		balloonsContainer.removeChild(gameState.balloons[index].element);
		gameState.balloons.splice(index, 1);
	}
}

function loseLife() {
	gameState.lives--;
	livesDisplay.textContent = gameState.lives;
	
	// 检查游戏是否结束
	if (gameState.lives <= 0) {
		endGame();
	}
}

function endGame() {
	// 停止游戏
	gameState.isPlaying = false;
	clearInterval(gameState.gameInterval);
	clearInterval(gameState.balloonInterval);
	
	// 更新结束界面
	finalScoreDisplay.textContent = gameState.score;
	finalTimeDisplay.textContent = `${gameState.time}秒`;
	
	// 显示结束界面
	gameScreen.style.display = 'none';
	endScreen.style.display = 'flex';
	
	// 添加动画效果
	setTimeout(() => {
		endCard.style.transform = 'scale(1)';
		endCard.style.opacity = '1';
	}, 100);
}

function restartGame() {
	// 隐藏结束界面
	endCard.style.transform = 'scale(0.95)';
	endCard.style.opacity = '0';
	
	setTimeout(() => {
		endScreen.style.display = 'none';
		startScreen.style.display = 'flex';
		startScreen.style.opacity = '1';
	}, 300);
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
	// 移除所有气球
	gameState.balloons.forEach(balloon => {
		if (balloon.element) {
			balloonsContainer.removeChild(balloon.element);
		}
	});
	gameState.balloons = [];
});