var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our 
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	
		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}

//-------------------- Don't modify anything above here
// CONSTANT VARIABLE DECLARATIONS
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var LAYER_COUNT = 3;
var MAP = { tw: 60, th: 15};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;

var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

 // abitrary choice for 1m
var METER = TILE;
 // very exaggerated gravity (6x)
var GRAVITY = METER * 9.8 * 6;
 // max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
 // max vertical speed (15 tiles per second)
var MAXDY = METER * 15;
 // horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
 // horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
 // (a large) instantaneous jump impulse
var JUMP = METER * 1500;

// Gamestate variables
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_DEATH = 3;
var STATE_SCORES = 4;
var STATE_WIN = 5;

var gameState = STATE_SPLASH;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

var musicBackground;
var sfxFire;

var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;







// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var deathTimer = 0;

var player = new Player();
var keyboard = new Keyboard();
var bullets = []
var enemies = []

// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

var tileset = document.createElement("img");
tileset.src = "tileset.png";

var heartImage = document.createElement("img");
heartImage.src = "heart.png";









var cells = []; // the array that holds our simplified collision data
function initialize() 
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
	{ // initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 0; y < level1.layers[layerIdx].height; y++) 
		{
			cells[layerIdx][y] = [];
			for(var x = 0; x < level1.layers[layerIdx].width; x++) 
			{
				if(level1.layers[layerIdx].data[idx] != 0) 
				{
					// for each tile we find in the layer data, we need to create 4 collisions
					// (because our collision squares are 35x35 but the tile in the
					// level are 70x70)
					cells[layerIdx][y][x] = 1;
					cells[layerIdx][y-1][x] = 1;
					cells[layerIdx][y-1][x+1] = 1;
					cells[layerIdx][y][x+1] = 1;
				}
				else if(cells[layerIdx][y][x] != 1) 
				{
				// if we haven't set this cell's value, then set it to 0 now
				cells[layerIdx][y][x] = 0;
				}
				
				idx++;
			}
		}
	}
	
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				var e = new Enemy(px, py);
				enemies.push(e);
			}
			idx++;
		}
	} 
	
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++) 
	{
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) 
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
				cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) 
			{
				// if we haven't set this cell's value, then set it to 0 now
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
	
	musicBackground = new Howl
	(
		{
			urls: ["background.ogg"],
			loop: true,
			buffer: true,
			volume: 0.5
		} 
	);
	
	musicBackground.play();
	sfxFire = new Howl
	(
		{
			urls: ["fireEffect.ogg"],
			buffer: true,
			volume: 1,
			onend: function() 
			{
				isSfxPlaying = false;
			}
		}
	);

}

function intersects(o1, o2)
{
	if(o2.position.y + o2.height/2 < o1.position.y - o1.height/2 || o2.position.x + o2.width/2 < o1.position.x - o1.width/2 ||	o2.position.x - o2.width/2 > o1.position.x + o1.width/2 || o2.position.y - o2.height/2 > o1.position.y + o1.height/2)
	{
		//draws collision boxes for testing
		//context.fillRect(o2.position.x - o2.width/2 - worldOffsetX, o2.position.y - o2.height/2, o2.width, o2.height)
		//context.fillRect(o1.position.x - o1.width/2 - worldOffsetX, o1.position.y - o1.height/2, o1.width, o1.height)
		return false;
	}
	return true;
}

function cellAtPixelCoord(layer, x,y)
{
	if(x<0 || x>SCREEN_WIDTH || y<0)
	return 1;
	// let the player drop of the bottom of the screen (this means death)
	if(y>SCREEN_HEIGHT)
	return 0;
	return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
	if(tx<0 || tx>=MAP.tw || ty<0)
	return 1;
	// let the player drop of the bottom of the screen (this means death)
	if(ty>=MAP.th)
	return 0;
	return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
	return tile * TILE;
};

function pixelToTile(pixel)
{
	return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
	if(value < min)
	return min;
	if(value > max)
	return max;
	return value;
};


function drawMap()
{
	var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
	var tileX = pixelToTile(player.position.x);
	var offsetX = TILE + Math.floor(player.position.x%TILE);
	startX = tileX - Math.floor(maxTiles / 2);
	
	if(startX < -1)
	{
		startX = 0;
		offsetX = 0;
	}
	
	if(startX > MAP.tw - maxTiles)
	{
		startX = MAP.tw - maxTiles + 1;
		offsetX = TILE;
	}
		
		worldOffsetX = startX * TILE + offsetX;
	for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
	{
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			var idx = y * level1.layers[layerIdx].width + startX;
			for( var x = startX; x < startX + maxTiles; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
					// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
					// so subtract one from the tileset id to get the
					// correct tile
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
					(TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
					(TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
					(x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}

function runSplash(deltaTime)
{
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
		gameState = STATE_GAME;
	}

	context.font="20px Georgia";
	context.fillStyle= '#000000';
	context.fillText("Splash Screen   ", 10, 20);
	context.fillText("Press space to play   ", 10, 50);
	
	

}

function runWin (deltaTime)
{
	context.font="20px Georgia";
	context.fillStyle= '#000000';
	context.fillText ("You've Won!", 10, 20);
}

function runGameOver(deltaTime)
{
	//game over image

	context.font="20px Georgia";
	context.fillStyle= '#000000';
	context.fillText("Game over man, GAME OVER", 10, 20);
	deathTimer -= deltaTime;
	if (deathTimer <= 0)
	{
		player = new Player();
		
		gameState = STATE_SPLASH
		bullets.splice(0, bullets.length)
		enemies.splice(0, enemies.length)
		initialize();
	}
}

function runDeath(deltaTime)
{
	context.font="20px Georgia";
	context.fillStyle= '#000000';
	context.fillText("You died", 10, 20);
	context.fillText(Math.floor(deathTimer) + 1, 10, 50);
	if (player.lives == 0)
	{
		gameState = STATE_GAMEOVER
	}
	else if (deathTimer > 0)
	{
		deathTimer -= deltaTime;
		player.position.x = canvas.width/2;
		player.position.y = 200;
		context.font="20px Georgia";
		context.fillStyle= '#000000';
		context.fillText("You died", 10, 20);
		context.fillText(Math.floor(deathTimer) + 1, 10, 50);
	}
	else
	{
		player.position.x = canvas.width/2;
		player.position.y = 200;
		player.lives -= 1;
		gameState = STATE_GAME;
	}
}



function run()
{
	// canvas background
	context.fillStyle = "#ccc";
	context.fillRect(0, 0, canvas.width, canvas.height);
	var deltaTime = getDeltaTime();
	
	switch (gameState)
	{
		case STATE_SPLASH:
		runSplash(deltaTime);
		break;	

		case STATE_GAMEOVER:
		runGameOver(deltaTime);
		break;	
		
		case STATE_DEATH:
		runDeath(deltaTime);
		break;
		
		case STATE_WIN:
		runWin(deltaTime);
		break;
			
		case STATE_GAME:

		// update and draw sprites

		
		
		// loop for updating all bullets
		
		context.fillStyle = "yellow";
		context.font="32px Arial";
		context.fillText("Score: " + player.score, SCREEN_WIDTH - 170, 35);
		
		
		
	
		
		
		
		player.update(deltaTime);

		
		drawMap();
		
		for(var i=0; i<player.lives; i++)
		{
			context.drawImage(heartImage, 20 + ((heartImage.width+2)*i), 450);
		}
		
		for (var i = 0; i<bullets.length; i++)
		{
			bullets[i].draw();

		}
		for (var i = 0; i<enemies.length; i++)
		{

		}
		
		for (var a = 0; a<enemies.length; a++)
		{
			enemies[a].update(deltaTime);

			for (var i = 0; i<bullets.length; i++)
			{
				bullets[i].update(deltaTime);

				if (intersects(bullets[i], enemies[a]) == true)
				{
					enemies.splice(a, 1);
					bullets.splice(i, 1);
					player.score += 1
					break;
				}
				bullets[i].draw				
			}			
		}
		
		for (var a = 0; a<enemies.length; a++)
		{			
			if (intersects(player, enemies[a]) == true)
			{
				gameState = STATE_DEATH;
				deathTimer = 2.5;
				enemies.splice(0, enemies.length);
				initialize();
				

				break;
			}
			enemies[a].draw();
		}
		
		player.draw();


		// update the frame counter
		fpsTime += deltaTime;
		fpsCount++;
		if(fpsTime >= 1)
		{
			fpsTime -= 1;
			fps = fpsCount;
			fpsCount = 0;
		}
		// draw the FPS
		context.fillStyle = "#f00";
		context.font="14px Arial";
		context.fillText("FPS: " + fps, 5, 20, 100);
		
		if (player.position.y > SCREEN_HEIGHT)
		{
			gameState = STATE_DEATH;
			deathTimer = 2.5;
		}
		
		
		
		
		
		
		break;
	}
}

initialize();




















//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
