// Main game object
const game = {};

// Basic game init/config
game.width = 60;
game.height = 25;
game.tileWidth = 20;
game.tileHeight = 20;

let tiles = [[]];
let ctx;

const initTiles = () => {
  for (let x = 0; x < game.width; x++) {
    tiles[x] = [];
    for (let y = 0; y < game.height; y++) {
      tiles[x][y] = -1;
    }
  }
};

drawTiles = brickSprites => {
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) {
      if (tiles[x][y] >= 0)
        ctx.drawImage(
          brickSprites[tiles[x][y]],
          x * game.tileWidth,
          y * game.tileHeight
        );
    }
  }
};

dropTiles = () => {
  for (var y = game.height - 2; y >= 0; y--) {
    for (var x = game.width - 1; x >= 0; x--) {
      if (tiles[x][y + 1] === -1) {
        tiles[x][y + 1] = tiles[x][y];
        tiles[x][y] = -1;
      }
    }
  }
};

const checkForCol = () => {
  let color;
  let prevColor;
  let patternCount = 0;
  let x, y;

  for (x = 0; x < game.width; x++) {
    color = -1;
    if (patternCount >= 2) {
      for (var i = 0; i <= patternCount; i++) {
        tiles[x - 1][game.height - 1 - i] = -1;
      }
    }
    patternCount = 0;
    for (y = 0; y < game.height; y++) {
      prevColor = color;
      color = tiles[x][y];
      if (color > 0) {
        if (color === prevColor) {
          patternCount++;
        } else {
          if (patternCount >= 2) {
            for (var i = 0; i <= patternCount; i++) {
              tiles[x][y - 1 - i] = -1;
            }
          }
          patternCount = 0;
        }
      }
    }
    if (patternCount >= 2) {
      for (var i = 0; i <= patternCount; i++) {
        tiles[x][game.height - 1 - i] = -1;
      }
    }
  }

  if (patternCount >= 2) {
    for (var i = 0; i <= patternCount; i++) {
      tiles[x - 1][game.height - 1 - i] = -1;
    }
  }
};

const checkForRow = () => {
  let color;
  let prevColor;
  let patternCount = 0;
  let x, y;

  for (y = 0; y < game.height; y++) {
    color = -1;
    if (patternCount >= 2) {
      for (var i = 0; i <= patternCount; i++) {
        tiles[game.width - 1 - i][y - 1] = -1;
      }
    }
    patternCount = 0;
    for (x = 0; x < game.width; x++) {
      prevColor = color;
      color = tiles[x][y];
      if (color > 0) {
        if (color === prevColor) {
          patternCount++;
        } else {
          if (patternCount >= 2) {
            for (var i = 0; i <= patternCount; i++) {
              tiles[x - 1 - i][y] = -1;
            }
            patternCount = 0;
          }
        }
      } else {
        if (patternCount >= 2) {
          for (var i = 0; i <= patternCount; i++) {
            tiles[x - 1 - i][y] = -1;
          }
        }
        patternCount = 0;
      }
    }
  }

  if (patternCount >= 2) {
    for (var i = 0; i <= patternCount; i++) {
      tiles[game.width - 1 - i][y - 1] = -1;
    }
  }

  dropTiles();
};

const getRandomBrickType = brickSprites => {
  // return Math.floor(Math.random() * (brickSprites.length - 1)) + 1;
  return Math.floor(Math.random() * brickSprites.length);
};

const clearCanvas = () => {
  ctx.fillRect(
    0,
    0,
    game.tileWidth * game.width,
    game.height * game.tileHeight
  );
};

window.onload = () => {
  initTiles();

  const tileBrickGrey = document.getElementById("tile_brick_grey");
  const tileBrickRed = document.getElementById("tile_brick_red");
  const tileBrickYellow = document.getElementById("tile_brick_yellow");
  const tileBrickBlue = document.getElementById("tile_brick_blue");
  const tileBrickPurple = document.getElementById("tile_brick_purple");
  const tileBrickGreen = document.getElementById("tile_brick_green");

  const brickSprites = [
    tileBrickRed,
    tileBrickYellow,
    tileBrickGreen,
    tileBrickBlue,
    tileBrickPurple,
    tileBrickGrey
  ];

  game.canvas = document.getElementById("game");
  game.canvas.width = game.width * game.tileWidth;
  game.canvas.height = game.height * game.tileHeight;
  ctx = game.canvas.getContext("2d");

  stats = document.getElementById("stats");
  var milli = 0;
  var numLoops = 0;
  var endDate;
  var startDate = new Date();

  active = {};
  active.x = Math.floor(Math.random() * game.width);
  active.y = 0;
  active.brickType = getRandomBrickType(brickSprites);
  tiles[active.x][active.y] = 1;

  ctx.fillStyle = "white";

  const gameLoop = setInterval(() => {
    clearCanvas();

    drawTiles(brickSprites);

    endDate = new Date();
    milli = endDate.getTime() - startDate.getTime();
    stats.innerHTML =
      "s " +
      Math.round(milli / 1000) +
      " / " +
      numLoops +
      " frames | " +
      parseFloat(numLoops / (milli / 1000)).toFixed(1) +
      "fps";

    const nextLocationHasTile = tiles[active.x][active.y + 1] !== -1;
    const tileHitBottom = active.y === game.height - 1;

    if (nextLocationHasTile && active.y === 0) {
      initTiles();
      ctx.fillRect(
        0,
        0,
        game.width * game.tileWidth,
        game.height * game.tileHeight
      );
      ctx.fill();
    } else if (tileHitBottom || nextLocationHasTile) {
      // Reset active tile and add new fixed tile.
      active.y = -1;
      active.x = Math.floor(Math.random() * game.width);
      active.brickType = getRandomBrickType(brickSprites);

      tiles[active.x][active.y] = active.brickType;

      // Check for rows/cols of 3+
      checkForCol();
      checkForRow();
    } else {
      // Keep moving active tile
      tiles[active.x][active.y] = -1;
      active.y++;
      tiles[active.x][active.y] = active.brickType;
    }

    numLoops++;
  }, 0);
};
