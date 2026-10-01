// ==========================================
// ÉLÉMENTS DU DOM
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const currentScoreEl = document.getElementById("currentScore");
const highScoreEl = document.getElementById("highScore");

const btnJump = document.getElementById("btnJump");
const btnCrouch = document.getElementById("btnCrouch");

// ==========================================
// VARIABLES DU JEU
// ==========================================
let gameStarted = false;
let gameRunning = false;

let score = 0;
let highScore = Number(localStorage.getItem("trexHighScore")) || 0;
let scoreCounter = 0; // Compteur pour incrémenter le score à intervalle régulier

let speed = 5;
const initialSpeed = 5;
const gravity = 0.75;

let animationFrameId = null;
let legFrame = 0; // Pour animer les jambes du dino

// ==========================================
// DINO & SOL
// ==========================================
const ground = { y: 240 };

const dino = {
    x: 50,
    y: ground.y - 50,
    normalWidth: 44,
    normalHeight: 47,
    crouchWidth: 55,
    crouchHeight: 28,
    width: 44,
    height: 47,
    velocityY: 0,
    jumping: false,
    crouching: false
};

// ==========================================
// OBSTACLES & NUAGES
// ==========================================
let obstacles = [];
let obstacleTimer = 0;

let clouds = [
    { x: 200, y: 50, width: 60 },
    { x: 500, y: 80, width: 80 },
    { x: 800, y: 40, width: 70 }
];

// Initialisation de l'affichage du meilleur score
highScoreEl.textContent = `HI ${String(highScore).padStart(5, '0')}`;

// ==========================================
// DESSIN DU DINO (Pixel Art Animé)
// ==========================================
function drawDino() {
    ctx.fillStyle = "#535353";

    if (dino.crouching && !dino.jumping) {
        // --- Dino Accroupi ---
        // Corps allongé
        ctx.fillRect(dino.x, dino.y + 10, 45, 18);
        // Tête baissée
        ctx.fillRect(dino.x + 35, dino.y, 20, 18);
        // Œil
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(dino.x + 48, dino.y + 4, 3, 3);
        ctx.fillStyle = "#535353";
        // Queue
        ctx.fillRect(dino.x - 8, dino.y + 12, 10, 8);
        // Jambes animées
        if (Math.floor(legFrame / 6) % 2 === 0) {
            ctx.fillRect(dino.x + 10, dino.y + 28, 6, 8);
            ctx.fillRect(dino.x + 30, dino.y + 28, 6, 4);
        } else {
            ctx.fillRect(dino.x + 10, dino.y + 28, 6, 4);
            ctx.fillRect(dino.x + 30, dino.y + 28, 6, 8);
        }
    } else {
        // --- Dino Debout ---
        // Corps
        ctx.fillRect(dino.x + 8, dino.y + 15, 26, 22);
        // Tête
        ctx.fillRect(dino.x + 20, dino.y, 24, 20);
        // Museau
        ctx.fillRect(dino.x + 26, dino.y + 6, 18, 10);
        // Œil
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(dino.x + 36, dino.y + 4, 3, 3);
        ctx.fillStyle = "#535353";
        // Queue
        ctx.fillRect(dino.x, dino.y + 18, 10, 10);
        // Bras
        ctx.fillRect(dino.x + 28, dino.y + 22, 6, 4);

        // Jambes
        if (dino.jumping) {
            ctx.fillRect(dino.x + 12, dino.y + 37, 6, 10);
            ctx.fillRect(dino.x + 24, dino.y + 37, 6, 10);
        } else {
            if (Math.floor(legFrame / 6) % 2 === 0) {
                ctx.fillRect(dino.x + 12, dino.y + 37, 6, 10);
                ctx.fillRect(dino.x + 24, dino.y + 37, 6, 5);
            } else {
                ctx.fillRect(dino.x + 12, dino.y + 37, 6, 5);
                ctx.fillRect(dino.x + 24, dino.y + 37, 6, 10);
            }
        }
    }
}

// ==========================================
// DESSIN DES OBSTACLES (Cactus)
// ==========================================
function drawCactus(obstacle) {
    ctx.fillStyle = "#535353";

    // Tronc principal
    ctx.fillRect(obstacle.x + 6, obstacle.y, obstacle.width - 12, obstacle.height);

    // Branche Gauche
    ctx.fillRect(obstacle.x, obstacle.y + 12, 6, 12);
    ctx.fillRect(obstacle.x, obstacle.y + 20, 10, 4);

    // Branche Droite
    ctx.fillRect(obstacle.x + obstacle.width - 6, obstacle.y + 8, 6, 14);
    ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + 18, 10, 4);
}

// ==========================================
// DESSIN DES NUAGES
// ==========================================
function drawCloud(cloud) {
    ctx.fillStyle = "#d3d3d3";
    ctx.fillRect(cloud.x, cloud.y + 6, cloud.width, 10);
    ctx.fillRect(cloud.x + 10, cloud.y, cloud.width - 20, 18);
}

// ==========================================
// LOGIQUE DE COLLISION & MISE À JOUR
// ==========================================
function createObstacle() {
    const height = 35 + Math.floor(Math.random() * 20);
    obstacles.push({
        x: canvas.width,
        y: ground.y - height,
        width: 26,
        height: height
    });
}

function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateDino() {
    if (dino.crouching && !dino.jumping) {
        dino.width = dino.crouchWidth;
        dino.height = dino.crouchHeight;
        dino.y = ground.y - dino.crouchHeight;
    } else {
        dino.width = dino.normalWidth;
        dino.height = dino.normalHeight;
    }

    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    const currentGroundY = ground.y - dino.height;
    if (dino.y >= currentGroundY) {
        dino.y = currentGroundY;
        dino.velocityY = 0;
        dino.jumping = false;
    }

    legFrame++;
}

function updateObstacles() {
    obstacleTimer++;
    const minGap = Math.max(50, 110 - speed * 3);

    if (obstacleTimer > minGap + Math.random() * 60) {
        createObstacle();
        obstacleTimer = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function updateClouds() {
    for (const cloud of clouds) {
        cloud.x -= speed * 0.2;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + Math.random() * 150;
            cloud.y = 30 + Math.random() * 60;
        }
    }
}

// ==========================================
// AFFICHAGE & RENDU DU JEU
// ==========================================
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nuages
    for (const cloud of clouds) drawCloud(cloud);

    // Sol (Ligne pointillée style Chrome)
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ground.y);
    ctx.lineTo(canvas.width, ground.y);
    ctx.stroke();

    // Dino & Obstacles
    drawDino();
    for (const obstacle of obstacles) drawCactus(obstacle);
}

// ==========================================
// BOUCLE PRINCIPALE (Game Loop)
// ==========================================
function gameLoop() {
    if (!gameRunning) return;

    updateDino();
    updateObstacles();
    updateClouds();

    // Vérification des collisions
    for (const obstacle of obstacles) {
        if (checkCollision(dino, obstacle)) {
            endGame();
            return;
        }
    }

    // Gestion du score et de la vitesse
    scoreCounter++;
    if (scoreCounter % 5 === 0) {
        score++;
        currentScoreEl.textContent = String(score).padStart(5, '0');
        
        // Augmentation progressive de la vitesse tous les 100 points
        if (score % 100 === 0 && speed < 13) {
            speed += 0.5;
        }
    }

    drawGame();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// ==========================================
// CONTRÔLES (Clavier & Tactile)
// ==========================================
function jump() {
    if (!gameStarted) {
        startGame();
        return;
    }

    if (!gameRunning) {
        restartGame();
        return;
    }

    if (!dino.jumping && !dino.crouching) {
        dino.velocityY = -13.5;
        dino.jumping = true;
    }
}

function setCrouch(state) {
    if (gameRunning && !dino.jumping) {
        dino.crouching = state;
    }
}

// Événements Clavier
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
    } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setCrouch(true);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowDown") {
        setCrouch(false);
    }
});

// Événements Tactiles (Mobile) & Souris
canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    jump();
});

if (btnJump) {
    btnJump.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        jump();
    });
}

if (btnCrouch) {
    btnCrouch.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        setCrouch(true);
    });
    btnCrouch.addEventListener("pointerup", (e) => {
        e.preventDefault();
        setCrouch(false);
    });
}

if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        restartGame();
    });
}

// ==========================================
// DÉMARRAGE ET GAME OVER
// ==========================================
function startGame() {
    gameStarted = true;
    gameRunning = true;
    startScreen.classList.remove("active");
    startScreen.classList.add("hidden");
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("trexHighScore", highScore);
        highScoreEl.textContent = `HI ${String(highScore).padStart(5, '0')}`;
    }

    gameOverScreen.classList.remove("hidden");
    gameOverScreen.classList.add("active");
}

function restartGame() {
    score = 0;
    scoreCounter = 0;
    speed = initialSpeed;
    obstacles = [];
    obstacleTimer = 0;

    dino.y = ground.y - dino.normalHeight;
    dino.velocityY = 0;
    dino.jumping = false;
    dino.crouching = false;

    currentScoreEl.textContent = "00000";

    gameOverScreen.classList.remove("active");
    gameOverScreen.classList.add("hidden");

    gameRunning = true;
    gameLoop();
}

// Premier rendu visuel à l'arrêt
drawGame(); 
