// Move the player around the map with ijkl keys.
// Player moves 1 tile at a time.
// Player cannot move through (onto) brick tiles.
// Exit door sprite doesn't appear.

const game = {};
const gameScreen = {};

// Viewable dimensions in pixels. Unaffected by level dimensions.
gameScreen.width = 11024;
gameScreen.height = 600;

// Width of a tile should conform to this but will only overlap or look strange otherwise.
game.tileWidth = 50;
game.tileHeight = 50;

// # of tiles that fit on a screen.
gameScreen.numTilesWide = gameScreen.width / game.tileWidth;
gameScreen.numTilesHigh = gameScreen.height / game.tileHeight;

const sprites = {};
const gameLevel = [];
const END_OF_LINE_CHAR = 10;
const BACKGROUND_COLOR = "#66ccff";

const drawSprites = (ctx, sprites) => {
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

const drawBackground = ctx => {
  ctx.fillRect(0, 0, gameScreen.width, gameScreen.height);
};

const playerGravity = () => {
  if (1) {
  }
};

const getOffset = (x, y) => y * game.gridWidth + x;
const getCell = (x, y) => gameLevel[getOffset(x, y)];

// @TODO: fix keydown issue.
// https://stackoverflow.com/questions/12273451/how-to-fix-delay-in-javascript-keydown
document.onkeypress = function(e) {
  e = e || window.event;

  let x = game.player.x;
  let y = game.player.y;

  // 5=up 6=left 7=down 8=right
  if (e.keyCode === 105) {
    y--;
  } else if (e.keyCode === 106) {
    x--;
  } else if (e.keyCode === 107) {
    y++;
  } else if (e.keyCode === 108) {
    x++;
  } else if (e.keyCode === 100) {
    player.gravity = -3;
  } else {
    console.log("KEY: ", e.keyCode);
  }

  if (getCell(x, y) === 0) {
    game.player.oldX = game.player.x;
    game.player.oldY = game.player.y;
    game.player.x = x;
    game.player.y = y;
    gameLevel[getOffset(game.player.oldX, game.player.oldY)] = 0;
    gameLevel[getOffset(game.player.x, game.player.y)] = "P";
  }
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

  game.player = {};
  playerIndex = newGameArr.findIndex(el => {
    return el === "P";
  });
  game.player.x = playerIndex % game.tileWidth;
  game.player.y = (playerIndex - game.player.x) / game.gridWidth;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  canvas.width = gameScreen.width;
  canvas.height = gameScreen.height;

  ctx.fillStyle = BACKGROUND_COLOR;

  sprites.tile = document.getElementById("sprite_tile");
  sprites.player = document.getElementById("sprite_player");
  sprites.exit = document.getElementById("sprite_exit");

  stats = document.getElementById("stats");
  stats.innerHTML = "foobar";

  game.player.oldX = -2;
  game.player.oldY = -2;

  gameLevel[getOffset(game.player.x, game.player.y)] = "P";

  // <><><><><><><> MAIN GAME LOOP <><><><><><><> //

  setInterval(() => {
    playerGravity();
    drawBackground(ctx);
    drawSprites(ctx, sprites);
  }, 0);
};
