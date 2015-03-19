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