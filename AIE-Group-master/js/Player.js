var ANIM_WALK_RIGHT = 0;
var ANIM_IDLE_RIGHT = 1;
var ANIM_DEATH_RIGHT = 2;
var ANIM_JUMP_RIGHT = 3;
var ANIM_IDLE_LARGE = 4;
var ANIM_POGOSTICK = 5;
var ANIM_SPEEDBOOST = 6;
var ANIM_SPEED_IDLE = 7;
var ANIM_SPEED_JUMP = 8;

var ANIM_MAX = 9;

var RUN = 1;
var DEAD = 2;
var SPEED_BOOST = 3;
var SPEED_SLOW = 4;
var JUMP_BOOST = 5;
var JUMP_PENALTY = 6;
var STUCK_RUNNING = 7;
var POGOSTICK = 8;
var LESS_GRAVITY = 9;



var Player = function() 
{
	this.sprite = new Sprite("images/skeletonTEMP.png");
	this.sprite.buildAnimation(5, 4, 36, 48, 0.1,[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	this.sprite.buildAnimation(5, 4, 36, 48, 0.1,[11, 12, 13, 14]);
	this.sprite.buildAnimation(5, 4, 36, 48, 0.25,[15, 16, 17, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19]);

	this.sprite.buildAnimation(5, 4, 36, 48, 0.1, [0]);
	this.sprite.buildAnimation(2, 4, 90, 96, 0.25,[4, 5, 6, 7]);
	this.sprite.buildAnimation(5, 5, 36, 96, 0.25,[20]);
	this.sprite.buildAnimation(5, 4, 36, 96, 0.075,[25, 26, 27, 28, 29, 30, 31, 32, 33, 34]);
	this.sprite.buildAnimation(5, 4, 36, 96, 0.1,[36, 37, 38, 39]);
	this.sprite.buildAnimation(5, 4, 36, 48, 0.075,[70]);

	
	for(var i=0; i<ANIM_MAX; i++)
	{
		this.sprite.setAnimationOffset(i, 0, 5);
	}	
	
	
	this.width = 36;
	this.height = 48;
	
	this.position = new Vector2(0, 0);
	this.position.set(100, 300);
	
	this.velocity = new Vector2(0, 5);

	this.falling = true;
	this.jumping = false;
	this.dead = false;
	this.score = 0;
	this.lives = 3;
	this.sprite.setAnimation(ANIM_WALK_RIGHT);
	
	
	this.speed = 1;
	this.distance = 0;
	
	//TODO score system
	this.score = 0;
	this.playerState = RUN;
	this.dead = false;
	
	this.timer = 1;
	
	this.totalTime = 0;
	};
	
	
Player.prototype.update = function(deltaTime)
{
	if (this.timer < 0)
	{
		this.playerState = RUN;
		//sfxPowerdown.play();
	}
	else	
		this.timer -= deltaTime;
	
	switch(this.playerState)
	{
		case DEAD:
		
			if (this.timer <= 0)
			{
				gameState = STATE_GAMEOVER;
			}
		
			if (this.sprite.currentAnimation != ANIM_DEATH_RIGHT)
			this.sprite.setAnimation(ANIM_DEATH_RIGHT);
			
			this.speed = 0;
			this.movement(deltaTime, 0, MAXDY/8, GRAVITY);
			this.sprite.update(deltaTime);
			
			

		break;
		
		case RUN:
			this.speed = 1;
			this.right = true;
			this.sprite.update(deltaTime);
			camera.updateCamera(deltaTime, 1);
			this.animations(deltaTime);
			this.movement(deltaTime, MAXDX, MAXDY, GRAVITY);
		break;
		
		case SPEED_BOOST:
			this.speed = 1;
			this.right = true;
			this.sprite.update(deltaTime);
			camera.updateCamera(deltaTime, 1);
			
			this.animationsSpeedBoost(deltaTime);
			this.movement(deltaTime, MAXDX * 2, MAXDY, GRAVITY);
			
			if (this.timer < 0)
			{
				sfxPowerdown.play();
			}
			
		break;
		
		
		case SPEED_SLOW:
			this.speed = 0.5;
			this.right = true;
			this.sprite.update(deltaTime);
			camera.updateCamera(deltaTime, 0.5);

			
			this.animations(deltaTime);
			this.movement(deltaTime, MAXDX, MAXDY, GRAVITY);
		break;	
		
		case POGOSTICK:
			this.speed = 1;
			this.right = true;
			this.sprite.update(deltaTime);

			camera.updateCamera(deltaTime, 1);
			
			this.animations(deltaTime);
			this.sprite.setAnimation(ANIM_POGOSTICK);
			this.movement(deltaTime, MAXDX, MAXDY * 1.5, GRAVITY);
		break;
		
		case LESS_GRAVITY:
			this.speed = 1;
			this.right = true;
			camera.updateCamera(deltaTime, 1);

			this.sprite.update(deltaTime);
			this.animations(deltaTime);
			this.movement(deltaTime, MAXDX, MAXDY * 1.25, GRAVITY/2);
		break;
			

	}
	camera.generateMap(deltaTime, LEVEL);

	if (this.playerState != RUN && this.playerState != DEAD)
	{
		this.totalTime = this.totalTime + deltaTime*5;

		fireEmitter.position.y = this.position.y - this.height/2 + (20*(Math.cos(this.totalTime*3)));
		fireEmitter.position.x = this.position.x + (20*(Math.sin(this.totalTime*3)));
		fireEmitter.update(deltaTime);

		
		fireEmitter.draw();

	}
	else 
	fireEmitter.particles.splice(0, fireEmitter.particles.length)
}


Player.prototype.animations = function(deltaTime)
{
	if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true && !this.falling)
	{
		this.speed += 0.25;
		if (this.sprite.currentAnimation != ANIM_WALK_RIGHT)
		{
			this.sprite.setAnimation(ANIM_WALK_RIGHT);
		}
			
	}

	else if (keyboard.isKeyDown(keyboard.KEY_LEFT) == true )
	{
		this.speed = 0;
		if (this.sprite.currentAnimation != ANIM_IDLE_RIGHT && !this.falling && !this.jumping)
		{
			this.sprite.setAnimation(ANIM_IDLE_RIGHT)
		}
	}
	
	else if (this.sprite.currentAnimation != ANIM_WALK_RIGHT  && !this.falling && !this.jumping && !this.dead)
	{
		this.sprite.setAnimation(ANIM_WALK_RIGHT);
	}
	
	
}

Player.prototype.animationsSpeedBoost = function(deltaTime)
{
	if (keyboard.isKeyDown(keyboard.KEY_RIGHT) == true && !this.falling)
	{
		this.speed += 0.25;
		if (this.sprite.currentAnimation != ANIM_SPEEDBOOST)
		{
			this.sprite.setAnimation(ANIM_SPEEDBOOST);
		}
	}

	else if (keyboard.isKeyDown(keyboard.KEY_LEFT) == true )
	{
		this.speed = 0;
		if (this.sprite.currentAnimation != ANIM_SPEED_IDLE && !this.falling && !this.jumping)
		{
			this.sprite.setAnimation(ANIM_SPEED_IDLE)
		}
	}
	
	else if (this.sprite.currentAnimation != ANIM_SPEEDBOOST  && !this.falling && !this.jumping && !this.dead)
	{
		this.sprite.setAnimation(ANIM_SPEEDBOOST);
	}
	
	
}




Player.prototype.movement = function(deltaTime, MAXDX, MAXDY, GRAVITY)
{
	this.jump = false;
	if (keyboard.isKeyDown(keyboard.KEY_SPACE) == true && !this.falling && !this.jumping && this.dead == false)
	{
		this.jump = true
	}
	
	if (this.playerState == POGOSTICK && !this.jumping && !this.falling)
		this.jump = true;
	
	if (!this.dead)
		this.right = true
	
	//right = true;
	
	// player is always going right in our game.
	var wasleft = this.velocity.x < 0;
	var wasright = this.velocity.x > 0;
	var falling = this.falling;
	var ddx = 0; // acceleration
	var ddy = GRAVITY;

	if (this.left)
	ddx = ddx - ACCEL; // player wants to go left
	else if (wasleft)
	ddx = ddx + FRICTION; // player was going left, but not any more
	if (this.right)
	ddx = ddx + ACCEL; // player wants to go right
	else if (wasright)
	ddx = ddx - FRICTION; // player was going right, but not any more
	if (this.jump && !this.jumping && !falling)
	{
		
		sfxJump.play()
		
		// apply an instantaneous (large) vertical impulse
		ddy = ddy - JUMP;
		this.jumping = true;
		if (this.playerState != SPEED_BOOST)
		this.sprite.setAnimation(ANIM_JUMP_RIGHT)
		else
		this.sprite.setAnimation(ANIM_SPEED_JUMP)

	}

	// calculate the new position and velocity:
	this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX * this.speed, MAXDX * this.speed);
	this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);
	
	this.collisionDetection();
	
		// calculate the new position and velocity:
	this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
	this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
	this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX * this.speed, MAXDX * this.speed);
	this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);
	this.score = Math.floor(camera.origin.x/TILE);
	if ((wasleft && (this.velocity.x > 0)) ||
	(wasright && (this.velocity.x < 0)))
	{
		// clamp at zero to prevent friction from making us jiggle side to side
		this.velocity.x = 0;
	}
		this.collisionDetection();
	
	this.cheats();


	
	

	
}



Player.prototype.collisionDetection = function()
{
		var tx = pixelToTile(this.position.x);
	var ty = bound(pixelToTile(this.position.y), 1, 30);
	var nx = (this.position.x)%TILE; // true if player overlaps right
	var ny = (this.position.y)%TILE; // true if player overlaps below
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
	var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
	var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
	

	
	
	
	// If the player has vertical velocity, then check to see if they have hit a platform
	// below or above, in which case, stop their vertical velocity, and clamp their
	// y position:
	if (this.velocity.y > 0) 
	{
		if ((celldown && !cell) || (celldiag && !cellright && nx)) 
		{
			// clamp the y position to avoid falling into platform below
			this.position.y = tileToPixel(ty);
			this.velocity.y = 0; // stop downward velocity
			this.falling = false; // no longer falling
			this.jumping = false; // (or jumping)
			ny = 0; // no longer overlaps the cells below
		}
	}
	
	else if (this.velocity.y < 0) 
	{
		if ((cell && !celldown) || (cellright && !celldiag && nx)) 
		{
			// clamp the y position to avoid jumping into platform above
			this.position.y = tileToPixel(ty + 1);
			this.velocity.y = 0; // stop upward velocity
			// player is no longer really in that cell, we clamped them to the cell below
			cell = celldown;
			cellright = celldiag; // (ditto)
			ny = 0; // player no longer overlaps the cells below
		}
	}

	if (this.velocity.x > 0) 
	{
		if ((cellright && !cell) || (celldiag && !celldown && ny)) 
		{
			// clamp the x position to avoid moving into the platform we just hit
			this.position.x = tileToPixel(tx);
			this.velocity.x = 0; // stop horizontal velocity
			if (this.playerState != SPEED_BOOST)
			{
				if (this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
					this.sprite.setAnimation(ANIM_IDLE_RIGHT);
			}
			else
			{
				if (this.sprite.currentAnimation != ANIM_SPEED_IDLE)	
					this.sprite.setAnimation(ANIM_SPEED_IDLE);
			}
			
		}
	}
	else if (this.velocity.x < 0) 
	{
		if ((cell && !cellright) || (celldown && !celldiag && ny)) 
		{
			// clamp the x position to avoid moving into the platform we just hit
			this.position.x = tileToPixel(tx + 1);
			this.velocity.x = 0; // stop horizontal velocity
		}
	}
	
	
	if(cellAtTileCoord(LAYER_OBJECT_TRIGGERS, tx, ty) == true && !this.dead)
	{
		this.kill();
	}
}
Player.prototype.kill = function()
{
	if (!this.dead)
	{
		if (this.timer < 0)
			this.timer = 2;
		sfxDeath.play();
		this.velocity.x = 0;
		this.jumping = false;
		this.falling = true;
		this.dead = true;
		this.playerState = DEAD;
		if (this.sprite.currentAnimation != ANIM_DEATH_RIGHT)
		{
			this.sprite.setAnimation(ANIM_DEATH_RIGHT);
		}
	}
}

Player.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x - this.width/2 - camera.worldOffsetX , this.position.y - this.height);
}

Player.prototype.cheats = function()
{
	// Hacks and "Checkpoints"
	if (keyboard.isKeyDown(keyboard.KEY_0) == true)
	{
		this.position.y = -200;
	}
	if (keyboard.isKeyDown(keyboard.KEY_1) == true)
	{
		//"Put a breakpoint here to freeze the game at will"
		var freezethegamehere = 1;
	}
	if (keyboard.isKeyDown(keyboard.KEY_2) == true)
	{
		this.position.y = 432;
		this.position.x = 5280;
		camera.origin.x = 5296 - 500;
	}
	if (keyboard.isKeyDown(keyboard.KEY_3) == true)
	{
		this.position.y = 432;
		this.position.x = 7834;
		camera.origin.x = 7834 - 500;
	}
	if (keyboard.isKeyDown(keyboard.KEY_4) == true)
	{
		this.position.y = 432;
		this.position.x = 8600;
		camera.origin.x = 8600 - 500;
	}
	if (keyboard.isKeyDown(keyboard.KEY_5) == true)
	{
		
		this.position.y = 336;
		this.position.x = 10736;
		camera.origin.x = this.position.x - 500;
	}
	
	// hack to shortcut to end of level
	if (keyboard.isKeyDown(keyboard.KEY_6) == true)
	{
		this.position.y = 400;
		this.position.x = 12000;
		camera.origin.x = this.position.x - 500;
		//this.playerState = POGOSTICK;
		//this.timer = 0.24;
	}
	if (keyboard.isKeyDown(keyboard.KEY_7) == true)
	{
		this.position.y = 400;
		this.position.x = 12000;
		camera.origin.x = this.position.x - 500;
	}
	if (keyboard.isKeyDown(keyboard.KEY_8) == true)
	{
		this.timer = 5;
		this.playerState = LESS_GRAVITY;
	}
	
	if (keyboard.isKeyDown(keyboard.KEY_9) == true)
	{
		this.kill();

	}
}