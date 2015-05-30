/* Аниматор */
	Brahma.app('cartoon').module('animator', function() {
		// Get function mover
		if (this.master.config.direction==='down') this.mover = this.moveDown;
		if (this.master.config.direction==='top') this.mover = this.moveTop;
		if (this.master.config.direction==='left') this.mover = this.moveLeft;
		if (this.master.config.direction==='right') this.mover = this.moveRight;
	}, {
		interval: 0,
		waiter: 0,
		data: {
			dummy: false // Интервал не меняет кадры, крутясь в холостую
		},
		mover: null,
		play: function() { 
			if (this.interval>0) {
				this.data.dummy = false; return true;
			};

			this.data.dummy = false;
			this.waiter = 0;

			var animator = this;
			// Reset to current frame
			animator.changePosition(this.mover.call(animator));
			// Aaaaand start animation!
			this.interval = setInterval(function() {
				if (animator.data.dummy) return false;
				animator.master.animation.index++;

				animator.master.trigger('frame',[animator.master.animation.index])
				
				if (animator.master.animation.index>animator.master.animation.scenario.length-1) {
					if (animator.master.config.loop) {
						animator.master.animation.index=0;
					} else {
						animator.pause();
					};
					animator.master.trigger('end');
				}

				if (!animator.data.dummy) {
					var frame = animator.getFrame(animator.master.animation.index);
					if (frame[1]) {
						// Personal frame duration
						animator.wait(frame[1]);
					}
					
					animator.changePosition(animator.mover.call(animator, frame[0]));
				};
			}, 1000/this.master.config.fps);
		},
		togglePlay: function() {
			if (this.data.dummy) this.play();
			else this.pause();
		},
		pause: function() {
			this.data.dummy = true;
		},
		wait: function(ms) {
			var animator = this;
			this.pause();
			this.waiter = setTimeout(function() {
				animator.waiter = 0;
				animator.play();
			}, ms);
		},
		stop: function() {
			if (this.interval>0) clearInterval(this.interval); // Stop animation
			if (this.waiter>0) clearTimeout(this.waiter); // Stop wait timeout
			this.interval = 0;
			this.waiter = 0;
			this.master.rewind();
		},
		goToProgress: function(progress) {
			this.master.animation.index = Math.round((this.master.animation.scenario.length)*progress);
			this.changePosition(this.mover.call(this, this.getFrame(this.master.animation.index)[0]));
		},
		goToFrame: function(frameIndex) {
			this.master.animation.index = frameIndex;
			this.changePosition(this.mover.call(this, this.getFrame(this.master.animation.index)[0]));
		},
		getProgress: function() {
			return this.master.animation.index/this.master.animation.scenario.length;
		},
		getFrame: function(i) {
			if ("object"===typeof this.master.animation.scenario[i])
			return this.master.animation.scenario[i];
			else
			return [this.master.animation.scenario[i],false];
		},
		moveTop: function(frameindex) {
			var dcol =frameindex/this.master.data.rows;
			var col = Math.floor(dcol);
			var row = (col*this.master.data.rows)-frameindex;
			
			return [-col*100,-row*100];
		},
		moveDown: function(frameindex) {
			var dcol =frameindex/this.master.data.rows;
			var col = Math.floor(dcol);
			var row = frameindex-(col*this.master.data.rows);
			
			return [-col*100,-row*100];
		},
		moveLeft: function(frameindex) {
			var drow =frameindex/this.master.data.rows;
			var row = Math.floor(dcol);
			var col = (row*this.master.data.cols)-frameindex;
			
			return [-col*100,-row*100];
		},
		moveRight: function(frameindex) {
			var drow =frameindex/this.master.data.rows;
			var row = Math.floor(drow);
			var col = frameindex-(row*this.master.data.cols);
			
			return [-col*100,-row*100];
		},
		/* Делает анимацию заднего фона */
		changePosition: function(shift) {
			Brahma(this.master.selector)[0].style.backgroundPosition = shift[0]+'% '+shift[1]+'%';
			/* Вызываем событие смены кадра */
			this.master.trigger('change',[this.master.animation.index,this.master.animation.index/this.master.animation.scenario.length]);
		}
	});