// Main game object
const game = {};

// Basic game init/config
game.width = 12;
game.height = 25;
game.tileWidth = 20;
game.tileHeight = 20;

let tiles = [[]];
let ctx;

const _this = this;

// ////////////////////////// calculate prime #s for a certain time.
// const startDate = new Date();
// let endDate;
// let curNum = 5;
// let timeDiff = 0;
// const primesPerMs = {};
// let largestPrime = 5;
// let primeCount = 0;
// while (timeDiff < 10000) {
//   let isPrime = true;
//   for (let i = 3; i < curNum; i += 2) {
//     // if (i % 5 != 0) {
//     if (curNum % i == 0) {
//       isPrime = false;
//       break;
//     }
//     // }
//   }
//   endDate = null;
//   endDate = new Date();
//   timeDiff = endDate.getTime() - startDate.getTime();
//   if (isPrime) {
//     primeCount++;
//     largestPrime = curNum;
//   }
//   curNum += 2;
// }
// console.log("largest prime: ", largestPrime, " (count = ", primeCount, ")");
// /////////////////////////////////

const createShape = () => {
  const shape = [
    // over 5  move the shape could block itself.
    [-1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1]
  ];
  // Randomly select first tile.
  let prevX = Math.floor(Math.random() * 5);
  let prevY = Math.floor(Math.random() * 5);
  shape[prevY][prevX] = 1;

  for (var i = 1; i < 7; i++) {
    // x / y
    const randXY = Math.floor(Math.random() * 2);
    let rd = Math.floor(Math.random() * 2);
    moveDir = randXY === 0 ? "x" : "y";
    // + / -
    const randDir = rd === 0 ? -1 : 1;
    /////6
    // Find free neighbouring blocks.
    const prevXLeftFree = shape[prevY][prevX - 1] === -1;
    const prevXRightFree = shape[prevY][prevX + 1] === -1;
    const prevYLeftFree = shape[prevY - 1] && shape[prevY - 1][prevX] === -1;
    const prevYRightFree = shape[prevY + 1] && shape[prevY + 1][prevX] === -1;

    if (moveDir === "x" && (prevXLeftFree || prevXRightFree)) {
      // Move X.
      if (randDir === 0 && prevXLeftFree) {
        shape[prevY][prevX - 1] = i + 1;
        prevX = prevX - 1;
        prevY = prevY;
      } else if (prevXRightFree) {
        shape[prevY][prevX + 1] = i + 1;
        prevX = prevX + 1;
        prevY = prevY;
      } else if (prevXLeftFree) {
        shape[prevY][prevX - 1] = i + 1;
        prevX = prevX - 1;
        prevY = prevY;
      }
    } else if (prevYLeftFree || prevYRightFree) {
      // Move Y, because Y OR because can't move X.
      if (randDir === 0 && prevYLeftFree) {
        shape[prevY - 1][prevX] = i + 1;
        prevX = prevX;
        prevY = prevY - 1;
      } else if (prevYRightFree) {
        shape[prevY + 1][prevX] = i + 1;
        prevX = prevX;
        prevY = prevY + 1;
      } else if (prevYLeftFree) {
        shape[prevY - 1][prevX] = i + 1;
        prevX = prevX;
        prevY = prevY - 1;
      }
    } else {
      // Move X because Y BUT can't move Y
      if (randDir === 0 && prevXLeftFree) {
        shape[prevY][prevX - 1] = i + 1;
        prevX = prevX - 1;
        prevY = prevY;
      } else if (prevXRightFree) {
        shape[prevY][prevX + 1] = i + 1;
        prevX = prevX + 1;
        prevY = prevY;
      } else if (prevXLeftFree) {
        shape[prevY][prevX - 1] = i + 1;
        prevX = prevX - 1;
        prevY = prevY;
      }
    }
  }

  // console.log("shape: ", shape);

  // Change all the numbers to the same.
  // Sequential numbers were just meant for debugging.
  for (var j = 0; j < 6; j++) {
    for (var k = 0; k < 6; k++) {
      if (shape[j][k] !== -1) {
        shape[j][k] = 1;
      }
    }
  }

  // Trim the shape
  let minX = 4;
  let minY = 4;
  let maxX = 0;
  let maxY = 0;
  let x, y;
  for (y = 0; y < 6; y++) {
    for (x = 0; x < 6; x++) {
      if (shape[y][x] !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;

  // console.log("minX: ", minX);
  // console.log("minY: ", minY);
  // console.log("maxX: ", maxX);
  // console.log("maxY: ", maxY);

  let trimmedShape = [];
  let newX;
  let newY = 0;
  // console.log("T S : ", trimmedShape);
  for (var yy = minY; yy < maxY + 1; yy++) {
    newX = 0;
    const row = [];
    for (var xx = minX; xx < maxX + 1; xx++) {
      row[newX] = shape[yy][xx];
      newX++;
    }
    trimmedShape[newY] = row;
    newY++;
  }
  // console.log("trimmed shape: ", trimmedShape);
  // console.log("w: ", newWidth, " h: ", newHeight);
  return trimmedShape;
};
someShape = createShape();

const initTiles = () => {
  for (let x = 0; x < game.width; x++) {
    tiles[x] = [];
    for (let y = 0; y < game.height; y++) {
      tiles[x][y] = -1;
    }
  }
};

// Draw all of the tiles on the screen.
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

// Move downward all tiles that have empty spaces below them.
dropTiles = () => {
  // console.log("dt");
  let noTilesMoved = true;
  for (var y = game.height - 2; y >= 0; y--) {
    for (var x = game.width - 1; x >= 0; x--) {
      if (tiles[x][y + 1] === -1 && tiles[x][y] != -1) {
        // console.log(">> ", tiles[x][y + 1]);
        tiles[x][y + 1] = tiles[x][y];
        tiles[x][y] = -1;
        noTilesMoved = false;
      }
    }
  }
  if (noTilesMoved) {
    // console.log("no tiles moves!");
    checkForRow();
    checkForCol();
  }
};

// Check for a column match of 3 or more.
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
      if (color > -1) {
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

// Check for a row match of 3 or more.
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
      if (color > -1) {
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

const addNewShape = brickSprites => {
  // Add shape to the grid.
  someShape = createShape();
  const xOffset = Math.floor(
    Math.random() * (game.width - someShape[0].length)
  );
  shapeColor = Math.floor(Math.random() * brickSprites.length);
  for (let y = 0; y < someShape.length; y++) {
    for (let x = 0; x < someShape[0].length; x++) {
      if (someShape[y][x] != -1) tiles[x + xOffset][y] = shapeColor;
    }
  }
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
    // tileBrickGrey,
    // tileBrickRed,
    tileBrickYellow,
    tileBrickBlue,
    tileBrickPurple,
    tileBrickGreen
  ];

  game.canvas = document.getElementById("game");
  game.canvas.width = game.width * game.tileWidth;
  game.canvas.height = game.height * game.tileHeight;
  ctx = game.canvas.getContext("2d");

  stats = document.getElementById("stats");

  ctx.fillStyle = "white";

  let i = 0;
  const gameLoop = setInterval(() => {
    clearCanvas();
    dropTiles();
    drawTiles(brickSprites);
    if (i++ > game.height) {
      i = 0;
      addNewShape(brickSprites);
    }
  }, 0);
};
