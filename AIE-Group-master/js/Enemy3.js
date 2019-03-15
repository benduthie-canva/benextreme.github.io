var ANIM_ENEMY_UP = 0;
var ANIM_ENEMY_DOWN = 1;
var ANIM_ENEMY_IDLE = 2;

var ANIM_ENEMY_MAX = 2;

var Enemy3 = function(x, y)
{
	
	this.sprite = new Sprite("images/shadow.png");
	this.sprite.buildAnimation(4, 5, 80, 70, 0.1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
	this.sprite.buildAnimation(4, 5, 80, 70, 0.1, [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
	
	for(var i = 0; i < ANIM_ENEMY_MAX; i++)
	{
		this.sprite.setAnimationOffset(i, 0, 0);
	}
	
	this.position = new Vector2();
	this.position.set(x, y);
	
	this.velocityX = 0;
	
	this.moveRight = true;
	this.pause = 0;
	
	this.width = 80;
	this.height = 70;
	
	this.animationTimer = 0;
	this.sprite.setAnimation(ANIM_ENEMY_DOWN);

}

Enemy3.prototype.update = function(deltaTime)
{
	var ddx = 0;			//acceleration

	this.sprite.update(deltaTime);
		
	if(this.pause > 0)
	{
		this.pause = this.pause - deltaTime;
	}
	
	else
	{
		this.animationTimer -= deltaTime;

	
	//collision detection
		var tx = pixelToTile(this.position.x);
		var ty = pixelToTile(this.position.y);
		var nx = (this.position.x) % TILE;		//true if enemy overlaps right
		var ny = (this.position.y) % TILE;		//true if enemy overlaps below
		var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
		var cellleft = cellAtTileCoord(LAYER_PLATFORMS, tx - 1, ty);
		var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
		var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
		
		if (this.animationTimer <= 0)
		{
			if (this.sprite.currentAnimation == ANIM_ENEMY_UP)
			{
				this.sprite.setAnimation(ANIM_ENEMY_DOWN);
				this.animationTimer = 1.7;

			}
			else
			{
				this.sprite.setAnimation(ANIM_ENEMY_UP);
				this.animationTimer = 1.7;

			}
		}
		
		
		
		/*if(this.moveRight)
		{
			if (this.sprite.currentAnimation != ANIM_ENEMY_RIGHT)
				this.sprite.setAnimation(ANIM_ENEMY_RIGHT);		
			
			if(celldiag && !cell)
			{
				ddx = ddx + ENEMY_ACCEL;	//enemy wants to go right				
			}
			
			
			else
			{
				this.velocityX = 0;
				this.moveRight = false;
				this.pause = 1;
			}
		}
		
		else
		{
			if (this.sprite.currentAnimation != ANIM_ENEMY_LEFT)
				this.sprite.setAnimation(ANIM_ENEMY_LEFT);
			
			if(celldown && !cellleft)
			{
				ddx = ddx - ENEMY_ACCEL;	//enemy wants to go left
				
			}
			
			else
			{
				this.velocityX = 0;
				this.moveRight = true;
				this.pause = 1;
			}
		}
		
		
		this.position.x = Math.floor(this.position.x + (deltaTime * this.velocityX));
		this.velocityX = bound(this.velocityX + (deltaTime * ddx), -ENEMY_MAXDX, ENEMY_MAXDX);
	*/
	
	}
}

Enemy3.prototype.draw = function(deltaTime)
{
	context.fillStyle = "yellow";
	this.sprite.draw(context, this.position.x - camera.worldOffsetX - this.width/2, this.position.y - this.height);
	//context.fillRect(this.position.x - camera.worldOffsetX, this.position.y, this.width, this.height);
	//context.fillRect(this.position.x - this.width/2 - camera.worldOffsetX, this.position.y - this.height, this.width, this.height);

}