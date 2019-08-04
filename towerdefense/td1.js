const TILE_WIDTH = 160;
const TILE_HEIGHT = 80;

class Wave {
  constructor(cars, delay) {
    this.delay = delay;
    this.cars = cars;
    // [1,,1][2,2,][3,,][2,2,2] array pos = lane; # = car type.
    // each set comes a short fixed distance after the other.
  }
  getWave() {
    return { delay: this.delay, cars: this.cars };
  }
}

class Tower {
  constructor(sprite) {
    this.sprite = sprite;
  }
  getTower() {
    return { sprite: this.sprite };
  }
}

class Plot {
  // As in 'Plot of land'.
  constructor(id, location, usable = true, tax = 0) {
    this.id = id;
    this.location = this.calcLocation(location.x, location.y);
    this.usable = usable;
    this.tax = tax;
    this.vacant = true;
    this.tower = null;
  }
  calcLocation(x, y) {
    this.x = x;
    this.y = y;
    this.screenX = TILE_WIDTH / 2 + x * TILE_WIDTH;
    this.screenY = y * TILE_HEIGHT - 80;
  }
  setTower(tower) {
    this.tower = tower;
    this.vacant = false;
  }
  getPlot() {
    return {
      location: this.location,
      isVacant: this.isVacant,
      isUsable: this.isUsable,
      tower: this.tower,
      tax: this.tax
    };
  }
}

class Level {
  constructor(name, waves) {
    this.name = name;
    this.waves = waves;
  }
  getWave(waveIndex) {
    return this.waves[waveIndex];
  }
}

const game = {
  context: null,
  w: 1200, // width in pixels
  h: 800, // height in pixels
  bgColor: "#fa5",
  money: 500,
  tileWidth: 160,
  tileHeight: 80, // height of a tile. buildings are 160
  lives: 10,
  towers: {},
  carIndex: 0, // unique identifier for cars in car obj.
  cars: {},
  plots: [
    new Plot(0, { x: 6, y: 0 }),
    new Plot(1, { x: 5, y: 1 }),
    new Plot(2, { x: 4, y: 2 }),
    new Plot(3, { x: 3, y: 3 }),
    new Plot(4, { x: 2, y: 4 }),
    new Plot(5, { x: 1, y: 5 }),
    new Plot(6, { x: 0, y: 6 }),
    new Plot(7, { x: 6, y: 4 }),
    new Plot(8, { x: 5, y: 5 }),
    new Plot(9, { x: 4, y: 6 }),
    new Plot(10, { x: 3, y: 7 }),
    new Plot(11, { x: 2, y: 8 }),
    new Plot(12, { x: 1, y: 9 })
  ], // 13
  currentLevel: 0,
  currentWave: 0,
  currentWaveRow: 0,
  levels: [
    new Level("One", [
      new Wave([[3, 0, 1], [0, 2, 0], [2, 1, 3]], 4),
      new Wave([[2, 0, 1], [1, 2, 0], [2, 1, 0]], 7),
      new Wave([[3, 0, 0], [1, 3, 0], [3, 2, 0]], 5),
      new Wave([[3, 2, 1], [1, 0, 3], [3, 3, 0]], 6),
      new Wave([[3, 0, 3], [1, 2, 3], [3, 1, 3]], 7)
    ]),
    new Level("Two", [
      new Wave([[0, 0, 1], [1, 0, 0], [0, 1, 0]], 10),
      new Wave([[2, 0, 1], [1, 2, 0], [2, 1, 0]], 5),
      new Wave([[3, 0, 0], [1, 3, 0], [3, 2, 0]], 4),
      new Wave([[3, 2, 1], [1, 0, 3], [3, 3, 0]], 4),
      new Wave([[3, 0, 3], [1, 2, 3], [3, 1, 3]], 9)
    ])
  ]
};

class Car {
  constructor(sprite, lane) {
    this.x = game.w;
    this.y = 20 + lane * 80;
    this.lane = lane; // 1,2,3 1=upper lane, 3=lower lane..
    this.sprite = sprite;
    this.w = 104;
    this.h = 69;
    this.midW = 52;
    this.midH = 35; // ~
  }
}

function drawBg(context) {
  // context.fillRect(0, 0, game.w, game.h);
  context.drawImage(sprites.bg, 0, 0);
}

const sprites = {};

function moveCar(cars, index) {
  car = cars[index];
  car.x -= 2;
  car.y += 1;
  //console.log("carw: ", -car.w, " gh: ", game.h, " carxy: ", car.x, "/", car.y);
  if (car.x < -car.w || car.y > game.h) {
    delete cars[index];
    // console.log("cars: ", cars); // show cars currently still active.
  }
}

function drawPlot(plotIndex, game) {
  game.context.drawImage(
    game.plots[plotIndex].tower.sprite,
    game.plots[plotIndex].screenX,
    game.plots[plotIndex].screenY
  );
}

function drawCar(car, context) {
  context.drawImage(car.sprite, car.x, car.y);
}

window.onload = () => {
  // Get sprites from dom.
  sprites.car1 = document.getElementById("car-taxi");
  sprites.car2 = document.getElementById("car-purple");
  sprites.car3 = document.getElementById("car-police");

  sprites.bg = document.getElementById("bg");

  game.towers.tower1 = new Tower(document.getElementById("tower1"));
  game.towers.tower2 = new Tower(document.getElementById("tower2"));
  game.towers.tower3 = new Tower(document.getElementById("tower3"));

  // Creating game plots manually.
  game.plots[4].setTower(game.towers.tower1);
  game.plots[2].setTower(game.towers.tower2);
  game.plots[8].setTower(game.towers.tower1);
  game.plots[11].setTower(game.towers.tower3);

  // Init/setup canvas and context
  const canvas = document.getElementById("thecanvas");
  canvas.width = game.w;
  canvas.height = game.h;
  game.context = canvas.getContext("2d");
  // game.context.fillStyle = game.bgColor;

  // flatten all levels/waves/rows into rows with delays.
  const rows = [];
  let delay = 0;
  let msg;
  let cars;
  for (let l = 0; l < game.levels.length; l++) {
    const lvl = game.levels[l];
    msg = lvl.name ? "Level " + lvl.name : null;
    for (let w = 0; w < lvl.waves.length; w++) {
      msg = msg ? msg + " - " : "";
      msg += "Wave " + (w + 1);
      const wav = lvl.waves[w]; // a wave of rows.
      delay = wav.delay;
      for (let r = 0; r < wav.cars.length; r++) {
        rows.push({ cars: wav.cars[r], delay, msg });
        msg = "";
        delay = 1000;
      }
    }
  }

  function sendWaves(theRows, index) {
    console.log("Index: ", index);
    const row = theRows[index];
    setTimeout(() => {
      addCars(game, row);
      if (theRows[index + 1]) sendWaves(theRows, index + 1);
      else {
        sendWaves(theRows, 0);
      }
    }, row.delay);
  }
  sendWaves(rows, 0);

  // Main game loop.
  setInterval(() => {
    // Draw background.
    drawBg(game.context);

    // Draw ildings ABOVE the highway
    for (let i = 0; i < 7; i++) {
      if (!game.plots[i].vacant) drawPlot(i, game);
    }

    // Move cars.
    Object.keys(game.cars).forEach((item, index) => {
      //   console.log("item: ", item, " index: ", index, " gc: ", game.cars[item]);
      moveCar(game.cars, item); // draw by lane # low to high ??
    });

    // Draw cars.
    Object.keys(game.cars).forEach((item, index) => {
      //   console.log("item: ", item, " index: ", index, " gc: ", game.cars[item]);
      drawCar(game.cars[item], game.context); // draw by lane # low to high ??
    });

    // Draw buildings BELOW the highway
    for (let i = 7; i < game.plots.length; i++) {
      if (!game.plots[i].vacant) drawPlot(i, game);
    }
  }, 10);
};

function addCars(game, row) {
  waveRow = row.cars;
  if (row.msg) {
    toast(row.msg);
  }
  if (waveRow[0])
    game.cars["c" + game.carIndex++] = new Car(sprites["car" + waveRow[0]], 0);
  if (waveRow[1])
    game.cars["c" + game.carIndex++] = new Car(sprites["car" + waveRow[1]], 1);
  if (waveRow[2])
    game.cars["c" + game.carIndex++] = new Car(sprites["car" + waveRow[2]], 2);
}

function toast(msg) {
  document.getElementById("toast").innerHTML = "[" + msg + "]";
  setTimeout(() => {
    document.getElementById("toast").innerHTML = "[]";
  }, 1500);
}
