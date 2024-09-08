const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define game states
let gameState = 'start';
let currentLevel = 1;
const totalLevels = 13;
let animationFrameId;

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

// Boss variables
let bossActive = false;
let boss = null;
const enemyBullets = [];

// Function to draw the player
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    if (player.isSlow) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
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
        bullet.x += bullet.dx; // Move bullet along x-axis
        bullet.y += bullet.dy; // Move bullet along y-axis
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

// Function to draw boss
function drawBoss() {
    if (boss) {
        ctx.fillStyle = 'purple';
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
        health: 10,//50 + (level - 1) * 10,  // Increase health by 10 for each level
        speed: 1,// Increase speed slightly each level
    };
    bossActive = true;
}

// Function to shoot boss bullets
function shootBossBullets(boss) {
    const bulletSpeed = 3;
    const bulletCount = 24;
    for (let i = 0; i < bulletCount; i++) {
        const angle = (Math.PI * 2 / bulletCount) * i;
        const dx = Math.cos(angle) * bulletSpeed;
        const dy = Math.sin(angle) * bulletSpeed;
        enemyBullets.push({ x: boss.x + boss.width / 2, y: boss.y + boss.height / 2, width: 5, height: 5, dx, dy });
    }
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

        if (distance < hitboxRadius) {
            player.lives -= 1;
            enemyBullets.splice(bulletIndex, 1);

            if (player.lives < 0) {
                resetGame();
            }
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
    console.log('Game Over2');
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

function startGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Cancel the previous animation frame
    }
    animationFrameId = requestAnimationFrame(gameLoop); // Start a new game loop
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        

        updateHUD();
    } else if (gameState === 'paused') {
        drawScreen([
            { text: 'Paused' },
            { text: 'Press Space to Resume' },
            { text: 'Press Escape to Leave' }
        ], 'rgba(0, 0, 0, 0.7)');
    } else if (gameState === 'levelComplete') { // New state for level complete
        drawScreen([{ text: `Level ${currentLevel - 1} Complete!` }, { text: 'Press Enter to Continue' }]);
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

//music
JZZ.synth.Tiny.register('Web Audio');
var out = JZZ().openMidiOut();
var smf = new JZZ.MIDI.SMF(op13());
var player2 = new JZZ.gui.Player({ x: 200, y: 200, close: true });

// Define some instrument changes (Program Change messages)
// 0 is Piano, 40 is Violin, 56 is Trumpet, 32 is Acoustic Bass, etc.
const instruments = {
    piano: 17,
    violin: 47,
    trumpet: 56,
    bass: 32
};

function startMusic() {
    // Load and initialize the MIDI file
    player2.load(smf);
    player2.loop(true);
    player2.play();
    setTimeout(() => {
        out.program(0,7);  // Set default instrument to Piano after delay
    }, 1000);  // 100 ms delay to ensure the player has started
}

function op13() { return JZZ.lib.fromBase64('\
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\
')};

function fromBase64() {
  clear();
  load(JZZ.lib.fromBase64(data), 'Base64 data');
}

startMusic();

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