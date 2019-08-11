// Game tile layout is a grid rotated roughly 45deg clockwise.

// Columns 0,1,2 and 6,7,8,9 will be for 'grass' background.
// Columns 2 and 6 can have plots
// Columns 3,4,5 will be roads (regardless of which sprites are used.)

//<><><><><><><><><><><><> CONSTANTS <><><><><><><><><><><><>

const TILE_WIDTH = 104;
const TILE_HEIGHT = 52;
const TILE_HEIGHT_HALF = TILE_HEIGHT / 2;
const TILE_WIDTH_HALF = TILE_WIDTH / 2;
const BG_COLOR = "rgba(50,50,50,0.9)";
const ANIMATION_DELAY = 10; // ms.
const CAR_WAVES_DELAY = 2000;
let canvas;
const game = {};

//<><><><><><><><><><><><> INIT / SETUP <><><><><><><><><><><><>

let gameLoopInterval, addCarsInterval;

// Load sprites.
game.sprites = {};
game.sprites.grass = document.getElementById("spr-tile-grass-1");
game.sprites.plot = document.getElementById("spr-tile-plot-1");
game.sprites.roadBottom1 = document.getElementById("spr-tile-rd-bottom-1");
game.sprites.roadBottom2 = document.getElementById("spr-tile-rd-bottom-2");
game.sprites.roadTop1 = document.getElementById("spr-tile-rd-top-1");
game.sprites.roadTop2 = document.getElementById("spr-tile-rd-top-2");
game.sprites.roadMid1 = document.getElementById("spr-tile-rd-mid-1");
game.sprites.roadMid2 = document.getElementById("spr-tile-rd-mid-2");
game.sprites.roadMid3 = document.getElementById("spr-tile-rd-mid-3");
game.sprites.roadMid4 = document.getElementById("spr-tile-rd-mid-4");
game.sprites.tower1 = document.getElementById("spr-tower-1");
game.sprites.tower1Back = document.getElementById("spr-tower-1-back");
game.sprites.car1 = document.getElementById("spr-car-1");
game.sprites.car2 = document.getElementById("spr-car-2");
game.sprites.car3 = document.getElementById("spr-car-3");

canvas = document.getElementById("thecanvas");

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
  event = event || window.event; // IE-ism
  const x = event.pageX - canvas.offsetLeft; // game xy are the position
  const y = event.pageY - canvas.offsetTop; // of the upper-left corner of the canvas.
  // console.log("x/y: ", x, "/", y);
  game.mouse = { x, y };
}

function init() {
  clearInterval(gameLoopInterval);
  clearInterval(addCarsInterval);
  game.reset = true;
  game.w = 0; // amount of tiles.
  game.h = 0;
  game.width = 0; // pixels.
  game.height = 0;
  game.tilesXStart = 0; // Where on the canvas to start plotting tiles (y is always 0)
  game.waves = [];
  game.towers = {};
  game.carIndex = 0;
  game.mouse = { x: 0, y: 0 };

  if (game.cars) delete game.cars;
  game.cars = {};

  // Load game data.
  const tileMapRawData = document
    .getElementById("map-data")
    .innerHTML.split("\n");
  game.waves = document.getElementById("wave-data").innerHTML.split("\n");
  game.w = tileMapRawData[0].length;
  game.h = tileMapRawData.length;

  // Setup the canvas.
  canvas.width = game.w * TILE_WIDTH_HALF + game.h * TILE_WIDTH_HALF;
  canvas.height = scrHeight =
    game.w * TILE_HEIGHT_HALF + game.h * TILE_HEIGHT_HALF;
  context = canvas.getContext("2d");
  game.tilesXStart = (game.h - 1) * TILE_WIDTH_HALF;

  game.tiles = [];
  for (let i = 0; i < tileMapRawData.length; i++) {
    const row = tileMapRawData[i];
    const tileRow = [];
    for (let j = 0; j < row.length; j++) {
      // Pre-calc some coords.
      const xScr = game.tilesXStart + i * TILE_WIDTH_HALF - j * TILE_WIDTH_HALF;
      const yScr = i * TILE_HEIGHT_HALF + j * TILE_HEIGHT_HALF;
      const xCenter = xScr + TILE_WIDTH_HALF;
      const yCenter = yScr + TILE_HEIGHT_HALF;
      // Sprite based on symbil.
      let sprite;
      const gd = tileMapRawData[j][i];
      if (gd == "p") {
        sprite = game.sprites.plot;
      } else if (!isNaN(gd)) {
        const pos = i == "3" ? "Top" : i == "4" ? "Mid" : "Bottom";
        sprite = game.sprites["road" + pos + gd];
      } else {
        sprite = game.sprites.grass;
      }
      tileRow.push({
        xGrid: j,
        yGrid: i,
        xScr,
        yScr,
        xCenter,
        yCenter,
        sprite
      });
    }
    game.tiles.push(tileRow);
  }

  console.log("GAME TILES: ", game.tiles);

  // Wave timed offset loop.
  addCarsInterval = setInterval(() => {
    const curWave = game.waves[game.carIndex];
    if (!curWave) {
      clearInterval(addCarsInterval);
      return;
    }
    for (let i = 0; i < curWave.length; i++) {
      if (game.waves[game.carIndex][i] != "-") {
        // unique id.
        game.cars["c" + game.carIndex * 3 + i] = {
          x: game.tilesXStart + TILE_WIDTH * 3 + i * 55,
          y: -20 + i * 25
        };
      }
    }
    game.carIndex++;
  }, CAR_WAVES_DELAY);

  // Animation Loop.
  gameLoopInterval = setInterval(() => {
    gameLoop();
  }, ANIMATION_DELAY);
}

document.getElementById("button-start").onclick = init;

//<><><><><><><><><><><><> FUNCTIONS <><><><><><><><><><><><>

function getHoveredTile(mouse) {
  let { x, y } = mouse;
  let xDiff = 10000,
    yDiff = 10000;
  let xGrid = null,
    yGrid = null;
  for (let i = 0; i < game.tiles.length; i++) {
    for (let j = 0; j < game.tiles[0].length; j++) {
      const tile = game.tiles[i][j];
      const tempXDiff = Math.abs(x - tile.xCenter);
      if (tempXDiff < TILE_WIDTH_HALF) {
        tempYDiff = Math.abs(y - tile.yCenter);
        if (tempYDiff < TILE_HEIGHT_HALF) {
          if (tempYDiff < yDiff) {
            yDiff = tempYDiff;
            yGrid = i;
          }
          if (tempXDiff < xDiff) {
            xDiff = tempXDiff;
            xGrid = j;
          }
        }
      }
    }
  }
  if (xGrid && yGrid) {
    game.selectedTile = { x: xGrid, y: yGrid };
  }
}

function drawTileOutline() {
  const tile = game.tiles[game.selectedTile.y][game.selectedTile.x];
  context.strokeStyle = "red";
  context.setLineDash([5, 3]);
  context.beginPath();
  context.moveTo(tile.xScr + TILE_WIDTH_HALF, tile.yScr);
  context.lineTo(tile.xScr + TILE_WIDTH, tile.yScr + TILE_HEIGHT_HALF);
  context.lineTo(tile.xScr + TILE_WIDTH_HALF, tile.yScr + TILE_HEIGHT);
  context.lineTo(tile.xScr, tile.yScr + TILE_HEIGHT_HALF);
  context.lineTo(tile.xScr + TILE_WIDTH_HALF, tile.yScr);
  context.fillStyle = "rgba(255,255,0,0.5)";
  context.fill();
  context.stroke();
  context.setLineDash([]);
}

function drawMap() {
  for (let j = 0; j < game.h; j++) {
    for (let i = 0; i < game.w; i++) {
      const tile = game.tiles[i][j];
      context.drawImage(tile.sprite, tile.xScr, tile.yScr);
    }
  }
}

function drawBackground() {
  context.fillStyle = BG_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function moveCars(cars) {
  // obj.
  Object.keys(cars).forEach((item, index) => {
    const car = cars[item];
    car.x -= 2;
    car.y += 1;
    if (car.x < 0 - TILE_WIDTH) {
      delete cars[item];
    }
  });
}

function drawCars(cars) {
  // obj.
  Object.keys(cars).forEach((item, index) => {
    const car = cars[item];
    context.drawImage(game.sprites.car1, car.x, car.y);
  });
}

//<><><><><><><><><><><><> MAIN GAME LOOP <><><><><><><><><><><><>

init();

// Called in the animation loop.
function gameLoop() {
  moveCars(game.cars);
  getHoveredTile(game.mouse);
  drawBackground();
  drawMap(game.tiles);
  drawCars(game.cars);
  drawTileOutline();
}
