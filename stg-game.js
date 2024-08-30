const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define game states
let gameState = 'start';

// Initialize Tone.js sounds
const synth = new Tone.Synth().toDestination();
const melody = new Tone.Sequence(
  (time, note) => {
    synth.triggerAttackRelease(note, '8n', time);
  },
  ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'],
  '4n'
);

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

// Functions to handle game states and music
function startBackgroundMusic() {
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
    melody.start(0);
}

function stopBackgroundMusic() {
    melody.stop();
    Tone.Transport.stop(); // Also stop the transport to ensure it resets correctly
}

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
function spawnBoss() {
    boss = {
        x: canvas.width / 2 - 75,
        y: 50,
        width: 150,
        height: 150,
        health: 50,
        speed: 2
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

            if (player.lives <= 0) {
                resetGame();
            }
        }
    });
}

// Function to update the HUD display
function updateHUD() {
    document.getElementById('lives').textContent = `Lives: ${player.lives}`;
    document.getElementById('points').textContent = `Points: ${player.points}`;
}

// Function to reset the game
function resetGame() {
    player.lives = 3;
    player.points = 0;
    bossActive = false;
    enemyBullets.length = 0;
    boss = null;
    gameState = 'gameOver';
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        drawScreen([{text: 'Press Enter to Start'}]);
        stopBackgroundMusic();
    } else if (gameState === 'playing') {
        updatePlayer();
        drawPlayer();
        drawPlayerBullets();
        drawEnemyBullets();
        checkCollisions();

        if (bossActive) {
            drawBoss();
        }

        updateHUD();
    } else if (gameState === 'paused') {
        drawScreen([
            {text: 'Paused'},
            {text: 'Press Space to Resume', index: 1},
            {text: 'Press Escape to Leave', index: 2}
        ], 'rgba(0, 0, 0, 0.7)');
        stopBackgroundMusic();
    } else if (gameState === 'gameOver') {
        drawScreen([
            {text: 'Game Over'},
            {text: 'Thanks for Playing!', index: 1},
            {text: 'Press Escape to Leave', index: 2}
        ]);
        stopBackgroundMusic();
    }

    if (gameState !== 'gameOver') {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game
document.addEventListener('keydown', function(event) {
    if (gameState === 'start' && event.key === 'Enter') {
        await Tone.start();  // Ensure Tone.js starts from a user action
        gameState = 'playing';
        startBackgroundMusic();
        spawnBoss(); // Start with a boss for testing
    } else if (gameState === 'playing' && event.key === 'Escape') {
        gameState = 'paused';
        stopBackgroundMusic(); // Ensure music stops when pausing
    } else if (gameState === 'paused' && event.key === ' ') {
        gameState = 'playing';
        startBackgroundMusic(); // Restart music when resuming
    } else if (gameState === 'paused' && event.key === 'Escape') {
        gameState = 'gameOver';
    } else if (gameState === 'gameOver' && event.key === 'Escape') {
        gameState = 'start';
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