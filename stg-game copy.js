const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define game states
let gameState = 'start';
let currentLevel = 1;
const totalLevels = 13;
let animationFrameId;
let godtime = false;

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 10,
    height: 10,
    speed: 5,
    slowSpeed: 2,
    bullets: [],
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    isSlow: false,
    canShoot: true,
    lives: 3,
    points: 0,
    shoot: function() {
        this.bullets.push({ x: this.x + this.width / 2 - 2.5, y: this.y, width: 5, height: 10 });
    }
};

const explosions = [];

function createExplosion(x, y, size, maxSize) {
    explosions.push({
        x: x,
        y: y,
        size: size,
        maxSize: maxSize,
        duration: 30, // Number of frames the explosion will last
        opacity: 1.0
    });
}

// Boss variables
let bossActive = false;
let boss = null;
const enemyBullets = [];


//music
JZZ.synth.Tiny.register('Web Audio');
var out = JZZ().openMidiOut();
var smf = new JZZ.MIDI.SMF(op13());
var player2 = new JZZ.gui.Player({at: 'player', midi: false, loop: false});
let playing = false;
player2.connect(out);
player2.onEnd = function() { playing = false; };

const instruments = [8, 10, 16, 87, 44, 113, 112, 74, 107, 46, 39, 47, 85];

function startMusic(n = 1) {
    playing = true;
    player2.stop();
    player2.load(smf);
    player2.play();
    setTimeout(() => {out.program(0, instruments[n-1]);}, 1500); 
}

function op13() { return JZZ.lib.fromBase64('\
TVRoZAAAAAYAAAABAYBNVHJrAAAIsgD/WAQEAhgIAP9RAwjNmwD/AwlNdXNpYyBCb3gAwAqMYJBCMmCAQgBgkEcyYIBHAGCQSTJggEkAYJBKMgCQLzKBQIAvAACQMjKBQIAyAACQNjKBQIA2AACASgAAkEwyAJA7MoFAgDsAAIBMAACQSTIAkC8ygUCALwAAkDQygUCANAAAkDYygUCANgAAgEkAAJBKMgCQOjKBQIA6AACASgAAkEcyAJAvMoFAgC8AAJAyMoFAgDIAAJA2MoFAgDYAAJA7MoEQkEkyMIA7AACARwAAkEcyAJA+MjCASQCBEIA+AACARwAAkEYyAJBCMoFAgEIAAIBGAACQRzIAkD4ygUCAPgAAgEcAAJBJMgCQPTKBEJBMMjCAPQAAgEkAAJBKMgCQOzIwgEwAgRCAOwAAgEoAAJBJMgCQQjKBQIBCAACASQAAkEoyAJA+MgCQOzKBQIA7AACAPgAAgEoAAJBMMgCQQjKBQIBCAACATAAAkE4yAJA9MgCQOjKBQIA6AACAPQAAgE4AAJBCMoFAgEIAAJBOMgCQNzIAkDsygUCAOwAAgDcAAIBOAACQQjKBQIBCAACQTjIAkDYygUCANgAAkDoygUCAOgAAkD0ygUCAPQAAkEIygUCAQgAAkDYygUCANgAAkDoygUCAOgAAgE4AAJBMMgCQPTKBQIA9AACATAAAkE4yAJBCMmCATgAAkEwyMJBOMjCATAAAgEIAAJBPMgCQNDIwgE4AgRCANAAAkDcygUCANwAAkDoygUCAOgAAkD0ygUCAPQAAgE8AAJBJMgCQNDKBQIA0AACQNzKBQIA3AACASQAAkEoyAJA6MoFAgDoAAIBKAACQTDIAkD0yYIBMAACQSjIwkEwyMIBKAACAPQAAkE4yAJAyMjCATACBEIAyAACQNjKBQIA2AACQOzKBQIA7AACQPjKBQIA+AACATgAAkEcyAJA3MoFAgDcAAJA7MoFAgDsAAIBHAACQRzIAkD4ygUCAPgAA\
gEcAAJBJMgCQQTKBQIBBAACASQAAkEoyAJA2MoFAgDYAAIBKAACQOzKBQIA7AACQSjIAkD4ygUCAPgAAgEoAAJBMMgCQQjKBQIBCAACATAAAkEkyAJA2MoFAgDYAAIBJAACQOjKBQIA6AACQSTIAkD0ygUCAPQAAgEkAAJBKMgCQQjKBQIBCAACASgAAkEcygUCQLzKBQIAvAACARwAAkDIygUCAMgAAkDYygUCANgAAkDsygwCAOwAAkEwygUCATAAAkE4ygUCATgAAkE8yAJBDMoFAkCgygUCAKAAAkC4ygUCALgAAkDEygUCAMQAAgEMAAIBPAACQSTIAkDQygUCANAAAkDcygUCANwAAgEkAAJBKMgCQNjKBQIA2AACASgAAkEwyAJA0MoFAgDQAAIBMAACQTjIAkEIygUCQJjKBQIAmAACQKjKBQIAqAACQLzKBQIAvAACAQgAAgE4AAJBHMgCQMjKBQIAyAACQNjKBQIA2AACARwAAkEcyAJA3MoFAgDcAAIBHAACQSTIAkDUygUCANQAAgEkAAJBKMgCQKjKBQIAqAACASgAAkDYygUCANgAAkEoyAJA7MoFAgDsAAIBKAACQTDIAkDYygUCANgAAgEwAAJBJMgCQKjKBQIAqAACASQAAkDYygUCANgAAkEkyAJA6MoFAgDoAAIBJAACQSjIAkDYygUCANgAAgEoAAJBHMgCQLzKBQIAvAACARwAAkDsygUCAOwAAkFEyAJA6MoFAgDoAAJA7MoFAgDsAAJAzMoFAgDMAAJA7MoFAgDsAAIBRAACQUTIAkDYygUCANgAAkDsygUCAOwAAkDQygUCANAAAgFEAAJBPMgCQOzKBQIA7AACATwAAkE4yAJA3MoFAgDcAAIBOAACQTDIAkDsygUCAOwAAgEwAAJBKMgCQNjKBQIA2AACASgAAkEkyAJBAMoFAgEAAAIBJAACQRzIAkDoygUCAOgAAgEcAAJBGMgCQQDKBQIBAAACARgAAkEcyAJA3MoFAgDcA\
AIBHAACQPjKBQIA+AACQUzIAkEcyAJA7MoFAgDsAAJA+MoFAgD4AAJA2MoFAgDYAAJA/MoFAgD8AAIBHAACAUwAAkFEyAJA7MoFAgDsAAJA/MoFAgD8AAJA0MoFAgDQAAIBRAACQTzIAkEAygUCAQAAAgE8AAJBOMgCQOzKBQIA7AACATgAAkEwyAJBAMoFAgEAAAIBMAACQSjIAkDYygUCANgAAgEoAAJBJMgCQQjKBQIBCAACASQAAkEcyAJA2MoFAgDYAAIBHAACQRjIAkEIygUCAQgAAgEYAAJBHMgCQOzKBQIA7AACARwCGYJBCMoFAgEIAAJBEMoFAgEQAAJBGMgCQPTIAkDYyhECARgAAkEcygUCARwAAgD0AAJBEMgCQOzKEQIBEAACQRjKBQIBGAACAOwAAgDYAAJBCMgCQOjIAkDYygwCANgAAgDoAAIBCAIYAkE4ygUCATgAAkFAygUCAUAAAkFIyAJBJMgCQQjKEQIBSAACQUzKBQIBTAACASQAAkFAyAJBHMoRAgFAAAJBSMoFAgFIAAIBHAACAQgAAkE4yAJBGMgCQQjKDAIBCAACARgAAgE4AhSCQSDKDAIBIAACQSzIAkE4yAJBEMoMAgEQAAIBOAACASwCGAJBIMoMAgEgAAJBLMgCQTzIAkEMygwCAQwAAgE8AAIBLAIYAkFcyYIBXACCQVjJggFYAIZBUMmCAVAAgkFkyAJA3MgCQKzIAkC8yAJAyMmCAWQAgkFcyYIBXACGQVjJggFYAIIAyAACALwAAgCsAAIA3AACQVDJggFQAIJBTMmCAUwAhkFAyYIBQACCQTzJggE8AIJBNMmCATQAhkEsyYIBLACCQSjJggEoAIJBIMmCASAAhkEcyYIBHACCQSDIAkDAyAJAkMgCQJzIAkCsygwCAKwAAgCcAAIAkAACAMAAAgEgAAP8vAA==\
')};

function fromBase64() {
  clear();
  load(JZZ.lib.fromBase64(data), 'Base64 data');
}

// Function to draw the player
function drawPlayer() {
    if (godtime) {
        ctx.globalAlpha = 0.5; // Make the player semi-transparent during godtime
    } else {
        ctx.globalAlpha = 1; // Full opacity when not in godtime
    }
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    if (player.isSlow) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

// Function to draw player bullets
function drawPlayerBullets() {
    ctx.fillStyle = 'red';
    player.bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= 7; // Move bullet up

        // Remove bullets that go off screen
        if (bullet.y < 0) {
            player.bullets.splice(index, 1);
        }
    });
}

// Function to draw enemy bullets
function drawEnemyBullets() {
    ctx.fillStyle = 'yellow';
    enemyBullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bullets that go off screen
        if (bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
            enemyBullets.splice(index, 1);
        }
    });
}

// Player movement and shooting
function updatePlayer() {
    const speed = player.isSlow ? player.slowSpeed : player.speed;

    if (player.moveLeft && player.x > 0) player.x -= speed;
    if (player.moveRight && player.x < canvas.width - player.width) player.x += speed;
    if (player.moveUp && player.y > 0) player.y -= speed;
    if (player.moveDown && player.y < canvas.height - player.height) player.y += speed;

    if (player.canShoot) {
        player.shoot();
        player.canShoot = false;
        setTimeout(() => player.canShoot = true, 300);
    }
}

// Consolidated function to draw different game screens
function drawScreen(textLines, bgColor = 'black', textColor = 'white') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    
    textLines.forEach((line, index) => {
        ctx.fillText(line.text, canvas.width / 2, canvas.height / 2 + index * 40);
    });
}

let bossHitFlash = false;
let bossHitTimer = 0;

function drawBoss() {
    if (boss) {
        // Flashing logic
        if (bossHitFlash) {
            ctx.fillStyle = 'lightgray'; // Flash white when hit
            bossHitTimer--;
            if (bossHitTimer <= 0) {
                bossHitFlash = false; // Stop flashing after some time
            }
        } else {
            ctx.fillStyle = 'purple'; // Default boss color
        }

        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        boss.x += boss.speed;

        if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
            boss.speed = -boss.speed;
        }

        if (Math.random() < 0.1) {
            shootBossBullets(boss);
        }
    }
}

// Function to handle boss behavior
function spawnBoss(level) {
    // Bosses get progressively harder with each level
    boss = {
        x: canvas.width / 2 - 75,
        y: 50,
        width: 150,
        height: 150,
        health: 20,//50 + (level - 1) * 10,  // Increase health by 10 for each level
        speed: 1,// Increase speed slightly each level
    };
    bossActive = true;
}

// Function to shoot boss bullets
function shootBossBullets(boss) {
    if (boss.health > 10) {
        generateBulletsPattern(boss, 3, 24, linePattern);
    } else if (boss.health > 5) {
        generateBulletsPattern(boss, 3, 24, fanPattern);
    }
    else {
        generateBulletsPattern(boss, 3, 12, circlePattern);
    }
}

function generateBulletsPattern(boss, bulletSpeed, bulletCount, patternFunction) {
    for (let i = 0; i < bulletCount; i++) {
        const { dx, dy } = patternFunction(i, bulletCount, boss, player); // Include player position
        enemyBullets.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            width: 5,
            height: 5,
            dx: dx * bulletSpeed,
            dy: dy * bulletSpeed
        });
    }
}

function circularPattern(i, bulletCount) {
    const angle = (Math.PI * 2 / bulletCount) * i;
    return {
        dx: Math.cos(angle),
        dy: Math.sin(angle)
    };
}

function spiralPattern(i, bulletCount) {
    const angle = (Math.PI * 2 / bulletCount) * i + (Date.now() % 1000) / 1000; // slowly rotate over time
    return {
        dx: Math.cos(angle),
        dy: Math.sin(angle)
    };
}

function wavePattern(i, bulletCount) {
    return {
        dx: Math.sin(i / bulletCount * Math.PI * 2), // Creates a wave along the x-axis
        dy: 1
    };
}

function linePattern(i, bulletCount, boss, player) {
    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x); // Angle toward player
    return {
        dx: Math.cos(angleToPlayer),
        dy: Math.sin(angleToPlayer)
    };
}

function circlePattern(i, bulletCount, boss, player) {
    const angle = (Math.PI * 2 / bulletCount) * i;
    return {
        dx: Math.cos(angle),
        dy: Math.sin(angle)
    };
}

function fanPattern(i, bulletCount, boss, player) {
    const fanAngle = Math.PI / 4; // The total angle of the fan (45 degrees)
    const baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x); // Base angle toward player
    const angle = baseAngle - fanAngle / 2 + (fanAngle / (bulletCount - 1)) * i; // Spread bullets
    return {
        dx: Math.cos(angle),
        dy: Math.sin(angle)
    };
}

function trianglePattern(i, bulletCount, boss, player) {
    const baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
    const offset = 0.3; // Spread out the bullets to form a triangle
    return {
        dx: Math.cos(baseAngle + (i % 2 === 0 ? offset : -offset)), // Alternate sides
        dy: Math.sin(baseAngle + (i % 2 === 0 ? offset : -offset))
    };
}

function drawExplosions() {
    explosions.forEach((explosion, index) => {
        ctx.save();
        ctx.globalAlpha = explosion.opacity;
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (explosion.size < explosion.maxSize) {
            explosion.size += 1;
        }
        explosion.opacity -= 0.03;

        // Remove explosion when it finishes
        if (explosion.opacity <= 0) {
            explosions.splice(index, 1);
        }
    });
}

// Collision detection and game over logic
function checkCollisions() {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const hitboxRadius = 3;

    // Check collision between player bullets and boss
    player.bullets.forEach((bullet, bulletIndex) => {
        if (boss) {
            if (
                bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y
            ) {
                boss.health--;
                player.bullets.splice(bulletIndex, 1);
                player.points += 500;

                createExplosion(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 5, 10);

                bossHitFlash = true;
                bossHitTimer = 5; // Duration of the flash

                if (boss.health <= 0) {
                    boss = null;
                    bossActive = false;
                    player.points += 1000;
                    advanceLevel();
                }
            }
        }
    });

    // Check collision between enemy bullets and player
    enemyBullets.forEach((bullet, bulletIndex) => {
        const distX = bullet.x + bullet.width / 2 - playerCenterX;
        const distY = bullet.y + bullet.height / 2 - playerCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < hitboxRadius && !godtime) {
            player.lives -= 1;
            enemyBullets.splice(bulletIndex, 1);
            console.log('Player hit! Lives remaining:', player.lives);

            createExplosion(player.x + player.width / 2, player.y + player.height / 2, 10, 30);

            if (player.lives < 0) {
                resetGame();
            }

            setTimeout(() => {
                godtime = false;
            }, 1000);
            godtime = true;
        }
    });
}

function updateHUD() {
    document.getElementById('lives').textContent = `Lives: ${player.lives}`;
    document.getElementById('points').textContent = `Points: ${player.points}`;
    document.getElementById('level').textContent = `Level: ${currentLevel}`; // Update level display
}

// Function to advance to the next level
function advanceLevel() {
    if (currentLevel < totalLevels) {
        currentLevel++;
        initializeGame(true); // Reset level with player and boss position reset
        spawnBoss(currentLevel); // Spawn a new boss for the next level
    } else {
        gameState = 'gameOver';
        drawScreen([{ text: 'You Win!' }, { text: 'Thanks for Playing!' }, { text: 'Press Enter to Restart' }]);
    }
}

// Function to reset the game
function resetGame() {
    gameState = 'gameOver';  // Set game state to 'gameOver'
    // initializeGame();  // Reset game elements
    drawScreen([
        {text: 'Game Over'},
        {text: 'Thanks for Playing!'},
        {text: 'Press Enter to Restart'}
    ]);  // Display game over screen
}

// Function to initialize the game
function initializeGame(resetLevel = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset player position and stats
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 60;
    player.lives = resetLevel ? player.lives : 3; // Reset lives only if not advancing a level
    player.points = resetLevel ? player.points : 0; // Retain points if advancing a level
    player.bullets = [];
    player.moveLeft = false;
    player.moveRight = false;
    player.moveUp = false;
    player.moveDown = false;
    player.isSlow = false;
    player.canShoot = true;
    playing = false;
    
    // Reset boss and enemy bullets
    bossActive = false;
    boss = null;
    enemyBullets.length = 0;

    // Reset or advance level
    if (!resetLevel) {
        currentLevel = 1;
        gameState = 'start';
    } else {
        gameState = 'levelComplete';
    }
}

function drawElevatorPanel() {
    const buttonSize = 40; // 按钮的大小
    const spacing = 10; // 按钮之间的间距

    // 计算中心位置
    const panelWidth = 3 * buttonSize + 2 * spacing; // 面板的总宽度（三列按钮）
    const panelHeight = 6 * buttonSize + 5 * spacing; // 按钮的总高度（6行按钮）
    const panelX = (canvas.width - panelWidth) / 2; // 面板x轴的起点（居中）
    const panelY = (canvas.height - panelHeight) / 2; // 面板y轴的起点（居中）

    ctx.globalAlpha = 0.4; // 重置透明度

    // 绘制背景面板
    ctx.fillStyle = '#464547'; // 面板颜色
    ctx.globalAlpha = 0.3; // 透明度
    ctx.fillRect(panelX - 10, panelY - 20, panelWidth + 20, panelHeight + 40);

    // 按钮排列
    const columns = [
        [1, 2, 3, 4, 5, 6], // 第一列：1到6
        [13,13,13,13,13,13],               // 第二列：13
        [7, 8, 9, 10, 11, 12] // 第三列：7到12
    ];

    // 绘制每个按钮
    columns.forEach((column, colIndex) => {
        column.forEach((floor, rowIndex) => {
            // 计算按钮的位置
            const buttonX = panelX + colIndex * (buttonSize + spacing);
            const buttonY = panelY + rowIndex * (buttonSize + spacing);
            
            // 绘制按钮
            ctx.fillStyle = '#555'; // 默认按钮颜色
            if (floor === currentLevel) {
                ctx.fillStyle = '#aa2116'; // 高亮当前关卡按钮
            }
            ctx.beginPath();
            ctx.arc(buttonX + buttonSize / 2, buttonY + buttonSize / 2, buttonSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // 绘制楼层数字
            ctx.fillStyle = '#fff'; // 数字颜色
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(floor, buttonX + buttonSize / 2, buttonY + buttonSize / 2);
        });
    });
    ctx.globalAlpha = 1; // 重置透明度
}

function startGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Cancel the previous animation frame
    }
    animationFrameId = requestAnimationFrame(gameLoop); // Start a new game loop
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawElevatorPanel();
    if (!playing) {
        startMusic(currentLevel);
    }

    if (gameState === 'start') {
        drawScreen([{ text: 'Press Enter to Start' }]);
    } else if (gameState === 'playing') {
        updatePlayer();
        drawPlayerBullets();
        drawPlayer();
        if (bossActive) {
            drawBoss();
        }
        drawEnemyBullets();
        checkCollisions();
        drawExplosions();

        updateHUD();
    } else if (gameState === 'paused') {
        drawScreen([
            { text: 'Paused' },
            { text: 'Press Space to Resume' },
            { text: 'Press Escape to Leave' }
        ], 'rgba(0, 0, 0, 0.7)');
    } else if (gameState === 'levelComplete') { // New state for level complete
        drawScreen([{ text: `Level ${currentLevel - 1} Complete!` }, { text: 'Press Enter to Continue' }]);
        playing = false;
    } else if (gameState === 'gameOver') {
        resetGame();
        playing = false;
    }

    if (gameState !== 'gameOver') {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Initialize game
initializeGame();

// Event listeners for starting, pausing, and restarting the game
document.addEventListener('keydown', function(event) {
    if (gameState === 'start' && event.key === 'Enter') {
        gameState = 'playing';
        spawnBoss(currentLevel); // Start with the first boss
    } else if (gameState === 'playing' && event.key === 'Escape') {
        gameState = 'paused';
    } else if (gameState === 'paused' && event.key === ' ') {
        gameState = 'playing';
    } else if (gameState === 'paused' && event.key === 'Escape') {
        gameState = 'gameOver';
    } else if (gameState === 'gameOver' && event.key === 'Enter') {
        initializeGame();
        startGameLoop();
    } else if (gameState === 'levelComplete' && event.key === 'Enter') { // New condition for 'levelComplete'
        gameState = 'playing';
        spawnBoss(currentLevel);
        startGameLoop();
    }
});

// Event listeners for player movement and shooting
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') player.moveLeft = true;
    if (event.key === 'ArrowRight') player.moveRight = true;
    if (event.key === 'ArrowUp') player.moveUp = true;
    if (event.key === 'ArrowDown') player.moveDown = true;
    if (event.key === 'Shift') player.isSlow = true;
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowLeft') player.moveLeft = false;
    if (event.key === 'ArrowRight') player.moveRight = false;
    if (event.key === 'ArrowUp') player.moveUp = false;
    if (event.key === 'ArrowDown') player.moveDown = false;
    if (event.key === 'Shift') player.isSlow = false;
});

gameLoop();