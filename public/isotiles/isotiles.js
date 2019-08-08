// Game tile layout is a grid rotated roughly 45deg clockwise.

// Columns 0,1,2 and 6,7,8 will be for 'grass' background.
// Columns 2 and 6 can have plots
// Columns 3,4,5 will be roads (regardless of which sprites are used.)

//<><><><><><><><><><><><> CONSTANTS <><><><><><><><><><><><>

const TILE_WIDTH = 104;
const TILE_HEIGHT = 52;
const TILE_HEIGHT_HALF = TILE_HEIGHT / 2;
const TILE_WIDTH_HALF = TILE_WIDTH / 2;
const BG_COLOR = "rgba(50,50,50,0.9)";

const ANIMATION_DELAY = 20; // ms.

let canvas;

const game = {
  w: 0, // amount of tiles.
  h: 0,
  width: 0, // pixels.
  height: 0,
  tilesXStart: 0, // Where on the canvas to start plotting tiles (y is always 0)
  sprites: {},
  map: [],
  waves: [],
  cars: {},
  towers: {}
};

//<><><><><><><><><><><><> INIT / SETUP <><><><><><><><><><><><>
function init() {
  // Load sprites.
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

  // Load game data.
  game.map = document.getElementById("map-data").innerHTML.split("\n");
  game.waves = document.getElementById("wave-data").innerHTML.split("\n");
  game.w = game.map[0].length;
  game.h = game.map.length;

  // Setup the canvas.
  canvas = document.getElementById("thecanvas");
  canvas.width = game.w * TILE_WIDTH_HALF + game.h * TILE_WIDTH_HALF;
  canvas.height = scrHeight =
    game.w * TILE_HEIGHT_HALF + game.h * TILE_HEIGHT_HALF;
  context = canvas.getContext("2d");
  game.tilesXStart = (game.h - 1) * TILE_WIDTH_HALF;
}

//<><><><><><><><><><><><> FUNCTIONS <><><><><><><><><><><><>

function drawMap(map) {
  for (let j = 0; j < game.h; j++) {
    for (let i = 0; i < game.w; i++) {
      let spr;
      const gd = game.map[j][i];
      switch (gd) {
        case "p":
          spr = game.sprites.plot;
          break;
        case "r":
          if (i == 3) spr = game.sprites.roadTop1;
          else if (i == 4) spr = game.sprites.roadMid1;
          else spr = game.sprites.roadBottom1;
          break;
        default:
          spr = game.sprites.grass;
      }
      context.drawImage(
        spr,
        game.tilesXStart + i * TILE_WIDTH_HALF - j * TILE_WIDTH_HALF,
        i * TILE_HEIGHT_HALF + j * TILE_HEIGHT_HALF
      );
    }
  }
}

function drawCars(cars) {
  // obj.
  Object.keys(cars).forEach((item, index) => {
    const car = cars[item];
    car.x -= 2;
    car.y += 1;
    context.drawImage(game.sprites.car1, car.x, car.y);
  });
}

function drawBackground() {
  context.fillStyle = BG_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function addCars(waves, index) {
  console.log("ADD CARS!", waves, " ", index, " d.c: ", game.cars);
  if (!waves[index]) return;
  for (let i = 0; i < waves[index].length; i++) {
    if (waves[index][i] != "-") {
      game.cars["c" + index * 3 + i] = {
        x: game.tilesXStart + i * TILE_HEIGHT_HALF,
        y: 160 + i * TILE_HEIGHT_HALF
      };
    }
  }
  setTimeout(() => {
    if (waves[index + 1]) addCars(waves, index + 1);
  }, 3000);
}

//<><><><><><><><><><><><> MAIN GAME LOOP <><><><><><><><><><><><>
init();

// Wave timed offset loop.
addCars(game.waves, 0);

// Animation Loop.
setInterval(() => {
  drawBackground();
  drawMap(game.map);
  drawCars(game.cars);
}, ANIMATION_DELAY);
