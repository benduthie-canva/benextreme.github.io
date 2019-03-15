var Bullet = function(x, y) 
{
	this.image = document.createElement("img");
	
	this.position = new Vector2();
	this.position.set(x, y);
	
	this.width = 40;
	this.height = 20;
	this.image.src = "bullet.png";
	
	if (player.direction == 0)
	{
		this.velocity = -20
		this.image.src = "bulletleft.png";

	}
	if (player.direction == 1)
	{
			this.image.src = "bulletright.png";

		this.velocity = 20
	}
};

Bullet.prototype.update = function(deltaTime)
{
	this.position.x += this.velocity * deltaTime * 10;
}
Bullet.prototype.draw = function()
{
	context.save();
	context.drawImage(this.image, this.position.x  - worldOffsetX - this.width/2, this.position.y - this.height/2);
	context.restore();
}
