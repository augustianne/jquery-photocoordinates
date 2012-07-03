/**
* jquery.photocoordinate.js
* version: 1.0                     
* author: Augustianne Barreta <me@augustiannebarreta.com>
*
* This plugin allows for plotting square areas on photos
**/

(function($){
	
	$.util = {};
	
	$.extend($.util, {
		_plot: function(v, canvas){ 
			// we get coordinates relative to marker size
			var dSize = Math.floor(canvas.width()/8);
			if(canvas.width() < canvas.height())
				dSize = Math.floor(canvas.height()/8);

			var x = v.left * canvas.width(), 
				y = v.top * canvas.height(),
				dx = (x - (dSize/2)),
				dy = (y - (dSize/2));
				
			var identifier = (v.top+'x'+v.left).replace(/\./g, '_');
			var newa = $('<a></a>').
				attr('class', 'coords').
				attr('data-show', identifier).
				attr('href', v.href).
				attr('data-id', v.id).
				attr('data-top', v.top).
				attr('data-left', v.left);
			
			newa.css({ 'top': dy+'px', 'left': dx+'px', 'width': dSize+'px', 'height': dSize+'px' });
			return newa;
		},
		_getCoordinates: function(target, e, markerSize){
			var offset = $(target).offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;

			return { 'left': (x/target.width()), 'top': (y/target.height()) };
		}
	});
	
	$.extend($.fn, {
	
		tag_coordinates : function(options){
			var defaults = {
				url: '#',
				resize_canvas: true,
				markerSize: 100,
				callback: false
			};
			var settings = $.extend(defaults, options);

			return $(this).each(function(){
				var img = $(this);
				
				var imgClone = $('<img/>').
					attr('id', 'tc_img').
					attr('src', img.attr('src'));
	
				var container = $('<div></div>').
					attr('id', 'tc_container');
					
				container.append(imgClone);	
				
				$(this).replaceWith(container);
				
				// initialize image, preload all existing coordinates
				$(imgClone).unbind('load').bind(
					'load', function(){                          
						// set container dimensions to the clone's dimensions
						$(container).css({ width: $(this).width()+'px', height: $(this).height()+'px' });
	                    
						var obj = $(this);
	
						// get coordinates only when image is already loaded
						$.ajax({
							url: settings.url,
							type: 'POST',
							dataType: 'json',
							success: function(data){
								$.each(data, function(k, v){
									v = $.extend(
										{ 'href': '#', 'size': settings.markerSize, 'id': 0 }, 
										v, { 'size': settings.markerSize }
									);
									
									container.append($.util._plot(v, obj));
								});     
							} 
						});
					}).unbind('click').bind(
					'click', function(e){
						var v = $.extend(
							$.util._getCoordinates($(this), e, settings.markerSize), 
							{ 'href': '#', 'size': settings.markerSize, 'id': 0 }
						);          
						
						var newa = $.util._plot(v, $(this));
						container.append(newa);
						if($.isFunction(settings.callback)){
							settings.callback(newa, container);
						}
					});
			});
		},

		activate_tag: function(options){
			var defaults = { callback: false };
			var settings = $.extend(defaults, options);

			return $(this).each(function(){
				$(this).unbind('click').bind('click', function(){
					if($.isFunction(settings.callback)){
						settings.callback($(this), settings);
					}
				});
			});
		}
	});    
	
})(jQuery);