class Player {
  constructor() {}
}

const MAX_SPEED = 20;

const game = {
  level: [],
  tileWidth: 50, // pixels.
  tileHeight: 50,
  MAX_SPEED,
  player: {
    x: 0,
    y: 0,
    xDir: 1, // 1 or -1
    yDir: 1, //1 or -1
    xSpeed: 4,
    ySpeed: 1,
    gravity: 2, // amount to increase.
    jump: MAX_SPEED * -1,
    grounded: false, // no y movement. on a surface.
    stopped: false, // no x movement.
    accelerate: 1, // elements can affect this value.
    decelerate: 1,
    health: 100,
    sprite: null
  },
  sprites: {
    tiles: [null],
    player: null
  },
  screen: {
    width: 1800,
    height: 600
  }
};

// Hold keyboard keys status.
const keyboard = {};
document.onkeydown = e => {
  keyboard[e.keyCode] = 1;
  console.log("keyboard: ", keyboard);
};
document.onkeyup = e => {
  delete keyboard[e.keyCode];
};

const handleInput = () => {
  // 37 - 40
};

const playerGravity = () => {
  const p = game.player;
  let newYSpeed;
  let newXSpeed;

  // Set the new (accel/decel) speed.
  if (p.ySpeed + p.gravity <= game.MAX_SPEED) {
    newYSpeed = p.ySpeed + p.gravity;
  } else {
    newYSpeed = game.MAX_SPEED;
  }

  // Reduce Y speed until it doesn't cause a collision.
  while (collisionDetection(p, newYSpeed, "y") && newYSpeed > 0) {
    newYSpeed = Math.floor(newYSpeed / 2);
    // console.log("y - collision");
  }

  newXSpeed = p.xSpeed;

  // Reduce X speed until it doesn't cause a collision.
  if (p.xSpeed > 0) {
    while (collisionDetection(p, newXSpeed, "x") && newXSpeed > 0) {
      newXSpeed = Math.floor(newXSpeed / 2);
      console.log("new x speed: ", newXSpeed);
    }
  } else if (p.xSpeed < 0) {
    while (collisionDetection(p, newXSpeed, "x") && newXSpeed < 0) {
      newXSpeed = Math.floor(newXSpeed / 2);
      console.log("new x speed: ", newXSpeed);
    }
  }

  if (newYSpeed === 0 && p.ySpeed > 0) {
    //newYSpeed = p.jump;
    newYSpeed = 0;
  }

  if (newXSpeed === 0 && p.xSpeed > 0) {
    console.log("SVITCH!");
    newXSpeed = 5 * p.xSpeed * -1;
  }

  p.ySpeed = newYSpeed;
  p.y += p.ySpeed;
  p.xSpeed = newXSpeed;
  p.x += p.xSpeed;

  stats.innerHTML = "x speed: " + p.xSpeed + "y speed: " + p.ySpeed;
};

const collisionDetection = (player, speed, xy) => {
  const p = player;
  let collision = false;

  // Top/bottom, left/right, xy values for current and potential next frame.
  const top = p.y;
  const bottom = p.y + game.tileHeight;
  const bottomNextFrame = bottom + speed;
  const topNextFrame = top + speed;
  const left = p.x;
  const right = p.x + game.tileWidth;
  const rightNextFrame = right + speed;
  const leftNextFrame = left + speed;

  for (let i = 0; i < game.level.length; i++) {
    // Test every game tile for potential collision.
    const tile = game.level[i];
    if (
      xy === "y" &&
      checkNear(left, tile.x) &&
      checkNear(bottomNextFrame, tile.y) &&
      tile.tileType !== 0
    ) {
      // Tile is near enough to collide.
      // Check that one of its points reside within the compared level tile.
      if (
        pointRectCollision(left, bottomNextFrame, tile) ||
        pointRectCollision(right, bottomNextFrame, tile) ||
        pointRectCollision(left, topNextFrame, tile) ||
        pointRectCollision(right, topNextFrame, tile)
      ) {
        collision = true;
        break;
      }
    }

    if (
      xy === "x" &&
      (checkNear(top, tile.y) || checkNear(bottom, tile.y + game.tileHeight)) &&
      (checkNear(rightNextFrame, tile.x) ||
        checkNear(leftNextFrame, tile.x + game.tileWidth)) &&
      tile.tileType !== 0
    ) {
      // Tile is near enough to collide.
      // Check that one of its points reside within the compared level tile.
      if (
        pointRectCollision(leftNextFrame, top, tile) ||
        pointRectCollision(leftNextFrame, bottom, tile) ||
        pointRectCollision(rightNextFrame, top, tile) ||
        pointRectCollision(rightNextFrame, bottom, tile)
      ) {
        console.log("COL!");
        collision = true;
        break;
      }
    }
  }

  //   stats.innerHTML = "Collision: " + collision;
  return collision;
};

// Checks to see if a sprite (either x or y) has potential to overlap.
const checkNear = (a, b) => {
  return Math.abs(a - b) < game.tileWidth;
};

// Checks to see if a point exists inside a rectangle.
const pointRectCollision = (x, y, rectangle) => {
  const left = rectangle.x;
  const right = rectangle.x + game.tileWidth;
  const top = rectangle.y;
  const bottom = rectangle.y + game.tileHeight;
  if (x >= left && x <= right && y >= top && y <= bottom) {
    return true;
  }
  return false;
};

let stats;

window.onload = e => {
  // Setup Canvas.
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  canvas.width = game.screen.width;
  canvas.height = game.screen.height;

  stats = document.getElementById("stats");

  // Load sprite images.
  game.sprites.tiles[1] = document.getElementById("sprite_tile");
  game.player.sprite = document.getElementById("sprite_player");

  // Load game data from dom element into game object's level array.
  const gameLevelData = document
    .getElementById("gameLevelData")
    .innerHTML.split("\n");

  // Parse game data.
  let levelLoadIndex = 0;
  gameLevelData.forEach((row, rowIndex) => {
    row.split("").forEach((tileType, tileIndex) => {
      // Set the player with P
      if (tileType === "P") {
        game.player.x = tileIndex * game.tileWidth;
        game.player.y = rowIndex * game.tileHeight;
      }
      // values 1-9 are tiles. 0 is background/blank.
      game.level[levelLoadIndex++] = {
        x: tileIndex * game.tileWidth,
        y: rowIndex * game.tileHeight,
        tileType: isNaN(tileType) ? 0 : parseInt(tileType)
      };
    });
  });

  //   console.log("gameLevelData: ", gameLevelData);
  //   console.log("game.level: ", game.level);

  setInterval(() => {
    playerGravity();

    handleInput();

    // Draw.
    // \_Background.
    ctx.fillRect(0, 0, game.screen.width, game.screen.height);
    // \_Level.
    game.level.forEach((tile, index) => {
      if (tile.tileType !== 0)
        ctx.drawImage(game.sprites.tiles[tile.tileType], tile.x, tile.y);
    });
    // \_Player.
    ctx.drawImage(game.player.sprite, game.player.x, game.player.y);
  }, 30);
};
