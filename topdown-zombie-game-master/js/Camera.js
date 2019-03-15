var Camera = function()
{
	this.width = canvas.width;
	this.height = canvas.height;
	
	this.origin = new Vector2();
	this.origin.set(0, 0);
	
	this.worldOffsetX = 0;
}

Camera.prototype.updateCamera = function(deltaTime)
{
	/*
	this.center = new Vector2(this.origin.x + this.width/2, this.origin.y + this.height/2)
	
	if (this.origin.x <= MAP.tw*TILE-this.width)
	{
		this.speed = 0;
		// speeds up camera if player is moving to the right at the edge of screen
		
		if (player.position.x < this.center.x - 50)
		{
			
		}
		else if (player.position.x  > this.center.x + 50)
		{
		

		}
		
	}
	if (this.origin.y <= MAP.th*TILE-this.height)
	{
		
	}
	*/



	
}

Camera.prototype.generateMap = function(deltaTime, player)
{
	/*if (this.origin.distance(player.position) > 50)
	{
		this.origin.x = player.position.x;
		this.origin.y = player.position.y;
	}*/
	
	this.origin.x = player.position.x;
	this.origin.y = player.position.y;
	
	// first if statement stops the camera moving at the end of the level.
	var maxTilesX = Math.floor(SCREEN_WIDTH / TILE) + 3;
	var tileX = pixelToTile(this.origin.x);
	var offsetX = TILE + Math.floor(this.origin.x%TILE);
	
	startX = tileX - Math.floor(maxTilesX / 2);
	
	if(startX < -1)
	{
		startX = 0;
		offsetX = 0;
	}
	if(startX > MAP.tw - maxTilesX)
	{
		startX = MAP.tw - maxTilesX + 1;
		offsetX = TILE;
	}
	
	var maxTilesY = Math.floor(SCREEN_HEIGHT / TILE) + 3;
	var tileY = pixelToTile(this.origin.y);
	var offsetY = TILE + Math.floor(this.origin.y%TILE);
	
	startY = tileY - Math.floor(maxTilesY / 2);
	
	if(startY < -1)
	{
		startY = 0;
		offsetY = 0;
	}
	if(startY > MAP.th - maxTilesY)
	{
		startY = MAP.th - maxTilesY + 1;
		offsetY = TILE;
	}
		
	this.worldOffsetX = startX * TILE + offsetX;
	this.worldOffsetY = startY * TILE + offsetY;

		
	for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
	{
		for( var y = 0; y < level1.layers[layerIdx].height; y++ )
		{
			var idx = y * level1.layers[layerIdx].width + startX;
			for( var x = startX; x < startX + maxTilesX; x++ )
			{
				if( level1.layers[layerIdx].data[idx] != 0 )
				{
					// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
					// so subtract one from the tileset id to get the
					// correct tile
					var tileIndex = level1.layers[layerIdx].data[idx] - 1;
					var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
					var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x-startX)*TILE - offsetX, (y-startY)*TILE - offsetY, TILESET_TILE, TILESET_TILE);
				}
				idx++;
			}
		}
	}
}