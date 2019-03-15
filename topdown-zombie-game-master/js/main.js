var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function was last called
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

var LEVEL = level1;

var LAYER_COUNT = 4;
var MAP = { tw: 100, th: 100};
var TILE = 16;
var TILESET_TILE = TILE;
var TILESET_PADDING = 0;
var TILESET_SPACING = 0;
var TILESET_COUNT_X = 20;
var TILESET_COUNT_Y = 18;

// layer variables
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_OBJECT_ENEMIES = 2;
var LAYER_ENEMY_PATHING = 3;

var debugMode = true;



var worldOffsetX = 10;

 // abitrary choice for 1m
var METER = TILE;
 // gravitational constant
var GRAVITY = METER * 9.8 * 6;
 // max horizontal speed (10 tiles per second)
var MAXDX = METER * 4;
 // max vertical speed (15 tiles per second)
var MAXDY = METER* 4;
 // horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 10;
 // horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
 // (a large) instantaneous jump impulse
var JUMP = METER * 3000;

// enemy variables
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;


// Gamestate variables
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;


var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var players = [];
players.push(new Player());/*
players.push(new Player());
players.push(new Player());
players.push(new Player());
players.push(new Player());
players.push(new Player());*/

var currentPlayer = 0;

var keyboard = new Keyboard();
var camera = new Camera();

var enemies = [];

var object = [];
	
	object.x = 100;
	object.y = 100;
	object.velX = 5;

var VOLUME = 1;

//var image = document.createElement("img");
//image.src ="images/templogo.png";

var tileset = document.createElement("img");
tileset.src ="tileset.png";

var cells = []; // the array that holds our simplified collision data
function initialize(level1) 
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
					// MADE ADJUSTMENT HERE due to there no longer needing 4 squares of collision. AP
					cells[layerIdx][y][x] = 1;
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
				enemies.push(new Enemy(px, py));
			}
			idx++;
		}
	} 
	
	
	// background music
	/*
	musicBackground = new Howl
	(
		{
			urls: ["sounds/music.mp3"],
			loop: true,
			buffer: true,
			volume: 1 * VOLUME
		}
	)
	*/


}

function intersects(o1, o2)
{
	if(o2.position.y + o2.height/2 < o1.position.y - o1.height/2 || o2.position.x + o2.width/3 < o1.position.x - o1.width/3 ||	o2.position.x - o2.width/3 > o1.position.x + o1.width/3 || o2.position.y - o2.height/2 > o1.position.y + o1.height/2)
	{
		//draws collision squares for testing
		//context.fillRect(o2.position.x - o2.width/2 - camera.worldOffsetX, o2.position.y - o2.height, o2.width, o2.height)
		//context.fillRect(o1.position.x - o1.width/2 - camera.worldOffsetX, o1.position.y - o1.height, o1.width, o1.height)
		return false;
	}
	return true;
}

// coordinates and collision detection functions. Don't change
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
	if(tx<0 || tx>=MAP.tw || ty<=0)
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

// easy access function to
function resetGame()
{
	//highScore = player.score;
	player = new Player();
	camera = new Camera(); 
	enemies.splice(0, enemies.length);
	//musicBackground.stop();
	initialize(LEVEL);
}

function rand(floor, ceil)
{
	return Math.floor((Math.random() * (ceil-floor)) + floor);
}

// function draws map to screen. Is called every frame.
function drawMap(deltaTime)
{
}

// menu/splash function. runs every frame.
function runSplash(deltaTime)
{
	
	
	
	resetGame();
	
	gameState = STATE_GAME;
	
}

function runGame(deltaTime)
{
	camera.updateCamera(deltaTime);

	camera.generateMap(deltaTime, players[currentPlayer]);	
		object.x += object.velX;
		
	

	players[currentPlayer].update(deltaTime);
	
	for (var i = 0; i<players.length; i++)
	{
		players[i].draw();
	}
	
	
	
	// TESTING FOR LINE OF SIGHT SYSTEM
	/*
	if (object.x > 500)
		object.velX = -5;
	else if (object.x < 100)
		object.velX = 5;
	var objectDistance = Math.sqrt(Math.pow(object.x - player.position.x,2)+Math.pow(object.y - player.position.y,2))
	
	var m = (object.y - player.position.y) / (object.x - player.position.x);
	var c = player.position.y - m * player.position.x;
	var domain =  player.position.x - object.x;
	var range = player.position.y - object.y;
	
	for (var i =0; i<50; i++)
	{
		var x = i * (domain/50) + object.x;
		
		// IF STATEMENT as if the two objects have the same x coord, therefore the line is vertical. vertical lines have infinite gradients and y intercepts. 
		// If line is vertical, simply spread boxes out vertically instead of based on a formula of a line.
		if (object.x != player.position.x)
		var y = (m * x + c);
		else
		var y = i *(range/50) + object.y; // multiplied by i instead of x as when line is vertical, x will be 0 essentially and fuck everything
		
		var tx = pixelToTile(x);
		var ty = pixelToTile(y);
		
		context.fillStyle = "black"
		if (cellAtTileCoord(LAYER_PLATFORMS, tx, ty))
		context.fillStyle = "red"
		
		context.fillRect(tx*TILE - camera.worldOffsetX,ty*TILE - camera.worldOffsetY,TILE,TILE)
		context.fillStyle = "yellow"
		
		context.fillRect(x - camera.worldOffsetX,y - camera.worldOffsetY,5,5)
	}*/
	
	for(var i=0; i<enemies.length; i++)
	{
		enemies[i].update(deltaTime);
		enemies[i].draw(deltaTime);
	}
	
	
	
	

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
}

function runGameOver()
{	
	
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

			
		case STATE_GAME:	
		runGame(deltaTime);
		break;
		
		case STATE_GAMEOVER:
		runGameOver(deltaTime);
		break;
	}
}

initialize(LEVEL);






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
