const cvs = document.getElementById('bird');
const context = cvs.getContext('2d');
const html = document.querySelector('html');
// Variables
let frames = 0;
const sprite = new Image();
sprite.src = './assets/img/sprite.png';
const DEGREE = Math.PI / 180;
// Background
const bg = {
	sX: 0,
	sY: 0,
	w: 275,
	h: 226,
	x: 0,
	y: cvs.height - 226,
	draw: function () {
		context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

		context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
	}
}
// Sounds
const point = new Audio();
point.src = 'assets/audio/point.wav'

const die = new Audio();
die.src = 'assets/audio/die.wav'

const flap = new Audio();
flap.src = 'assets/audio/flap.wav'

const hit = new Audio();
hit.src = 'assets/audio/hit.wav'

const swoosh = new Audio();
swoosh.src = 'assets/audio/swoosh.wav'

// Game State
const state = {
	current: 0,
	getReady: 0,
	game: 1,
	over: 2
}
// Start Button Click
const startButton = {
	x: 120,
	y: 263,
	w: 83,
	h: 29,
}
// Controller
cvs.addEventListener('click', function (event) {
	switch (state.current) {
		case state.getReady:
			state.current = state.game;
			swoosh.play();
			break;
		case state.game:
			bird.flap();
			flap.currentTime = 0;
			flap.play();
			break;
		case state.over:
			let rect = cvs.getBoundingClientRect();
			let clickX = event.clientX - rect.left;
			let clickY = event.clientY - rect.top;
			// Check for click on Start Button
			if (clickX >= startButton.x && clickX <= startButton.x + startButton.w && clickY >= startButton.y && clickY <= startButton.y + startButton.h) {
				pipes.reset();
				bird.speedReset();
				score.reset();
				state.current = state.getReady;
			}
			break;
	}
})
// Foreground
const fg = {
	sX: 276,
	sY: 0,
	w: 224,
	h: 112,
	x: 0,
	y: cvs.height - 112,
	dx: 2,
	draw: function () {
		context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
	},
	update: function () {
		if (state.current === state.game) {
			this.x = (this.x - this.dx) % (this.w / 2);
		}
	}
}
// Bird Object
const bird = {
	animation: [
		{ sX: 276.7, sY: 114 },
		{ sX: 276.7, sY: 139 },
		{ sX: 276.7, sY: 164 },
		{ sX: 276.7, sY: 139 },
	],
	x: 50,
	y: 150,
	w: 34,
	h: 26,
	frame: 0,
	gravity: 0.25,
	radius: 12,
	jump: 4.6,
	speed: 0,
	rotation: 0,
	flap: function () {
		if (this.y >= 0) {
			this.speed = -this.jump;
		}
	},
	// Bird Flap Slowly, when the game state = get ready state
	update: function () {
		this.period = state.current === state.getReady ? 10 : 5;
		// Increment Frame by 1, each time
		this.frame += frames % this.period === 0 ? 1 : 0;
		this.frame = this.frame % this.animation.length;
		if (state.current === state.getReady) {
			// Make new bird's position after game over
			this.y = 150;
			this.rotation = 0 * DEGREE;
		} else {
			this.speed += this.gravity;
			this.y += this.speed;
			// If bird touch foreground
			if (this.y + this.h / 2 >= cvs.height - fg.h) {
				this.y = cvs.height - fg.h - this.h / 2;
				if (state.current === state.game) {
					state.current = state.over;
					die.play();
				}
			}
			// WHEN THE BIRD FALL DOWN
			if (this.speed >= this.jump) {
				this.rotation = 55 * DEGREE;
				this.frame = 1;
			} else {
				this.rotation = -25 * DEGREE;
			}
		}
	},
	speedReset: function () {
		this.speed = 0;
	},
	draw: function () {
		let bird = this.animation[this.frame];
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.rotation);
		context.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
		context.restore();
	}
}
// Start Message
const getReady = {
	sX: 0,
	sY: 228,
	w: 173,
	h: 152,
	x: cvs.width / 2 - 173 / 2,
	y: 80,
	draw: function () {
		if (state.current == state.getReady) {
			context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		}
	}
}
// Game Over Message
const gameOver = {
	sX: 175,
	sY: 228,
	w: 225,
	h: 202,
	x: cvs.width / 2 - 225 / 2,
	y: 90,
	draw: function () {
		if (state.current == state.over) {
			context.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		}
	}
}
// Pipes
const pipes = {
	position: [],
	top: {
		sX: 553,
		sY: 0
	},
	bottom: {
		sX: 502,
		sY: 0
	},
	w: 53,
	h: 400,
	gap: 85,
	maxYpos: -150,
	dx: 2,
	draw: function () {
		for (let i = 0; i < this.position.length; i++) {
			let p = this.position[i];
			let topYpos = p.y;
			let bottomYpos = p.y + this.h + this.gap;
			// top pipe
			context.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYpos, this.w, this.h);
			// bottom pipe
			context.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYpos, this.w, this.h);
		}
	},
	reset: function () {
		this.position = [];
	},
	update: function () {
		if (state.current !== state.game) return;
		if (frames % 100 === 0) {
			this.position.push({
				x: cvs.width,
				y: this.maxYpos * (Math.random() + 1)
			});
		}
		for (let i = 0; i < this.position.length; i++) {
			let p = this.position[i];
			let bottomPipeYpos = p.y + this.h + this.gap;
			// Detect Collision
			// Top Pipe
			if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
				state.current = state.over;
				hit.play();
			}
			// Bottom Pipe
			if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYpos && bird.y - bird.radius < bottomPipeYpos + this.h) {
				state.current = state.over;
				hit.play();
			}
			// Moving Pipes
			p.x -= this.dx;
			// Delete pipes
			if (p.x + this.w <= 0) {
				point.play();
				this.position.shift();
				score.value += 1;
				score.best = Math.max(score.value, score.best);
				localStorage.setItem('best', score.best);
			}
		}
	}
}
// Score
const score = {
	best: parseInt(localStorage.getItem('best')) || 0,
	value: 0,
	draw: function () {
		context.fillStyle = '#fff';
		context.strokeStyle = 'gold';
		if (state.current === state.game) {
			context.lineWidth = 3;
			context.font = '46px Goldman';
			context.fillText(this.value, cvs.width / 2, 50);
			context.strokeText(this.value, cvs.width / 2, 50);
		} else if (state.current === state.over) {
			// Score Value
			context.lineWidth = 1;
			context.font = '24px Goldman';
			context.strokeStyle = 'black';
			context.fillText(this.value, 225, 186);
			context.strokeText(this.value, 225, 186);
			// Best Score Value
			context.fillText(this.best, 225, 228);
			context.strokeText(this.best, 225, 228);
		}
	},
	reset: function () {
		this.value = 0;
	}
}
// Medal
const medal = {
	x: 72,
	y: 175,
	w: 45,
	h: 45,
	white: {
		sX: 312,
		sY: 112,
	},
	bronze: {
		sX: 359,
		sY: 157,
	},
	silver: {
		sX: 359,
		sY: 112,
	},
	gold: {
		sX: 312,
		sY: 157,
	},
	draw: function () {
		if (state.current === state.over) {
			switch (true) {
				case (score.value <= 10):
					context.drawImage(sprite, this.white.sX, this.white.sY, this.w, this.h, this.x, this.y, this.w, this.h);
					break;
				case (score.value > 10 && score.value <= 20):
					context.drawImage(sprite, this.bronze.sX, this.bronze.sY, this.w, this.h, this.x, this.y, this.w, this.h);
					break;
				case (score.value > 20 && score.value <= 30):
					context.drawImage(sprite, this.silver.sX, this.silver.sY, this.w, this.h, this.x, this.y, this.w, this.h);
					break;
				case (score.value > 30):
					context.drawImage(sprite, this.gold.sX, this.gold.sY, this.w, this.h, this.x, this.y, this.w, this.h);
					break;
				default:
					break;
			}
		}
	}
}
// Draw function
function draw() {
	if (document.querySelector(".night").checked === true) {
		context.fillStyle = "#32384f";
		html.style.background = 'linear-gradient(#0c0c3d, #002c00)';
	} else {
		context.fillStyle = "#74cdd6";
		html.style.background = 'linear-gradient(#7777fa, #7efa7e)';
	}
	context.fillRect(0, 0, cvs.width, cvs.height)
	bg.draw();
	fg.draw();
	pipes.draw();
	bird.draw();
	getReady.draw();
	gameOver.draw();
	score.draw();
	medal.draw();
}
// Update function
function update() {
	bird.update();
	fg.update();
	pipes.update();
}
// Loop function
function loop() {
	update();
	draw();
	frames++;
	requestAnimationFrame(loop);
}
loop();