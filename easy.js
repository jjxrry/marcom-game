// To Devs that see this:
// its spaghetti i know, but a wise man once said: spaghetti and meatballs are delicious
"use strict"

//board
let board;
let boardWidth = window.innerWidth * .84;
let boardHeight = window.innerHeight * .7;
let context;

//char
let charWidth = 14;
let charHeight = 14;
let charX = Math.round(boardWidth / 2);
let charY = boardHeight - charHeight - (boardHeight * .45);
// let charY = boardHeight - charHeight;
let charImg;
let char = {
    x : charX,
    y : charY,
    width : charWidth,
    height : charHeight
}

//enemy
let enemyTopArray = [];
let enemySideArray = [];
let enemyWidth = 6;
let enemyHeight = 6;
let enemyX = 50;
let enemyY = boardHeight - enemyHeight;
let numTopEnemies;
let numSideEnemies;

//incentives
let incentiveArray = [];
let incentiveWidth = 20;
let incentiveHeight = 20;
let incentiveX;
let incentiveY;

//physics
let charVelocityX = 20;
let charVelocityY = 20;
let enemyVelocityX = 4;
let enemyVelocityY = 4;

let gameOver = false;
let score = 0;
let timer = 0;

let spawnInterval;
let incentiveSpawnInterval;
let animationFrameRequest;
let SPAWN_INTERVAL = 700;
let INCENTIVE_SPAWN_INTERVAL = 4000;

let modal = document.querySelector(".endgame-modal");
let resizeModal = document.querySelector(".resize-modal");
let hiddenModal = document.querySelector(".easter-egg");
// don't know why but css isn't enough
hiddenModal.style.display = "none";

// select all items
let boardThemeSelector = document.querySelector(".game-board-1");
let resizeThemeSelector = document.querySelector(".resize-modal");
let endgameThemeSelector = document.querySelector(".endgame-modal");
let modalButtonThemeSelector = document.querySelector(".modal-button");
let titleThemeSelector = document.querySelector(".title-card");
let easterEggFontColor = document.querySelector(".hidden-font");
let controlsFontColor = document.querySelector(".controls-text");
let controlsTitleFontColor = document.querySelector(".controls-title");
let grayscaleButtonSelector = document.querySelector(".grayscale");
let seaButtonSelector = document.querySelector(".sea");
let desertButtonSelector = document.querySelector(".desert");

// endgame restart spacebar listener
let spaceListener;

// every 5 seconds, make it harder
setTimeout(() => {
    if (SPAWN_INTERVAL >= 20) {
        SPAWN_INTERVAL -= 20;
    }
    console.log(SPAWN_INTERVAL);
}, 3000)

// setTimeout(() => {
//     // add incentive object
//     placeIncentiveObject();
//     console.log(SPAWN_INCENTIVE);
// }, 6000)

function setActiveButton(theme) {
    const buttons = document.querySelectorAll('.theme-button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    const activeButton = document.querySelector(`.theme-button.${theme}`);
    activeButton.classList.add('active');
}

// default theme
setActiveButton('grayscale');

function themeDark(){
    boardThemeSelector.style.backgroundColor = "#d4c1ec";
    resizeThemeSelector.style.backgroundColor = "#9f9fed";
    endgameThemeSelector.style.backgroundColor = "#9f9fed";
    modalButtonThemeSelector.style.backgroundColor = "#d4c6e7";
    titleThemeSelector.style.color = "#d4c1ec";
    document.body.style.backgroundColor = "#454545";
    easterEggFontColor.style.color = "#d4c1ec";
    controlsFontColor.style.color = "#d4c1ec";
    controlsTitleFontColor.style.color = "#d4c1ec";
    setActiveButton('grayscale');
}

function themeSea(){
    boardThemeSelector.style.backgroundColor = "#edf2fb";
    resizeThemeSelector.style.backgroundColor = "#99c1de";
    endgameThemeSelector.style.backgroundColor = "#99c1de";
    modalButtonThemeSelector.style.backgroundColor = "#dbe7e4";
    titleThemeSelector.style.color = "black";
    document.body.style.backgroundColor = "#99c1de";
    easterEggFontColor.style.color = "black";
    controlsFontColor.style.color = "black";
    controlsTitleFontColor.style.color = "black";
    setActiveButton('sea');
}

function themeDesert(){
    boardThemeSelector.style.backgroundColor = "#ffac81";
    resizeThemeSelector.style.backgroundColor = "#ff928b";
    endgameThemeSelector.style.backgroundColor = "#ff928b";
    modalButtonThemeSelector.style.backgroundColor = "#fec3a6";
    titleThemeSelector.style.color = "black";
    document.body.style.backgroundColor = "#cdeac0";
    easterEggFontColor.style.color = "black";
    controlsFontColor.style.color = "black";
    controlsTitleFontColor.style.color = "black";
    setActiveButton('desert');
}

function toggleEasterEgg(){
    if (hiddenModal.style.display === "none"){
        console.log('easter egg fire')
        hiddenModal.style.display = "flex";
    } else {
        console.log('easter egg fire')
        hiddenModal.style.display = "none";
    }
}

function startGame() {
    gameOver = false;
    score = 0;
    SPAWN_INTERVAL = 700;
    board = document.querySelector(".game-board-1");
    board.height = boardHeight;
    board.width = boardWidth;
    // draw board
    context = board.getContext("2d");
    
    // // draw initial char
    // context.fillStyle="black";
    // context.fillRect(char.x, char.y, char.width, char.height);
    
    spawnInterval = setInterval(placeEnemies, SPAWN_INTERVAL);
    if (incentiveArray.length === 0){
        incentiveSpawnInterval = setInterval(() => {
            if (incentiveArray.length === 0) {
                placeIncentiveObject();
            }
        }, INCENTIVE_SPAWN_INTERVAL);
    }
    // incentiveSpawnInterval = setInterval(placeIncentiveObject, 10)
    animationFrameRequest = requestAnimationFrame(update);
    document.addEventListener("keydown", moveChar);
}

function update() {
    // need to cancel requests on end otherwise little twiggly bits get fragmented and
    // tacked on :)
    if (gameOver) {
        cancelAnimationFrame(animationFrameRequest);
        return;
    }

    requestAnimationFrame(update);

    // clear board
    context.clearRect(0, 0, board.width, board.height);
    
    // char
    // context.fillRect(char.x, char.y, char.width, char.height);
    // circles instead
    context.beginPath();
    context.arc(char.x, char.y, char.width / 2, 0, 2 * Math.PI);
    context.fillStyle = "black";
    context.fill();
    context.closePath();
    
    // enemy
    enemyTopArray.forEach(enemy => {
        // adjust the enemy trajectory here
        // this is where we add the bounce functionality, and random x/y velocities
        enemy.y += enemy.dy;

        // draw the enemy
        // context.fillStyle="black";
        // context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // circles instead
        context.beginPath();
        context.arc(enemy.x, enemy.y, enemy.width / 2, 0, 2 * Math.PI);
        context.fillStyle = "black";
        context.fill();
        context.closePath();
        
        if (detectCollision(char, enemy)) {
            gameOver = true;
            openEndGameModal();
        }
    });
    
    enemySideArray.forEach(enemy => {
        // adjust the enemy trajectory here
        // we can randomize whether these spawn from the right or the left
        // side = 0 is left
        if (enemy.side === 0) {
            enemy.x += enemy.dx;
        } else {
            enemy.x -= enemy.dx;
        }
        // context.fillStyle="black";
        // context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // circles instead
        context.beginPath();
        context.arc(enemy.x, enemy.y, enemy.width / 2, 0, 2 * Math.PI);
        context.fillStyle = "black";
        context.fill();
        context.closePath();
        
        if (detectCollision(char, enemy)) {
            gameOver = true;
            openEndGameModal();
        }
        console.log("VELOCITY: ", enemyVelocityX);
    });

    for (let i = incentiveArray.length - 1; i >= 0; i--) {
        let incentive = incentiveArray[i];
        // draw the enemy
        // context.fillStyle="black";
        // context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // circles instead
        context.beginPath();
        context.arc(incentive.x, incentive.y, incentive.width / 2, 0, 2 * Math.PI);
        context.fillStyle = "red";
        context.fill();
        context.closePath();
        
        if (detectCollision(char, incentive)) {
            score += 200;
            incentiveArray.splice(i, 1);
        }
    };
    
    // score draw + timer counter
    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText(score, 15, 25);
}

function moveChar(e) {
    if (gameOver) {
        cancelAnimationFrame(animationFrameRequest);
        return;
    }

    let up = e.code === "ArrowUp" || e.code === "KeyW";
    let down = e.code === "ArrowDown" || e.code === "KeyS";
    let left = e.code === "ArrowLeft" || e.code === "KeyA";
    let right = e.code === "ArrowRight" || e.code === "KeyD";

    if (up && left) {
        // Diagonal up-left
        if (char.y - charVelocityY >= 0 && char.x - charVelocityX >= 0) {
            char.y -= charVelocityY;
            char.x -= charVelocityX;
        }
    } else if (up && right) {
        // Diagonal up-right
        if (char.y - charVelocityY >= 0 && char.x + charVelocityX + char.width <= board.width) {
            char.y -= charVelocityY;
            char.x += charVelocityX;
        }
    } else if (down && left) {
        // Diagonal down-left
        if (char.y + charVelocityY <= board.height && char.x - charVelocityX >= 0) {
            char.y += charVelocityY;
            char.x -= charVelocityX;
        }
    } else if (down && right) {
        // Diagonal down-right
        if (char.y + charVelocityY <= board.height && char.x + charVelocityX + char.width <= board.width) {
            char.y += charVelocityY;
            char.x += charVelocityX;
        }
    } else if (up) {
        // Up
        if (char.y - charVelocityY >= 0) {
            char.y -= charVelocityY;
        }
    } else if (down) {
        // Down
        if (char.y + charVelocityY <= board.height) {
            char.y += charVelocityY;
        }
    } else if (left) {
        // Left
        if (char.x - charVelocityX >= 0) {
            char.x -= charVelocityX;
        }
    } else if (right) {
        // Right
        if (char.x + charVelocityX + char.width <= board.width) {
            char.x += charVelocityX;
        }
    }
}

function getSizeCategory(width){
    if (width >= 1441) {
        return 'XL';
    } else if (width >= 1069) {
        return 'LARGE';
    } else if (width >= 736) {
        return 'MEDIUM';
    } else if (width >= 513) {
        return 'SMALL';
    } else if (width > 0) {
        return 'XS';
    }
    return 'UNKNOWN';
}

function placeEnemies() {
    if (gameOver) {
        cancelAnimationFrame(animationFrameRequest);
        return;
    }

    // console.log(window.innerWidth) 
    // place enemies

    // check window size
    getSizeCategory(window.innerWidth);

    switch (getSizeCategory(window.innerWidth)) {
        case 'XL':
            numTopEnemies = 18;
            numSideEnemies = 24;
            charVelocityX = 28;
            charVelocityY = 28;
            enemyVelocityX = 5;
            enemyVelocityY = 6;
            // console.log("XL");
            break;
        case 'LARGE':
            numTopEnemies = 18;
            numSideEnemies = 20;
            // console.log("L");
            break;
        case 'MEDIUM':
            numTopEnemies = 12;
            numSideEnemies = 16;
            // console.log("M");
            break;
        case 'SMALL':
            numTopEnemies = 10;
            numSideEnemies = 14;
            // console.log("S");
            break;
        case 'XS':
            numTopEnemies = 7;
            numSideEnemies = 12;
            // console.log("XS");
            break;
        default:
            numTopEnemies = 12;
            numSideEnemies = 18;
            break;
    }

    // log to ensure spawn rates
    // console.log("SIDE:", numSideEnemies)
    // console.log("TOP:", numTopEnemies)
    
    // for (let i = 0; i < 0; ++i){
    for (let i = 0; i < numTopEnemies; ++i){
        let randomX = Math.random() * (board.width - enemyWidth);
        randomX = Math.floor(randomX / 2) * 6;
        let enemyTop = {
            // img : null,
            x: randomX,
            y: 0,
            width: enemyWidth,
            height: enemyHeight,
            dx: 0,
            dy: enemyVelocityY
        };
        enemyTopArray.push(enemyTop);
    }
    
    // for (let i = 0; i < 0; ++i){
    for (let i = 0; i < numSideEnemies; ++i){
        let randomY = Math.random() * (board.height - enemyHeight);
        randomY = Math.floor(randomY / 2) * 6;
        let enemySide = {
            // img : null,
            x: 0,
            y: randomY,
            width: enemyWidth,
            height: enemyHeight,
            dx: enemyVelocityX,
            dy: 0,
            side: 0
        };
        // randomize side here
        let sideRandomizer = Math.random();
        if (sideRandomizer > .49){
            enemySide.side = 1;
            enemySide.x = board.width;
        }
        
        enemySideArray.push(enemySide);
    }
    }
    
function cleanUpBoard(){
    //player pos
    char.x = Math.round(boardWidth / 2 - char.width / 2);
    char.y = boardHeight - charHeight - (boardHeight * .45);

    //velocity, NEEDED to catch fragments
    charVelocityY = 20;
    charVelocityX = 20;
    enemyVelocityX = 4;
    enemyVelocityY = 4;

    //enemyarray
    enemyTopArray = [];
    enemySideArray = [];

    //incentive array
    incentiveArray = [];
}

function restartGame(){
    // ensure game is ended
    gameOver = true;

    closeEndGameModal();
    cleanUpBoard();

    if (animationFrameRequest) {
        cancelAnimationFrame(animationFrameRequest);
    }
    if (spawnInterval) {
        clearInterval(spawnInterval);
    }
    if (incentiveSpawnInterval) {
        clearInterval(incentiveSpawnInterval);
    }

    if (spaceListener) {
        document.removeEventListener("keydown", spaceListener);
    }

    // ensure restart state only if gameOver = true
    // document.removeEventListener("keydown", spaceListener);

    // for some reason, adding a timeout buffers until the update loop has run??
    // small values like 5ms or even 0 are enough? idk
    setTimeout(() => {
        startGame();
    }, 5);
}

function placeIncentiveObject(){
    incentiveArray = [];

    // EVERY 30s spawn incentive in 1 of 4 quadrants
    // we can mark by boardHeight / 2 + x (top half)
    // we can mark by boardHeight + x (bottom half)
    // if hit, then score += 350
    let randomizer = Math.random();
    let randomX;
    let randomY;

    // all of these are inset by width/height * .17
    if (randomizer >= 0.75) {
        // Top left quadrant
        randomX = Math.random() * (boardWidth / 2 - incentiveWidth) + (boardWidth * .15);
        randomY = Math.random() * (boardHeight / 2 - incentiveHeight) + (boardHeight * .15);
    } else if (randomizer >= 0.5) {
        // Top right quadrant
        randomX = Math.random() * (boardWidth / 2 - incentiveWidth) + (boardWidth / 2) - (boardWidth * .15);
        randomY = Math.random() * (boardHeight / 2 - incentiveHeight) + (boardHeight * .15);
    } else if (randomizer >= 0.25) {
        // Bottom left quadrant
        randomX = Math.random() * (boardWidth / 2 - incentiveWidth) + (boardWidth * .15);
        randomY = Math.random() * (boardHeight / 2 - incentiveHeight) + (boardHeight / 2) - (boardHeight * .15);
    } else {
        // Bottom right quadrant
        randomX = Math.random() * (boardWidth / 2 - incentiveWidth) + (boardWidth / 2) - (boardWidth * .15);
        randomY = Math.random() * (boardHeight / 2 - incentiveHeight) + (boardHeight / 2) - (boardHeight * .15);
    }

    let incentiveSpawn = {
        // img : null,
        x: randomX,
        y: randomY,
        width: incentiveWidth,
        height: incentiveHeight,
        dx: 0,
        dy: 0
    };

    incentiveArray.push(incentiveSpawn);

}

function detectIncentiveCollision(a, b){
    // Adjust player's hitbox by reducing 1px from each side
    var reducedAX = a.x + 2;
    var reducedAY = a.y + 2;
    var reducedAWidth = a.width - 4;
    var reducedAHeight = a.height - 4;

    return reducedAX < b.x + b.width &&  // Adjusted a's top left corner doesn't reach b's top right corner
            reducedAX + reducedAWidth > b.x && // Adjusted a's top right corner passes b's top left corner
            reducedAY < b.y + b.height && // Adjusted a's top left corner doesn't reach b's bottom left corner
            reducedAY + reducedAHeight > b.y; // Adjusted a's bottom left corner passes b's top left corner
}

function closeEndGameModal(){
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        modal.style.display = "none";
    }
}

function openEndGameModal(){
    console.log('Endgame Modal Fire')
    modal.style.display = "block";
    spaceListener = (e) => {
        if (e.code === "Space") {
            restartGame();
        }
    };
    document.addEventListener("keydown", spaceListener);
}

function closeResizeModal(){
    if (resizeModal.style.display === "block") {
        resizeModal.style.display = "none";
    } else {
        resizeModal.style.display = "block";
    }
}

function openResizeModal(){
    // console.log('Resize Modal Fire')
    gameOver = 1;

    if (modal.style.display === "block") {
        modal.style.display = "none";
    }
    resizeModal.style.display = "block";
}

function detectCollision(a, b) {
    // Adjust player's hitbox by reducing 1px from each side
    var reducedAX = a.x + 2;
    var reducedAY = a.y + 2;
    var reducedAWidth = a.width - 4;
    var reducedAHeight = a.height - 4;

    var reducedBX = b.x + 1;
    var reducedBY = b.y + 1;
    var reducedBWidth = b.width - 1;
    var reducedBHeight = b.height - 1;

    return reducedAX < reducedBX + reducedBWidth &&
            reducedAX + reducedAWidth > reducedBX &&
            reducedAY < reducedBY + reducedBHeight &&
            reducedAY + reducedAHeight > reducedBY;
}

function end(){
    gameOver = 1;
}

// might need to add function for refreshModal on minimize/lose focus
// window.addEventListener('blur', function() {
//     console.log('Window lost focus');
// });

window.onload = function(){
    startGame();
    window.addEventListener("resize", openResizeModal);
    // initial restart eventListener state
    document.removeEventListener("keydown", spaceListener);
}
