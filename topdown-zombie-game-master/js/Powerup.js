var Powerup = function(x, y, type)
{

	this.type = 0;
	this.type = type;
	
	this.width = 16;
	this.height = 16;
	
	this.position = new Vector2();
	this.position.set(x + 8, y);
	
	this.timer = 0;
	
	this.image = document.createElement("img");

	
	switch (type)
	{
		case 0:
			//SPEED  BOOST 
			this.image.src = "images/shoe.png";
			this.height = 32;
			this.width = 32;
		break;
		case 1:
			//SLOW SPEED
			this.image.src = "images/plantpotion.png"
		break;
		case 2:
			//POGOSTICK / CONTINOUS JUMPING
			this.image.src = "images/pogostick.png"
			this.width = 16;
			this.height = 36;
		
		break;
		
		case 3:
			// LESS GRAVITY
			this.image.src = "images/waterpotion.png"
		
		break;
	}

}

Powerup.prototype.draw = function()
{
	
	context.drawImage(this.image, this.position.x - this.width/2 - camera.worldOffsetX, this.position.y - this.height)
}