;(function(Brahma) {
	Brahma.app('cartoon', {
		config: {
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

			/* Get selector data-arguments */
			var imported = {
				scenario: Brahma(this.selector).data("cartoon-scenario")||this.config.scenario,
				direction: Brahma(this.selector).data("cartoon-direction")||this.config.direction,
				cols: parseInt(Brahma(this.selector).data("cartoon-cols"))||this.config.cols,
				rows: parseInt(Brahma(this.selector).data("cartoon-rows"))||this.config.rows,
				width: Brahma(this.selector).data("cartoon-width")||this.config.width,
				height: Brahma(this.selector).data("cartoon-height")||this.config.height,
				src: Brahma(this.selector).data("cartoon-src")||this.config.src,
				autoplay: (function(uv){return (uv===null?this.config.autoplay:(uv==='true'?true:false))}).call(this,Brahma(this.selector).data("cartoon-autoplay")),
				fps: Brahma(this.selector).data("cartoon-fps")||this.config.fps,
				controls: Brahma(this.selector).data("cartoon-controls")||this.config.controls,
				loop: Brahma(this.selector).data("cartoon-loop")||this.config.loop,
				debug: Brahma(this.selector).data("cartoon-debug")||this.config.debug
			};

			/* Get data fron data-cartoon */
			if (Brahma(this.selector).data("cartoon")) imported=Brahma.copyProps(imported,Brahma.parseCssDeclarations(Brahma(this.selector).data("cartoon")));
			this.initConfig(imported);

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

			for (var i = 0;i<dsc.length;i++) {
				if (dsc[i].indexOf('..')>=0) {
					var sm = dsc[i].split('..');
					for (var q = 0;q<sm.length-1;q++) {
						if (!isNaN(parseInt(sm[q]))) {
							scenario.push(parseInt(sm[q]));
						};
						scenario.push('..');
					};
					if (!isNaN(parseInt(sm[q]))) {
						scenario.push(parseInt(sm[q]));
					};
				} else {
					scenario.push(dsc[i]);
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

			var framesCount = this.data.cols*this.data.rows;
			if (!scenario) {				
				this.animation.scenario = [];
				for (var i = 0;i<framesCount;i++) {
					this.animation.scenario.push(i);
				}
			} else {
				/*
					0 - Стандарт
					1 - Solid to first number
				*/
				var modif = 0,from=null,i=0,condition,direct;

				while (i<scenario.length || modif!==0) {
					if(modif!==0){
						if (modif===1) { 
							var condition,direct,userTarget;
							if ("undefined"===typeof scenario[i-2]) {
								("undefined"===typeof scenario[i])
								? (from=0, to=framesCount-1,direct=1,condition=function(from, to) {
									return (from<=to);
								})
								: (from=framesCount-1,to=scenario[i]+1,direct=-1,condition=function(from, to) {
									return (from>=to);
								});

							} else {
								userTarget = "undefined"!==typeof scenario[i];
								from = scenario[i-2];
								to = userTarget?scenario[i]:framesCount-1;
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
								this.animation.scenario.push(from)
								from+=direct;
							}
							
							modif=0;
							continue;
						};
					};

					if (!isNaN(parseInt(scenario[i]))) {
						
						this.animation.scenario.push(scenario[i]);

					}else {
						// Command-like
						if (scenario[i]==='..') {
							// Режим solid между двумя числами
							modif=1;
							// Если это единственный параметр, то мы просто добавляем нулевой фпейм
							if (scenario.length===1) this.animation.scenario.push(0);
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
	
	<%=$.snippet('modules/animator.js')%>
	<%=$.snippet('modules/visual-controller.js')%>
})(Brahma);