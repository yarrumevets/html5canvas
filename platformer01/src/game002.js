// Move the player around the map with ijkl keys.

let stats;

const game = {};
const gameScreen = {};

let ctx;
let sprites = {};

const keyboard = {};

// Viewable dimensions in pixels. Unaffected by level dimensions.
gameScreen.width = 11024;
gameScreen.height = 600;

// Width of a tile should conform to this but will only overlap or look strange otherwise.
game.tileWidth = 50;
game.tileHeight = 50;

// # of tiles that fit on a screen.
gameScreen.numTilesWide = gameScreen.width / game.tileWidth;
gameScreen.numTilesHigh = gameScreen.height / game.tileHeight;

const gameLevel = [];
const END_OF_LINE_CHAR = 10;
const BACKGROUND_COLOR = "#66ccff";
const MAX_MOVE_SPEED = 29;

const drawLevel = () => {
  let x = 0;
  let y = 0;
  for (let l = 0; l < gameLevel.length; l++) {
    const tileWithinScreen =
      x * game.tileWidth < gameScreen.width &&
      y * game.tileHeight < gameScreen.height &&
      x * game.tileWidth > (game.tileWidth - 1) * -1 &&
      y * game.tileHeight > (game.tileHeight - 1) * -1;
    const spriteCode = gameLevel[l];
    if (spriteCode !== 0 && tileWithinScreen) {
      switch (spriteCode) {
        case 1:
          curSprite = sprites.tile;
          break;
        case "P":
          curSprite = sprites.player;
          break;
        case "X":
          curSprite = sprites.exit;
          break;
      }
      ctx.drawImage(curSprite, x * game.tileWidth, y * game.tileHeight);
    }
    if (l != 0 && (l + 1) % game.gridWidth === 0) {
      x = 0;
      y++;
    } else {
      x++;
    }
  }
};

const drawBackground = () => {
  ctx.fillRect(0, 0, gameScreen.width, gameScreen.height);
};

const getOffset = (x, y) => y * game.gridWidth + x;
const getCell = (x, y) => gameLevel[getOffset(x, y)];

testPointColision = (x, y, oldX, oldY) => {
  //@TODO: old x and old y to be used to check for colisions where player moves before -> after a block without landing on it during a frame.
  xTile = (x - (x % game.tileWidth)) / game.tileWidth;
  yTile = (y - (y % game.tileHeight)) / game.tileHeight;
  // console.log("xTile: ", xTile, " - yTile: ", yTile, " | x,y: ", x, y);
  // console.log("getCell x y : ", getCell(xTile, yTile));
  if (getCell(xTile, yTile)) {
    return true;
  }
  return false;
};

// @TODO: fix keydown issue.
// https://stackoverflow.com/questions/12273451/how-to-fix-delay-in-javascript-keydown
checkKeyboard = function() {
  let noMove = true;
  let move = game.player.xMove;
  while (noMove && move > 1) {
    // console.log("move: ", move);
    let x = game.player.x;
    let y = game.player.y;
    // 5=up 6=left 7=down 8=right
    if (keyboard[73] === 1) {
      // i
      //y -= yMove;
    } else if (keyboard[74] === 1) {
      // j
      x -= move;
    } else if (keyboard[75] === 1) {
      // k
      //y += yMove;
    } else if (keyboard[76] === 1) {
      // l
      x += move;
    }

    if (keyboard[32] === 1 && game.player.grounded) {
      console.log("KEYPRESSED !: ", game.player.grounded);
      game.player.grounded = false;
      game.player.yMove = -20;
    }

    // Don't apply if player will overlap OR pass through a brick.

    const up = y;
    const left = x;
    const right = x + game.tileWidth;
    const down = y + game.tileHeight;

    if (
      testPointColision(left, up) ||
      testPointColision(left, down) ||
      testPointColision(right, up) ||
      testPointColision(right, down)
    ) {
      // console.log("COLLISION X : ", move);
      move = Math.floor(move / 2);
    } else {
      game.player.x = x;
      noMove = false;
    }
  }
};

document.onkeydown = e => {
  keyboard[e.keyCode] = 1;
  // console.log("keyboard: ", keyboard);
};

document.onkeyup = e => {
  delete keyboard[e.keyCode];
};

const playerGravity = () => {
  // Check that the object is still on a surface.
  const left = game.player.x;
  const right = game.player.x + game.tileWidth;
  const down = game.player.y + 1 + game.tileHeight;
  if (!testPointColision(left, down) && !testPointColision(right, down)) {
    game.player.grounded = false;
  }

  if (game.player.grounded === true) {
    return;
  }

  let noMove = true;
  if (game.player.yMove + 1 <= MAX_MOVE_SPEED) {
    game.player.yMove++;
  }
  let move = game.player.yMove;

  const prevMove = game.player.yMove;

  while (noMove && move) {
    let x = game.player.x;
    let y = game.player.y;
    y += move;
    const up = y;
    const left = x;
    const right = x + game.tileWidth;
    const down = y + game.tileHeight;
    if (
      testPointColision(left, up) ||
      testPointColision(left, down) ||
      testPointColision(right, up) ||
      testPointColision(right, down)
    ) {
      move = Math.floor(move / 2);
    } else {
      game.player.y = y;
      noMove = false;
    }
  }

  if (move === 0 && prevMove > 0) {
    console.log("prevMove: ", prevMove);
    game.player.grounded = true;
  } else if (move === 0 && prevMove < 0) {
    console.log("hit top!");
    game.player.yMove = 1;
  }

  stats.innerHTML =
    "grounded: " +
    game.player.grounded +
    " game.player.y: " +
    game.player.y +
    " game.player.grounded: " +
    game.player.grounded +
    " move: " +
    move;
};

drawPlayer = () => {
  ctx.drawImage(sprites.player, game.player.x, game.player.y);
};

//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>
window.onload = () => {
  // <><><><><><><> INIT SECTION <><><><><><><> //
  const gameLevelData = document.getElementById("gameLevelData").value;

  // Get dimensions of the game level data and make sure they're valid.
  // Determine the level width based on the first occurance of end-of-line character 10.
  let levelIsValid = true;
  let i = 0;
  while (gameLevelData[i].charCodeAt(0) !== END_OF_LINE_CHAR) {
    i++;
  }
  game.gridWidth = i;
  // Determine that each line is the same length as defined in game.gridWidth.
  for (i = game.gridWidth; i < gameLevelData.length; i += game.gridWidth + 1) {
    if (gameLevelData[i].charCodeAt(0) !== END_OF_LINE_CHAR) {
      levelIsValid = false;
      break;
    }
  }
  if (!levelIsValid) {
    console.log("level is invalid!");
    return;
  }
  game.gridHeight = i;

  // Populate the game level with only tile data.
  for (i = 0; i < gameLevelData.length; i++) {
    symbol = gameLevelData[i];
    if (symbol.charCodeAt(0) !== END_OF_LINE_CHAR) {
      if (symbol === "1") {
        gameLevel.push(1);
      } else {
        gameLevel.push(0);
      }
    }
  }

  const gameArr = gameLevelData.split("");

  const newGameArr = gameArr.filter(dat => {
    return dat.charCodeAt(0) !== 10;
  });

  game.player = {
    xMove: 28,
    yMove: 0,
    grounded: false // this should probably be set true and as a rule alway start player on ground.
  };
  playerIndex = newGameArr.findIndex(el => {
    return el === "P";
  });
  game.player.x = (playerIndex % game.tileWidth) * game.tileWidth;
  game.player.y =
    ((playerIndex - game.player.x) / game.gridWidth + 1) * game.tileHeight;

  const canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  canvas.width = gameScreen.width;
  canvas.height = gameScreen.height;

  ctx.fillStyle = BACKGROUND_COLOR;

  sprites.tile = document.getElementById("sprite_tile");
  sprites.player = document.getElementById("sprite_player");
  sprites.exit = document.getElementById("sprite_exit");

  stats = document.getElementById("stats");
  stats.innerHTML = "...";

  // <><><><><><><> MAIN GAME LOOP <><><><><><><> //

  setInterval(() => {
    checkKeyboard();
    playerGravity();
    drawBackground();
    drawLevel();
    drawPlayer();
  }, 30);
};
