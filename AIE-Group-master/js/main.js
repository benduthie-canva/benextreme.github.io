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

var LAYER_COUNT = 6;
var MAP = { tw: 1000, th: 30};
var TILE = 16;
var TILESET_TILE = TILE;
var TILESET_PADDING = 0;
var TILESET_SPACING = 0;
var TILESET_COUNT_X = 16;
var TILESET_COUNT_Y = 22;

// layer variables
var LAYER_BACKGROUND = 0;
var LAYER_BACKGROUND2 = 1;
var LAYER_PLATFORMS = 2;
var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_SPEEDBOOSTS = 4;
var LAYER_OBJECT_TRIGGERS = 5;
var LAYER_OBJECT_ENEMIES2 = 6;
var LAYER_OBJECT_SPEEDPENALTIES = 7;
var LAYER_OBJECT_POGOSTICKS = 8;
var LAYER_OBJECT_GRAVITYPENALTIES = 9;


var worldOffsetX = 10;

 // abitrary choice for 1m
var METER = TILE;
 // gravitational constant
var GRAVITY = METER * 9.8 * 6;
 // max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
 // max vertical speed (15 tiles per second)
var MAXDY = METER* 30;
 // horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
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

var muteMusic = false;
var muteSounds = false;

var musicBackground;
var sfxJump;
var sfxDeath;
var sfxPowerup;
var sfxRun;




// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var highScore = 0;
var player = new Player();
var keyboard = new Keyboard();
var enemies = [];
var powerups = [];
var enemies2 = [];
var camera = new Camera();

var VOLUME = 1;

// loading of images

var logo = document.createElement("img");
logo.src ="images/templogo.png";

var splashBG = document.createElement("img");
splashBG.src = "images/Title Splash BG.png";

var gameOverSplashBG = document.createElement("img");
gameOverSplashBG.src = "images/GameOver Splash BG.png";

var tileset = document.createElement("img");
tileset.src = "images/tileset.png";

var background = document.createElement("img");
background.src = "images/caveedited.png";

var lava = document.createElement("img");
lava.src = "images/somelava.png";

var fireEmitter = createFireEmitter("images/sparkle2.png", (SCREEN_WIDTH/4)*3, SCREEN_HEIGHT-100);
	fireEmitter.minSize = 2;
	fireEmitter.maxSize = 10;
	fireEmitter.minVelocity.set(-5, -5);
	fireEmitter.maxVelocity.set(5, 5);
	fireEmitter.minLife = 0.1;
	fireEmitter.maxLife = 1;



var cells = []; // the array that holds our simplified collision data
function initialize(level1) 
{
	for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) 
	{ // initialize the collision map
		cells[layerIdx] = [];
		var idx = 0;
		for(var y = 1; y < level1.layers[layerIdx].height; y++) 
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
	for(var y = 1; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				
				var type = rand(0, 3);
				
				switch(type)
				{
					case 0:
					enemies.push(new Enemy(px, py));
					break;
					
					case 1:
					enemies.push(new Enemy2(px, py));
					break;
					
					case 2:
					enemies.push(new Enemy3 (px, py));
					break;
				}
				
			}
			idx++;
		}
	} 
	
	idx = 0;
	for(var y = 1; y < level1.layers[LAYER_OBJECT_SPEEDBOOSTS].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_SPEEDBOOSTS].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_SPEEDBOOSTS].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				powerups.push(new Powerup(px, py, 0));
			}
			idx++;
		}
	} 
	
	/*idx = 0;
	for(var y = 1; y < level1.layers[LAYER_OBJECT_ENEMIES2].height; y++)
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES2].width; x++)
		{
			if(level1.layers[LAYER_OBJECT_ENEMIES2].data[idx] != 0)
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				enemies2.push(new Enemy2(px, py));
			}
			idx++;
		}
	}*/
	
	cells[LAYER_OBJECT_TRIGGERS] = [];
	idx = 0;
	for(var y = 1; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++) 
	{
		cells[LAYER_OBJECT_TRIGGERS][y] = [];
		for(var x = 0; x < level1.layers[LAYER_OBJECT_TRIGGERS].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) 
			{
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
			}
			else if(cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) 
			{
				// if we haven't set this cell's value, then set it to 0 now
				cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
			}
			idx++;
		}
	}
	
	idx = 0;
	for(var y = 1; y < level1.layers[LAYER_OBJECT_SPEEDPENALTIES].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_SPEEDPENALTIES].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_SPEEDPENALTIES].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				powerups.push(new Powerup(px, py, 1));
			}
			idx++;
		}
	} 
	

	idx = 0;
	for(var y = 1; y < level1.layers[LAYER_OBJECT_POGOSTICKS].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_POGOSTICKS].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_POGOSTICKS].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				powerups.push(new Powerup(px, py, 2));
			}
			idx++;
		}
	} 
	idx = 0;
	for(var y = 1; y < level1.layers[LAYER_OBJECT_GRAVITYPENALTIES].height; y++) 
	{
		for(var x = 0; x < level1.layers[LAYER_OBJECT_GRAVITYPENALTIES].width; x++) 
		{
			if(level1.layers[LAYER_OBJECT_GRAVITYPENALTIES].data[idx] != 0) 
			{
				var px = tileToPixel(x);
				var py = tileToPixel(y);
				powerups.push(new Powerup(px, py, 3));
			}
			idx++;
		}
	} 
	
	// background music
	musicBackground = new Howl(
		{
			urls: ["sounds/music.mp3"],
			loop: true,
			buffer: true,
			volume: 1 * VOLUME
		}
	)

	sfxJump = new Howl(
	{
		urls: ["sounds/jump.mp3"],
		buffer: true,
		volume: 1 * VOLUME,
		onend: function() 
		{
			isSfxPlaying = false;
		}
	});

	sfxDeath = new Howl(
	{
		urls: ["sounds/death.mp3"],
		buffer: true,
		volume: 1 * VOLUME,
		onend: function()
		{
			isSfxPlaying = false;
		}
	});

	sfxPowerup = new Howl(
	{
		urls: ["sounds/powerup.mp3"],
		buffer: true,
		volume: 1 * VOLUME,
		onend: function()
		{
			isSfxPlaying = false;
		}
	});

	sfxPowerdown = new Howl(
	{
		urls: ["sounds/powerdown.mp3"],
		buffer: true,
		volume: 1 * VOLUME,
		onend: function()
		{
			isSfxPlaying = false;
		}
	});
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
	musicBackground.stop();
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
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
	resetGame();
	gameState = STATE_GAME;
	}

	context.drawImage(splashBG, 0, 0);
	context.font="20px Arial Black";
	context.fillStyle= '#FFD700';
	var message = "Press SPACE"
	var textMeasure = context.measureText(message);
	context.fillText(message, SCREEN_WIDTH/2 - (textMeasure.width/2), SCREEN_HEIGHT-100);	
	player.speed = 0;
	
	if (player.sprite.currentAnimation != ANIM_IDLE_LARGE)
	{
		player.sprite.setAnimation(ANIM_IDLE_LARGE);
	};
	player.position.x = SCREEN_WIDTH/2 - 40;
	player.position.y = SCREEN_HEIGHT/4;
	player.sprite.update(deltaTime);
	player.draw();

	
	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
	resetGame();
	musicBackground.play();
	gameState = STATE_GAME;
	}
}

function runGame(deltaTime)
{
	context.drawImage(background, -camera.origin.x%(background.width*3)/3, 0)
	context.drawImage(background, -camera.origin.x%(background.width*3)/3 + background.width, 0)

	context.drawImage(lava, -camera.origin.x%(lava.width), 480)
	context.drawImage(lava, -camera.origin.x%(lava.width) + lava.width, 480)
	
	
	context.drawImage(logo, 500 - camera.origin.x, 100)
	
	
	if(keyboard.isKeyDown(keyboard.KEY_SQUIGGLE) != true)
	{
		player.update(deltaTime);
	}
	else
	{

		player.sprite.update(deltaTime);
		//camera.updateCamera(deltaTime, 1);
		camera.generateMap(deltaTime, LEVEL);
	}
	
	for (var i = 0; i < enemies.length; i++)
	{
		enemies[i].update(deltaTime);
		if (intersects(player, enemies[i]))
		{
			player.kill();
		}
			
	}
	
	for (var i = 0; i<powerups.length; i++)
	{
		powerups[i].draw();
		if (intersects(player, powerups[i]))
		{
			sfxPowerup.play();
			switch (powerups[i].type)
			{
				case 0: 
					player.timer = 5;
					
					player.playerState = 3;
				

				break;
				case 1:
					player.timer = 7.5;
					
					player.playerState = 4; 
				
				break;
				case 2:
					player.timer = 5;
					
					player.playerState = 8;
				
				break;
				case 3:
				 // less gravity
					player.timer = 5;
					
					player.playerState = 9;
			}
			powerups.splice(i, 1);
			//sfxPowerdown.play();
		}
	}
	
	//drawMap(deltaTime);
	player.draw();
	
	for (var i = 0; i < enemies.length; i++)
	{
		enemies[i].draw(deltaTime);

	}
	
	if (camera.origin.x - player.position.x > 0)
	{
		gameState = STATE_GAMEOVER;
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

	context.fillStyle = "white";
	context.font="32px Yu Gothic";
	var scoreText = "Score: " + player.score;
	context.fillText(scoreText, 400, 50);
	
	if (highScore <= player.score)
	{
		highScore = player.score;
	}
}

function runGameOver()
{	
	context.drawImage(gameOverSplashBG, 0, 0);
	context.fillStyle = "#FFE4C4";
	context.font="36px Arial Black";
	var yourScore = "Your score:";
	var yourScoreMeasure = context.measureText(yourScore);
	context.fillText(yourScore, SCREEN_WIDTH/2 - (yourScoreMeasure.width/2), SCREEN_HEIGHT/2 + 10);

	context.fillStyle = "white";
	context.font="128px Arial Black";
	var scoreText = "Score: " + player.score;
	var textMeasure = context.measureText(player.score);
	context.fillText(player.score, SCREEN_WIDTH/2 - (textMeasure.width/2), SCREEN_HEIGHT/2 + 140);
	var bestScore = player.score;
	context.fillStyle = "#FFD700";
	context.font="48px Arial Black";
	var bestText = "Best run: " + highScore;
	var textMeasureBest = context.measureText(bestText);
	context.fillText(bestText, SCREEN_WIDTH/2 - (textMeasureBest.width/2), SCREEN_HEIGHT - 40);

	context.fillStyle = "#FFE4C4";
	context.font="16px Arial Black";
	var text = "Press SPACE to retry...";
	context.fillText(text, SCREEN_WIDTH/2 + 100, SCREEN_HEIGHT - 5);

	if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
	{
		resetGame();
		gameState = STATE_SPLASH;
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
