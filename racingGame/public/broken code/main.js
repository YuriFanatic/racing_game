// Game states
const STATE_START = 1;
const STATE_RESTART = 2;
const STATE_PLAY = 3;
const STATE_GAMEOVER = 4;

var state = STATE_START;
var canvas;
var context;
var gamePaused = false;



function startGame() {
    canvas = document.getElementById('Canvas');
    context = canvas.getContext('2d');

    // Create instances of the game objects
    road = new Road(camera);
    camera = new Camera();

    // Start game loop
    window.requestAnimationFrame(updateGameArea);
}

function updateGameArea() {
    if (!gamePaused) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (state) {
            case STATE_START:
                camera.init();
                state = STATE_RESTART;
                break;

            case STATE_RESTART:
                road.create();
                state = STATE_PLAY;
                break;

            case STATE_PLAY:
                camera.update();
                road.render3D(camera);
                break;

            case STATE_GAMEOVER:
                // Handle game over state
                break;
        }
    }
    else {
        displayPausedText();
    }

    window.requestAnimationFrame(updateGameArea); // Continue the game loop
}

// Function to display "Game Paused" text
function displayPausedText() {
    context.font = "40px Courier New";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Paused", canvas.width / 2, canvas.height / 2);
}

//pause button
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        gamePaused = !gamePaused;
        console.log(gamePaused? 'Game Paused' : 'Game Resumed');
    }
});
