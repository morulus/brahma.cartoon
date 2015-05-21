;(function(Brahma) {
	
	Brahma.app('cartoon', {
		config: {
			src: '',
			scenario: false, // Сценарий, очередность кадров
			direction: 'down', // Направление движения по спрайту
			frameWidth: false, // Размер кадра (на это величину будет происходить смешение)
			frameHeight: false, // Размер кадра (на это величину будет происходить смешение)
			autoplay: true, // Автоматический запуск сценария
			fps: 10, // Скорость показа
			screenWidth: false, // Размер экрана (px)
			screenHeight: false,  // Размер экрана (px)
			controls: false,
			cols: false,
			rows: false,
			loop: true,
			debug: false,
			onReady: false // This option can be specified only from API
		},
		data: {
			src: '',
			frameHeight: 0,
			frameWidth: 0,
			HTMLElements: {}
		},
		animation: {
			scenario: [],
			top:0,
			left:0,
			direction: 0,
			index: 0,
			height:0,
			width:0
		},
		initConfig: function(props) {
			this.config = Brahma.copyProps(this.config, props);
		},
		run: function() {
			/* SRC спрайта*/
			if (this.config.src) {
				/* Мануальное указание пути до спрайта */
				this.data.src=this.config.src;
				/* Устанавливаем фон */
				Brahma(this.selector).css("background-image", "url("+this.data.src+")")
			} else {
				/* Получение пути из стиля */
				var style = Brahma(this.selector)[0].currentStyle || window.getComputedStyle(Brahma(this.selector)[0], false);
				this.data.src = style.backgroundImage.slice(4, -1);
				if (this.data.src==="") return false; // Do nothing
			}

			/* Предзагрузка */
			this.preloadSprite(function() {
				this.trigger('ready',[this.testImage]);
				if ("function"===typeof this.config.onReady) this.config.onReady.call(this,this.testImage);
				/*
					Сбор данных
				*/
				this.dataCollection();
				/*
					Устанавливаем размер контейнера
				*/
				Brahma(this.selector).css("width", this.animation.width+'px');
				Brahma(this.selector).css("height", this.animation.height+'px');
				/*
					Устанавливаем размер фонового изобаржения
				*/
				Brahma(this.selector).css("background-size", (100 / this.data.frameWidth)+"%");

				/*
					Формируем сценарий
				*/
				if ("object"!==typeof this.config.scenario&& !(this.config.scenario instanceof Array)) {
					if ("string"===typeof this.config.scenario) {
						this.createNewScenario(this.convertScenarioFormString(this.config.scenario));
					} else{
						/* Рассчитываем сценарий примитивным перебором */
						this.createNewScenario(false);
					};
				} else {
					/* Устанавливаем пользовательский сценарий */
					this.createNewScenario(this.config.scenario);
				};
				/* Активируем визуальный контроль */
				if (this.config.controls) this.module('visual-controller');
			});
		},
		/*
		Конвертировать сценарий из строки в массив
		*/
		convertScenarioFormString: function(text) {
			var dsc = text.split(','),scenario=[];
			var pushComplexItem = function(smq) {
				if (smq.indexOf(['[']>0) && smq.indexOf([']']>2)) {
					/* Frame with duration preset */
					var res = smq.match(/([\d]+)\[([0-9sm]+)\]/);
					if (res!==null) {
						scenario.push([parseInt(res[1]),Brahma.millisify(res[2])]);
					} else {
						scenario.push(parseInt(smq));
					}
				} else {
					scenario.push(parseInt(smq));
				}
			}
			for (var i = 0;i<dsc.length;i++) {
				if (dsc[i].indexOf('..')>=0) {
					var sm = dsc[i].split('..');
					for (var q = 0;q<sm.length-1;q++) {

						if (!isNaN(parseInt(sm[q]))) {
							pushComplexItem(sm[q]);
						};
						scenario.push('..');
					};
					if (!isNaN(parseInt(sm[q]))) {
						pushComplexItem(sm[q]);
					};
				} else {
					pushComplexItem(dsc[i]);
				}
			};
			return scenario;
		},
		dataCollection: function() {
			/* > Высота и ширина контейнера в px */
			;(this.config.width) ? (this.animation.width=parseInt(this.config.width))
			: (this.animation.width=Brahma(this.selector)[0].clientHeight);

			(this.config.height) 
			? (this.animation.height=parseInt(this.config.height))
			: (this.animation.height=Brahma(this.selector)[0].clientHeight);
			
			/*
			Устанавливаем значения cols и rows
			*/
			if (!this.config.cols) {
				/* Если указан frameWidth, мы может узнать значение исходя из процентного соотношения */
				if (this.config.frameWidth) {
					
				} else {
					this.data.cols = 1;
				};
			} else {
				this.data.cols = this.config.cols;
			};

			if (!this.config.rows) {
				/* Если указан frameWidth, мы может узнать значение исходя из процентного соотношения */
				if (this.config.frameHeight) {
					
				} else {
					this.data.rows = 1;
				};
			} else {
				this.data.rows = this.config.rows;
			};

			/* > Доп. проверяем не является ли ширина или высота нулю */
			if (this.animation.width===0) {
				if (this.animation.height!==0) {
					this.animation.width = this.testImage.width*((this.animation.height*this.data.rows)/this.testImage.height)/this.data.cols;
				} else {
					/* Если ширина не указана явно, мы можем взять это значение из исходного размера изображения / cols */
					this.animation.width = this.testImage.width/this.config.cols;
				};
			};
			if (this.animation.height===0) {
				/* Если ширина не указана явно, мы можем взять это значение исходя из соотноешния сторон */
				/* Вначале рассчитываем полную относительную высоту */
				
				this.animation.height = this.testImage.height*((this.animation.width*this.data.cols)/this.testImage.width)/this.data.rows;
			};

			/* > Ряды и колонки в px, размер слайдов в % */
			if (this.config.cols) {
				this.data.frameWidth = 1/this.config.cols;

				this.data.cols = this.config.cols;
			} else {

				var px = this.config.frameWidth ?  Brahma.percentEq(this.config.frameWidth,this.animation.width) : this.animation.width;

				this.data.cols = Math.floor(this.testImage.width/px);

				this.data.frameWidth = (px) / this.testImage.width;
			};

			if (this.config.rows) {
				this.data.frameHeight = 100/this.config.rows;
				this.data.rows = this.config.rows;
			} else {
				var px = this.config.frameHeight ?  Brahma.percentEq(this.config.frameHeight,this.animation.width) : this.animation.height;
				this.data.rows = Math.floor(this.testImage.height/px);
				this.data.frameHeight = (px) / this.testImage.height;
			};
		},
		/* Отматывает на первый кадр */
		rewind: function() {
			this.animation.index=0;
			return this;
		},
		play: function() {
			this.module('animator').play();
			return this;
		},
		/* Перемещает на фрейм и запускает анимацию, если не запущено */
		goto: function(index) {
			this.animation.index = index-1;
			this.wake();
			return this;
		},
		fps: function(fps) {
			if (fps) {
				this.config.fps = fps;
				if (this.module("animator").interval>0) clearInterval(this.module("animator").interval); // Stop animation
				if (this.module("animator").waiter>0) clearTimeout(this.module("animator").waiter); // Stop wait timeout
				this.module("animator").interval = 0;
				this.module("animator").waiter = 0;
				this.module("animator").play();
			}
			else
			return this.config.fps;
			return this;
		},
		/* Вернет true если в данный момент идет анимация */
		isAnimated: function() {
			if (this.module('animator').interval===0 
				|| (
					this.module('animator').data.dummy===true &&
					this.module('animator').waiter===0
				)) return false;
			return true;
		},
		/* Воспроизводит анимацию, если сейчас она не воспроизводится */
		wake: function() {
			if (!this.isAnimated()) {
				this.module('animator').data.dummy=false;
				if (this.animation.index>=this.animation.scenario.length-1) this.rewind();
				this.play();
			};
			return this;
		},
		/* Ставит анимацию на паузу */
		pause: function() {
			this.module('animator').pause();
			return this;
		},
		togglePlay: function() {
			this.module('animator').togglePlay();
			return this;
		},
		/* Останавлаивает анимацию */
		stop: function() {
			this.module('animator').stop();
			return this;
		},
		progress: function() {
			if (arguments.length>0)
			this.module('animator').goToProgress(arguments[0]);
			else return this.module('animator').getProgress();
			return this;
		},
		preloadSprite: function(callback) {
			var that=this;
			this.testImage = new Image();
			this.testImage.onload = function(){
				callback.call(that);
			}
			this.testImage.onerror = function() {
				// Do nothing
			}
			this.testImage.src = this.data.src;
		},
		/* 
			Функция создает новый сценарий из передавнного ей массива индексов кадров или путем простого пересчета количества кадров в спрайте
			Результат помещается в переменную this.animation.scenario, предварительно очищая её
		*/
		createNewScenario: function(scenario) {

			var modif = 0,from=null,condition,direct,i;
			/* Приводим сценарий о одному типу */
			for (i = 0;i<scenario.length;i++) {
				scenario[i] = ("object"!==typeof scenario[i]) ? [scenario[i],false] : scenario[i];
			}

			var framesCount = this.data.cols*this.data.rows;
			if (!scenario) {				
				this.animation.scenario = [];
				for (i = 0;i<framesCount;i++) {
					this.animation.scenario.push(i);
				}
			} else {
				/*
					0 - Стандарт
					1 - Solid to first number
				*/
				
				i=0;
				while (i<scenario.length || modif!==0) {
					if(modif!==0){
						if (modif===1) { 
							var condition,direct,userTarget;
							if ("undefined"===typeof scenario[i-2]) {
								("undefined"===typeof scenario[i])
								? (from=0, to=framesCount-1,direct=1,condition=function(from, to) {
									return (from<=to);
								})
								: (from=framesCount-1,to=scenario[i][0]+1,direct=-1,condition=function(from, to) {
									return (from>=to);
								});

							} else {
								userTarget = "undefined"!==typeof scenario[i];
								from = scenario[i-2][0];
								to = userTarget?scenario[i][0]:framesCount-1;
								if (to>framesCount-1) to = framesCount-1;

								if (from<to) {
									direct=1;

									condition=function(from, to) {
										return (from<=to);
									};
								} else {
									direct=-1;
									condition=function(from, to) {
										return (from>=to);
									};
								};
								if (userTarget) to-=direct;
								
								if (from===to) break;
								
							};

							from+=direct;
							
							while(condition(from, to)) {
								this.animation.scenario.push([from,false])
								from+=direct;
							}
							
							modif=0;
							continue;
						};
					};

					if (!isNaN(parseInt(scenario[i][0]))) {
						
						this.animation.scenario.push(scenario[i]);

					}else {
						// Command-like
						if (scenario[i][0]==='..') {
							// Режим solid между двумя числами
							modif=1;
							// Если это единственный параметр, то мы просто добавляем нулевой фпейм
							if (scenario.length===1) this.animation.scenario.push([0,false]);
						} 
					};
					i++;
				} 
			};

			/* Обнуляем текущий фрейм */
			this.animation.index = 0;
			/* Инициализируем модуль анимации background */
			this.module('animator');
			if (this.config.autoplay) this.module('animator').play();
		}
	});
	
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
			this.changePosition(animator.mover.call(this, this.getFrame(this.master.animation.index)[0]));
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
	Brahma.app('cartoon').module('visual-controller', function() {
	var that = this;
	
	this.buildHTML();

	this.bindEvents();

	this.master.bind('change', function(index, progress) {
		Brahma(that.master.data.HTMLElements.visualReporter).html(index);
		Brahma(that.master.data.HTMLElements.visualController).css("width",Math.round(progress*100)+'%');
	});
},{
	bindEvents : function() {
		var that = this, downed = false, ctrlWidth;
		// Pause on click
		Brahma(this.master.selector).bind('click', function() {

			that.master.togglePlay();
		});

		this.master.data.HTMLElements.visualControllerWrapper.bind('mousedown', function(e) {
			downed = true;
			that.master.pause();
			ctrlWidth=this.clientWidth;
			e.stopPropagation();

			Brahma(document).bind('mouseup', function() {
				downed = false;
			}, true);
		}).
		bind('click', function(e) {
			e.stopPropagation();
			that.master.pause();
			
			if (downed) {
				that.master.module('animator').goToProgress(e.offsetX/ctrlWidth);
			};
		})
		.bind('mousemove', function(e) {

			if (downed) {
				that.master.module('animator').goToProgress(e.offsetX/ctrlWidth);
			}
		});
	},
	buildHTML : function() {
		var that = this, currentPosition = Brahma(this.master.selector).css("position").toLowerCase();
		if (currentPosition!=="absolute"||currentPosition!=="fixed")  Brahma(this.master.selector).css("position","relative");
		this.master.data.HTMLElements.visualController = Brahma(this.master.selector)
		.put('div', {}).css({position:"absolute",bottom:0,left:0,width:"100%",height:"30px",overflow:"hidden",backgroundColor:"rgba(0,0,0,0.2)",cursor:"default"})
		.tie(function() { that.master.data.HTMLElements.visualControllerWrapper = this; })
		.put('div', {}).css({height:"100%",backgroundColor:"rgba(182, 211, 35, 0.57)",float:"left"});

		this.master.data.HTMLElements.visualReporter = Brahma(this.master.selector) 
		.put('div', {}).css({position:"absolute",top:0,left:0,bottom:0,right:0,margin:'auto',width:"50%","font-size":"27px",color:"rba(255,0,0,0.35)","text-align":"center",height:"30px",overflow:"hidden"});
	}
});
})(Brahma);