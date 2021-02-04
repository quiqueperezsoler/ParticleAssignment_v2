    // ----- Start of the assigment ----- //

class ParticleSystem extends PIXI.Container { //particle emitter
	constructor() {
		super();
		// Set start and duration for this effect in milliseconds
		this.start    = 0;
		this.duration = 500;
		// Create a sprite
		let sp        = game.sprite("CoinsGold000");

		/* NEW CODE */
		const numSprites = 50; //setting the number of coin sprites to make
		this.sprites = []; //initializing array of sprites for coin rain

		var i;
		for(i=0; i<numSprites; i++){ //creating sprite and adding to sprite array
		    let sp = game.sprite("CoinsGold000"); //PIXI.Sprite.from('gfx/CoinsGold/000.png');
            sp.x = 400;
            sp.y = 225;
            // Set pivot to center of said sprite
            sp.pivot.x = sp.width/2;
            sp.pivot.y = sp.height/2;
            sp.scale.set(0.5); //size of coin
            // define an upward direction
            sp.direction = 10;
            sp.alpha = 1;
            // this number will be used to modify the direction of the sprite over time
            sp.turningSpeed = Math.random() - 1;
            // create a random speed between 0 - 2 to give a smooth effect
            sp.speed = (2 + Math.random() * 2) * 0.2;
            //sp.offset = Math.random() * 100;
            // Add the sprite particle to our particle effect
		    this.sprites.push(sp);
		    this.addChild(sp);
		}
		/* END OF NEW CODE */
	}

	animTick(nt,lt,gt) { //updating position of coin rain
		//console.log("Call animTick and nt, lt, gt are: %d, %d, %d ", nt, lt, gt);
		// Every update we get three different time variables: nt, lt and gt.
		//   nt: Normalized time in percentage (0.0 to 1.0) and is calculated by
		//       just dividing local time with duration of this effect.
		//   lt: Local time in milliseconds, from 0 to this.duration.
		//   gt: Global time in milliseconds,
		//console.log("animTick: nt with decimal points = "+ nt);

		// Set a new texture on a sprite particle
		let num = ("000"+Math.floor(nt*8)).substr(-3); //Selects the three last numbers of the nt*8
		//console.log("animTick: num = "+ num);

        /* NEW CODE */
		var power = 1;
		var tick = 0;

         if (lt % 10 == 0) { //looping the sprites for a fountain effect
            let sp = game.sprite("CoinsGold000"); //PIXI.Sprite.from('gfx/CoinsGold/000.png');
            sp.x = 400;
            sp.y = 225;
            sp.pivot.x = sp.width/2;
            sp.pivot.y = sp.height/2;
            sp.scale.set(0.5);
            sp.direction = 10;
            sp.turningSpeed = Math.random() - 1;
            // Add the sprite particle to our particle effect
            this.sprites.push(sp);
            this.addChild(sp);
        }

		for (const sp of this.sprites){ //updating position of every sprite
            game.setTexture(sp,"CoinsGold"+num);
            // Animate position
            //Math.pow(-1, power) alternates between signs (+ and -) so negative values are also included in z.
            sp.direction += sp.turningSpeed*Math.random();
            //sp.x += Math.sin(sp.turningSpeed)*3*Math.pow(-1, power);
            sp.x += sp.turningSpeed*Math.pow(-1,power)*tick;
            sp.y -= sp.direction;
            //sp.y += Math.cos(sp.direction);
            // Animate scale
            //sp.scale.x += 0.01;
            //sp.scale.y += 0.01; //size of coin
            // Animate alpha
            //sp.alpha -= sp.turningSpeed*Math.random() - 0.1;
            // Animate rotation
            sp.rotation += Math.random()*0.1*Math.pow(-1, power);
            power++;//Math.random();
            tick += 0.1;
		}
        /* END NEW CODE */
	}
}

// ----- End of the assignment ----- //

class Game {
	constructor(props) {
		this.totalDuration = 0;
		this.effects = [];
		this.renderer = new PIXI.WebGLRenderer(800,450);
		document.body.appendChild(this.renderer.view);
		this.stage = new PIXI.Container();
		this.loadAssets(props&&props.onload);
	}
	loadAssets(cb) {
		let textureNames = [];
		// Load coin assets
		for (let i=0; i<=8; i++) {
			let num  = ("000"+i).substr(-3);
			let name = "CoinsGold"+num;
			let url  = "gfx/CoinsGold/"+num+".png";
			textureNames.push(name);
			PIXI.loader.add(name,url);
		}
		PIXI.loader.load(function(loader,res){
			// Access assets by name, not url
			let keys = Object.keys(res);
			for (let i=0; i<keys.length; i++) {
				var texture = res[keys[i]].texture;
				if ( ! texture) continue;
				PIXI.utils.TextureCache[keys[i]] = texture;
			}
			// Assets are loaded and ready!
			this.start();
			cb && cb();
		}.bind(this));
	}
	start() {
		this.isRunning = true;
		this.t0 = Date.now();
		update.bind(this)();
		function update(){
			if ( ! this.isRunning) return;
			this.tick();
			this.render();
			requestAnimationFrame(update.bind(this));
		}
	}
	addEffect(eff) {
		this.totalDuration = Math.max(this.totalDuration,(eff.duration+eff.start)||0);
		this.effects.push(eff);
		this.stage.addChild(eff);
	}
	render() {
		this.renderer.render(this.stage);
	}
	tick() {
		let gt = Date.now();
		let lt = (gt-this.t0) % this.totalDuration;
		for (let i=0; i<this.effects.length; i++) {
			let eff = this.effects[i];
			if (lt>eff.start+eff.duration || lt<eff.start) continue;
			let elt = lt - eff.start;
			let ent = elt / eff.duration;
			eff.animTick(ent,elt,gt);
		}
	}
	sprite(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);// sprite is saved in PIXI with a name for the Texture
	}
	setTexture(sp,name) {
		sp.texture = PIXI.utils.TextureCache[name]; //texture is loaded from the texture cache based on name
		if ( ! sp.texture) console.warn("Texture '"+name+"' don't exist!")
	}
}

window.onload = function(){
	window.game = new Game({onload:function(){
		game.addEffect(new ParticleSystem());
	}});
}