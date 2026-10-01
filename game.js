```javascript
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");

// ==============================
// GAME VARIABLES
// ==============================

let gameRunning = true;

let score = 0;
let highScore = Number(localStorage.getItem("trexHighScore")) || 0;

let speed = 6;
let gravity = 0.8;

// ==============================
// DINO
// ==============================

const dino = {
    x: 80,
    y: 220,

    width: 40,
    height: 50,

    velocityY: 0,

    jumping: false
};

// ==============================
// GROUND
// ==============================

const ground = {
    y: 270
};

// ==============================
// OBSTACLES
// ==============================

let obstacles = [];

let obstacleTimer = 0;

// ==============================
// CLOUDS
// ==============================

let clouds = [
    { x: 300, y: 60, width: 70 },
    { x: 600, y: 100, width: 90 },
    { x: 800, y: 50, width: 60 }
];

// ==============================
// DRAW DINO
// ==============================

function drawDino() {

    ctx.fillStyle = "#333";

    // Body
    ctx.fillRect(
        dino.x,
        dino.y + 15,
        30,
        30
    );

    // Head
    ctx.fillRect(
        dino.x + 20,
        dino.y,
        30,
        25
    );

    // Eye
    ctx.fillStyle = "white";

    ctx.fillRect(
        dino.x + 40,
        dino.y + 5,
        4,
        4
    );

    // Legs
    ctx.fillStyle = "#333";

    ctx.fillRect(
        dino.x + 5,
        dino.y + 42,
        7,
        10
    );

    ctx.fillRect(
        dino.x + 20,
        dino.y + 42,
        7,
        10
    );

    // Tail
    ctx.fillRect(
        dino.x - 10,
        dino.y + 20,
        15,
        8
    );
}

// ==============================
// DRAW CACTUS
// ==============================

function drawCactus(obstacle) {

    ctx.fillStyle = "#333";

    // Main stem
    ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
    );

    // Left branch
    ctx.fillRect(
        obstacle.x - 8,
        obstacle.y + 15,
        8,
        8
    );

    ctx.fillRect(
        obstacle.x - 8,
        obstacle.y + 8,
        8,
        15
    );

    // Right branch
    ctx.fillRect(
        obstacle.x + obstacle.width,
        obstacle.y + 20,
        8,
        8
    );

    ctx.fillRect(
        obstacle.x + obstacle.width,
        obstacle.y + 10,
        8,
        18
    );
}

// ==============================
// DRAW CLOUD
// ==============================

function drawCloud(cloud) {

    ctx.fillStyle = "#ddd";

    ctx.beginPath();

    ctx.arc(
        cloud.x,
        cloud.y,
        20,
        0,
        Math.PI * 2
    );

    ctx.arc(
        cloud.x + 25,
        cloud.y - 10,
        25,
        0,
        Math.PI * 2
    );

    ctx.arc(
        cloud.x + 50,
        cloud.y,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

// ==============================
// CREATE OBSTACLE
// ==============================

function createObstacle() {

    const height = 40 + Math.random() * 25;

    obstacles.push({

        x: canvas.width,

        y: ground.y - height,

        width: 25,

        height: height
    });
}

// ==============================
// COLLISION
// ==============================

function checkCollision(dino, obstacle) {

    return (

        dino.x < obstacle.x + obstacle.width &&

        dino.x + dino.width > obstacle.x &&

        dino.y < obstacle.y + obstacle.height &&

        dino.y + dino.height > obstacle.y

    );
}

// ==============================
// UPDATE DINO
// ==============================

function updateDino() {

    dino.velocityY += gravity;

    dino.y += dino.velocityY;

    if (dino.y + dino.height >= ground.y) {

        dino.y = ground.y - dino.height;

        dino.velocityY = 0;

        dino.jumping = false;
    }
}

// ==============================
// UPDATE OBSTACLES
// ==============================

function updateObstacles() {

    obstacleTimer++;

    if (obstacleTimer > 80 + Math.random() * 80) {

        createObstacle();

        obstacleTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {

        obstacles[i].x -= speed;

        if (obstacles[i].x + obstacles[i].width < 0) {

            obstacles.splice(i, 1);

            score++;
        }
    }
}

// ==============================
// UPDATE CLOUDS
// ==============================

function updateClouds() {

    for (const cloud of clouds) {

        cloud.x -= speed * 0.2;

        if (cloud.x < -100) {

            cloud.x = canvas.width + Math.random() * 200;
        }
    }
}

// ==============================
// CHECK COLLISIONS
// ==============================

function checkCollisions() {

    for (const obstacle of obstacles) {

        if (checkCollision(dino, obstacle)) {

            endGame();
        }
    }
}

// ==============================
// DRAW GAME
// ==============================

function drawGame() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Sky

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Clouds

    for (const cloud of clouds) {

        drawCloud(cloud);
    }

    // Ground

    ctx.strokeStyle = "#333";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        0,
        ground.y
    );

    ctx.lineTo(
        canvas.width,
        ground.y
    );

    ctx.stroke();

    // Dino

    drawDino();

    // Obstacles

    for (const obstacle of obstacles) {

        drawCactus(obstacle);
    }

    // Score

    ctx.fillStyle = "#333";

    ctx.font = "20px Arial";

    ctx.fillText(
        "SCORE: " + score,
        20,
        30
    );

    ctx.fillText(
        "BEST: " + highScore,
        20,
        55
    );
}

// ==============================
// GAME LOOP
// ==============================

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    updateDino();

    updateObstacles();

    updateClouds();

    checkCollisions();

    drawGame();

    // Increase difficulty

    if (score > 0 && score % 10 === 0) {

        speed = Math.min(
            14,
            6 + Math.floor(score / 10)
        );
    }

    requestAnimationFrame(gameLoop);
}

// ==============================
// JUMP
// ==============================

function jump() {

    if (!gameRunning) {
        restartGame();
        return;
    }

    if (!dino.jumping) {

        dino.velocityY = -15;

        dino.jumping = true;
    }
}

// ==============================
// KEYBOARD
// ==============================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.code === "Space") {

            event.preventDefault();

            jump();
        }
    }
);

// ==============================
// GAME OVER
// ==============================

function endGame() {

    gameRunning = false;

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "trexHighScore",
            highScore
        );
    }

    gameOverScreen.style.display = "flex";
}

// ==============================
// RESTART
// ==============================

function restartGame() {

    score = 0;

    speed = 6;

    obstacles = [];

    obstacleTimer = 0;

    dino.y = ground.y - dino.height;

    dino.velocityY = 0;

    dino.jumping = false;

    gameRunning = true;

    gameOverScreen.style.display = "none";

    gameLoop();
}

// ==============================
// START
// ==============================

gameLoop();
```
