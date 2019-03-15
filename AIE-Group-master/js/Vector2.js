var Vector2 = function(x, y) 
{
	this.x = x;
	this.y = x;
};

Vector2.prototype.set = function(x,y)
{
	this.x = x;
	this.y = y;
};

Vector2.prototype.normalize = function()
{
	var length = Math.sqrt(this.x*this.x + this.y*this.y);
	
	this.x = this.x / length;
	this.y = this.y / length;
};

Vector2.prototype.add = function (vector)
{
	this.x += vector.x;
	this.y += vector.y;
};

Vector2.prototype.subtract = function (vector)
{
	this.x -= vector.x;
	this.y -= vector.y;
};

Vector2.prototype.multiplyScalar = function (scalar)
{
	this.x *= scalar;
	this.y *= scalar;
};