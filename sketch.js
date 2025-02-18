let player_x = 200,
    player_y = 380;
let player_size = 20;
let speed = 3;
let moving_right = true;
let is_jumping = false;
let jump_target_y = 0;
let platform_y = 300;
let platform_width = 100;
let platform_x = Math.floor(Math.random() * (400 - platform_width));

let score = 0;
let high_score = 0;
let platforms_since_reset = 0;
let camera_offset = 0;
let level = 1;
let difficulty_increment = 0.2;
let game_over = false;

let jumpSound, gameOverSound, levelUpSound;

let particles = [];
let explosion_particles = [];
let explosion_timer = 0;

class Particle {
    constructor(x, y, size = null, speed_x = null, speed_y = null, alpha = null) {
        this.x = x;
        this.y = y;
        this.size = size !== null ? size : Math.floor(Math.random() * 6) + 5;
        this.alpha = alpha !== null ? alpha : 255;
        this.speed_x = speed_x !== null ? speed_x : Math.random() * 4 - 2;
        this.speed_y = speed_y !== null ? speed_y : Math.random() * 4 - 2;
    }

    update() {
        this.x += this.speed_x;
        this.y += this.speed_y;
        this.alpha -= 5;
    }

    display() {
        fill(255, this.alpha);
        noStroke();
        ellipse(this.x, this.y, this.size, this.size);
    }
}

function preload() {
    console.log("Loading sounds...");
    jumpSound = loadSound('assets/jump.wav', () => {
        console.log("Jump sound loaded successfully.");
    }, (err) => {
        console.error("Failed to load jump sound:", err);
    });
    gameOverSound = loadSound('assets/gameover.wav', () => {
        console.log("Game over sound loaded successfully.");
    }, (err) => {
        console.error("Failed to load game over sound:", err);
    });
    levelUpSound = loadSound('assets/levelup.wav', () => {
        console.log("Level up sound loaded successfully.");
    }, (err) => {
        console.error("Failed to load level up sound:", err);
    });
}

function setup() {
    let canvas = createCanvas(400, 400);
    canvas.id('gameCanvas');
    textSize(20);
}

function reset_position() {
    player_x = 200;
    player_y = 380;
    platform_y = 300;
    platform_x = Math.floor(Math.random() * (400 - platform_width));

    camera_offset = 0;
    platforms_since_reset = 0;

    speed += difficulty_increment;
    platform_width = max(50, platform_width - 5);
}

function reset_game() {
    if (score > high_score) {
        high_score = score;
    }
    score = 0;
    level = 1;
    speed = 3;
    platform_width = 100;
    explosion_particles = [];
    explosion_timer = 0;
    game_over = false;
    reset_position();
}

function trigger_explosion() {
    explosion_timer = 20;
    for (let i = 0; i < 50; i++) {
        explosion_particles.push(new Particle(player_x + player_size / 2, player_y + player_size / 2, Math.floor(Math.random() * 11) + 10, Math.random() * 10 - 5, Math.random() * 10 - 5, 255));
    }
}

function draw() {
    background(0);
    translate(0, -camera_offset);

    if (score > high_score) {
        high_score = score;
    }

    if (explosion_timer > 0) {
        for (let i = explosion_particles.length - 1; i >= 0; i--) {
            let p = explosion_particles[i];
            p.update();
            p.display();
            if (p.alpha <= 0) {
                explosion_particles.splice(i, 1);
            }
        }
        explosion_timer--;
        if (explosion_timer == 0) {
            game_over = true;
            gameOverSound.play();
            setTimeout(() => {
                reset_game();
                loop();
            }, 3000); // Pause for 3 seconds
        }
        return;
    }

    if (!is_jumping) {
        if (moving_right) {
            player_x += speed;
            if (player_x >= width - player_size) {
                moving_right = false;
            }
        } else {
            player_x -= speed;
            if (player_x <= 0) {
                moving_right = true;
            }
        }
    } else {
        if (player_y > jump_target_y) {
            player_y -= speed;
        } else {
            is_jumping = false;
            player_y = jump_target_y;

            if (platform_x <= player_x && player_x <= platform_x + platform_width) {
                score += 1;
                platform_y -= 50 + Math.floor(Math.random() * 10);
                platform_x = Math.floor(Math.random() * (width - platform_width));
                platforms_since_reset += 1;

                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(player_x + player_size / 2, player_y));
                }

                if (platforms_since_reset == 6) {
                    level += 1;
                    if (levelUpSound.isLoaded()) {
                        levelUpSound.play();
                    }
                    reset_position();
                }
            } else {
                trigger_explosion();
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.display();
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    fill(255);
    rect(player_x, player_y, player_size, player_size);
    fill(255, 0, 0);
    rect(platform_x, platform_y, platform_width, 10);

    scoreBoard();

    if (game_over) {
        fill(255);
        textAlign(CENTER);
        text("Game Over", width / 2, height / 2);
        noLoop();
    }
}

function scoreBoard() {
    textAlign(LEFT);
    fill(255);
    text("Score: " + score, 10, 30 + camera_offset);
    text("Level: " + level, width - 100, 30 + camera_offset);
    text("High Score: " + high_score, 10, 60 + camera_offset);
}

function keyPressed() {
    if (key == ' ' && !is_jumping && !game_over) {
        console.log("Space key pressed.");
        is_jumping = true;
        jump_target_y = platform_y - player_size;
        if (jumpSound.isLoaded()) {
            jumpSound.play();
            console.log("Playing jump sound.");
        } else {
            console.error("Jump sound is not loaded.");
        }
    }
}