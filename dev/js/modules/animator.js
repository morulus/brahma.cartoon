/* Аниматор */
	Brahma.app('cartoon').module('animator', function() {
		// Get function mover
		if (this.master.config.direction==='down') this.mover = this.moveDown;
		if (this.master.config.direction==='top') this.mover = this.moveTop;
		if (this.master.config.direction==='left') this.mover = this.moveLeft;
		if (this.master.config.direction==='right') this.mover = this.moveRight;
	}, {
		interval: 0,
		data: {
			dummy: false // Интервал не меняет кадры, крутясь в холостую
		},
		mover: null,
		play: function() {

			if (this.interval>0) {
				this.data.dummy = false; return true;
			};

			this.data.dummy = false;

			var animator = this;
			// Reset to current frame
			animator.changePosition(this.mover.call(animator));
			// Aaaaand start animation!
			this.interval = setInterval(function() {
				if (animator.data.dummy) return false;
				animator.master.animation.index++;
				if (animator.master.animation.index>animator.master.animation.scenario.length-1) {
					animator.master.trigger('end');
					if (animator.master.config.loop) {
						animator.master.animation.index=0;
					} else {
						animator.pause();
					};
				}
				
				animator.changePosition(animator.mover.call(animator));
			}, 1000/this.master.config.fps);
		},
		togglePlay: function() {
			if (this.data.dummy) this.play();
			else this.pause();
		},
		pause: function() {
			this.data.dummy = true;
		},
		stop: function() {
			if (this.interval>0) clearInterval(this.interval);
			this.master.rewind();
		},
		goToProgress: function(progress) {
			this.master.animation.index = Math.round((this.master.animation.scenario.length)*progress);
			this.changePosition(this.mover.call(this));
		},
		goToFrame: function(frameIndex) {
			this.master.animation.index = frameIndex;
			this.changePosition(animator.mover.call(this));
		},
		getProgress: function() {
			return this.master.animation.index/this.master.animation.scenario.length;
		},
		moveTop: function() {
			var dcol =(this.master.animation.scenario[this.master.animation.index])/this.master.data.rows;
			var col = Math.floor(dcol);
			var row = (col*this.master.data.rows)-this.master.animation.scenario[this.master.animation.index];
			
			return [-col*100,-row*100];
		},
		moveDown: function() {
			var dcol =(this.master.animation.scenario[this.master.animation.index])/this.master.data.rows;
			var col = Math.floor(dcol);
			var row = this.master.animation.scenario[this.master.animation.index]-(col*this.master.data.rows);
			
			return [-col*100,-row*100];
		},
		moveLeft: function() {
			var drow =(this.master.animation.scenario[this.master.animation.index])/this.master.data.rows;
			var row = Math.floor(dcol);
			var col = (row*this.master.data.cols)-this.master.animation.scenario[this.master.animation.index];
			
			return [-col*100,-row*100];
		},
		moveRight: function() {
			var drow =(this.master.animation.scenario[this.master.animation.index])/this.master.data.rows;
			var row = Math.floor(drow);
			var col = this.master.animation.scenario[this.master.animation.index]-(row*this.master.data.cols);
			
			return [-col*100,-row*100];
		},
		/* Делает анимацию заднего фона */
		changePosition: function(shift) {
			Brahma(this.master.selector)[0].style.backgroundPosition = shift[0]+'% '+shift[1]+'%';
			/* Вызываем событие смены кадра */
			this.master.trigger('change',[this.master.animation.index,this.master.animation.index/this.master.animation.scenario.length]);
		}
	});