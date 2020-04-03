( function( $ ) {

	"use strict";

	var JetEngine = {

		currentMonth: null,
		currentRequest: {},
		activeCalendarDay: null,

		init: function() {

			var widgets = {
				'jet-listing-dynamic-field.default' : JetEngine.widgetDynamicField,
				'jet-listing-grid.default': JetEngine.widgetListingGrid,
			};

			$.each( widgets, function( widget, callback ) {
				window.elementorFrontend.hooks.addAction( 'frontend/element_ready/' + widget, callback );
			});

			$( document )
				.on( 'click.JetEngine', '.jet-calendar-nav__link', JetEngine.switchCalendarMonth )
				.on( 'click.JetEngine', '.jet-calendar-week__day-mobile-overlay', JetEngine.showCalendarEvent )
				.on( 'jet-filter-content-rendered', JetEngine.maybeReinitSlider )
				.on( 'click.JetEngine', '.jet-engine-listing-overlay-wrap', JetEngine.handleListingItemClick );

			window.elementorFrontend.hooks.addFilter(
				'jet-popup/widget-extensions/popup-data',
				JetEngine.prepareJetPopup
			);

		},

		handleListingItemClick: function( event ) {

			var url    = $( this ).data( 'url' ),
				target = $( this ).data( 'target' ) || false;

			if ( url ) {

				event.preventDefault();

				if ( window.elementorFrontend && window.elementorFrontend.isEditMode() ) {
					return;
				}

				if ( '_blank' === target ) {
					window.open( url );
					return;
				}

				window.location = url;
			}

		},

		prepareJetPopup: function( popupData, widgetData, $scope ) {

			var postId = null;

			if ( widgetData['is-jet-engine'] ) {
				popupData['isJetEngine'] = true;

				var $gridItem     = $scope.closest( '.jet-listing-grid__item' ),
					$calendarItem = $scope.closest( '.jet-calendar-week__day-event' );

				if ( $gridItem.length ) {
					popupData['postId'] = $gridItem.data( 'post-id' );
				} else if ( $calendarItem.length ) {
					popupData['postId'] = $calendarItem.data( 'post-id' );
				} else if ( window.elementorFrontendConfig && window.elementorFrontendConfig.post ) {
					popupData['postId'] = window.elementorFrontendConfig.post.id;
				}

			}

			return popupData;

		},

		showCalendarEvent: function( event ) {

			var $this       = $( this ),
				$day        = $this.closest( '.jet-calendar-week__day' ),
				$week       = $day.closest( '.jet-calendar-week' ),
				$events     = $day.find( '.jet-calendar-week__day-content' ),
				activeClass = 'calendar-event-active';

			if ( $day.hasClass( activeClass ) ) {
				$day.removeClass( activeClass );
				JetEngine.activeCalendarDay.remove();
				JetEngine.activeCalendarDay = null;
				return;
			}

			if ( JetEngine.activeCalendarDay ) {
				JetEngine.activeCalendarDay.remove();
				$( '.' + activeClass ).removeClass( activeClass );
				JetEngine.activeCalendarDay = null;
			}

			$day.addClass( 'calendar-event-active' );

			JetEngine.activeCalendarDay = $( '<tr class="jet-calendar-week"><td colspan="7" class="jet-calendar-week__day jet-calendar-week__day-mobile"><div class="jet-calendar-week__day-mobile-event">' + $events.html() + '</div></td></tr>' );

			JetEngine.activeCalendarDay.insertAfter( $week );

		},

		widgetListingGrid: function( $scope ) {
			var $listing    = $scope.find( '.jet-listing-grid__items' ).first(),
				$slider     = $listing.parent( '.jet-listing-grid__slider' ),
				$masonry    = $listing.hasClass( 'jet-listing-grid__masonry' ) ? $listing : false,
				navSettings = $listing.data( 'nav' ),
				masonryGrid = false;

			if ( $slider.length ) {
				JetEngine.initSlider( $slider );
			}

			if ( $masonry && $masonry.length ) {

				JetEngine.initMasonry( $masonry );

				$( window ).on( 'load resize', function() {
					JetEngine.runMasonry( $masonry );
				} );
			}

			if ( navSettings && navSettings.enabled ) {

				var $button = $( navSettings.more_el ),
					page    = parseInt( $listing.data( 'page' ), 10 ),
					pages   = parseInt( $listing.data( 'pages' ), 10 );

				if ( $button.length ) {

					if ( page === pages && ! window.elementor ) {
						$button.css( 'display', 'none' );
					} else {
						$button.removeAttr( 'style' );
					}

					$( document ).off( 'click', navSettings.more_el ).on( 'click', navSettings.more_el, JetEngine.handleMore.bind( {
						container: $listing,
						button: $button,
						settings: navSettings,
						pages: pages,
						masonry: $masonry,
						slider: $slider,
					} ) );

				}
			}

		},

		initMasonry: function( $masonry ) {
			imagesLoaded( $masonry, function() {
				JetEngine.runMasonry( $masonry );
			} );
		},

		runMasonry: function( $masonry ) {
			var $items  = $( '> .jet-listing-grid__item', $masonry ),
				options = $masonry.data( 'masonry-grid-options' ),
				deviceMode = window.elementorFrontend.getCurrentDeviceMode(),
				columnsCount = options.columns[ deviceMode ];

			// Reset masonry
			$items.css( {
				marginTop: ''
			} );

			if ( columnsCount < 2 ) {
				return;
			}

			var masonryInstance = new window.elementorModules.utils.Masonry( {
					container: $masonry,
					items: $items,
					columnsCount: columnsCount,
					verticalSpaceBetween: 0
				} );

			masonryInstance.run();
		},

		handleMore: function( event ) {

			event.preventDefault();

			var self = this,
				page = parseInt( self.container.data( 'page' ), 10 );

			page++;

			self.button.css({
				pointerEvents: 'none',
				opacity: '0.5',
				cursor: 'default',
			});

			self.container.css({
				pointerEvents: 'none',
				opacity: '0.5',
				cursor: 'default',
			});

			$.ajax({
				url: JetEngineSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'jet_engine_elementor',
					handler: 'listing_load_more',
					query: self.settings.query,
					widget_settings: self.settings.widget_settings,
					page: page
				},
			}).done( function( response ) {

				self.button.removeAttr( 'style' );
				self.container.removeAttr( 'style' );

				if ( response.success ) {

					self.container.data( 'page', page );

					if ( page === self.pages ) {
						self.button.css( 'display', 'none' );
					}

					var $html = $( response.data.html );

					$html.find( 'div[data-element_type]' ).each( function() {

						var $this       = $( this ),
							elementType = $this.data( 'element_type' );

						if( 'widget' === elementType ){
							elementType = $this.data( 'widget_type' );
							window.elementorFrontend.hooks.doAction( 'frontend/element_ready/widget', $this, $ );
						}

						window.elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $this, $ );

					});

					if ( self.slider && self.slider.length ) {

						var $slider = self.slider.find( '> .jet-listing-grid__items' );

						if ( !$slider.hasClass( 'slick-initialized' ) ) {
							self.container.append( $html );

							var itemsCount = self.container.find( '> .jet-listing-grid__item' ).length;

							self.slider.addClass( 'jet-listing-grid__slider' );
							JetEngine.initSlider( self.slider, { itemsCount: itemsCount } );

						} else {
							$html.each( function( index, el ) {
								$slider.slick( 'slickAdd', el );
							});
						}

					} else {

						self.container.append( $html );

						if ( self.masonry && self.masonry.length ) {
							JetEngine.initMasonry( self.masonry );
						}

					}

				}

			} ).fail( function() {
				self.button.removeAttr( 'style' );
				self.container.removeAttr( 'style' );
			} );

		},

		initSlider: function( $slider, customOptions ) {
			var options     = $slider.data( 'slider_options' ),
				windowWidth = $( window ).width(),
				tabletBP    = 1025,
				mobileBP    = 768,
				tabletSlides, mobileSlides, defaultOptions, slickOptions;

			customOptions = customOptions || {};

			options = $.extend( {}, options, customOptions );

			if ( options.itemsCount <= options.slidesToShow.desktop && windowWidth >= tabletBP ) { // 1025 - ...
				$slider.removeClass( 'jet-listing-grid__slider' );
				return;
			} else if ( options.itemsCount <= options.slidesToShow.tablet && tabletBP > windowWidth && windowWidth >= mobileBP ) { // 768 - 1024
				$slider.removeClass( 'jet-listing-grid__slider' );
				return;
			} else if ( options.itemsCount <= options.slidesToShow.mobile && windowWidth < mobileBP ) { // 0 - 767
				$slider.removeClass( 'jet-listing-grid__slider' );
				return;
			}

			if ( options.slidesToShow.tablet ) {
				tabletSlides = options.slidesToShow.tablet;
			} else {
				tabletSlides = 1 === options.slidesToShow.desktop ? 1 : 2;
			}

			if ( options.slidesToShow.mobile ) {
				mobileSlides = options.slidesToShow.mobile;
			} else {
				mobileSlides = 1;
			}

			options.slidesToShow = options.slidesToShow.desktop;

			defaultOptions = {
				customPaging: function( slider, i ) {
					return $( '<span />' ).text( i + 1 );
				},
				slide: '.jet-listing-grid__item',
				dotsClass: 'jet-slick-dots',
				responsive: [
					{
						breakpoint: 1025,
						settings: {
							slidesToShow: tabletSlides,
						}
					},
					{
						breakpoint: 768,
						settings: {
							slidesToShow: mobileSlides,
							slidesToScroll: 1
						}
					}
				]
			};

			slickOptions = $.extend( {}, defaultOptions, options );

			var $sliderItems = $slider.find( '> .jet-listing-grid__items' );

			if ( $sliderItems.hasClass( 'slick-initialized' ) ) {
				$sliderItems.slick( 'refresh', true );
				return;
			}

			$sliderItems.slick( slickOptions );
		},

		maybeReinitSlider: function( event, $scope ) {
			var $slider = $scope.find( '.jet-listing-grid__slider' );

			if ( $slider.length ) {
				$slider.each( function() {
					JetEngine.initSlider( $( this ) );
				} );
			}
		},

		widgetDynamicField: function( $scope ) {

			var $slider = $scope.find( '.jet-engine-gallery-slider' );

			if ( $slider.length ) {
				if ( $.isFunction( $.fn.imagesLoaded ) ) {
					$slider.imagesLoaded().always( function( instance ) {
						$slider.slick( $slider.data( 'atts' ) );
					} );
				}
			}

		},

		switchCalendarMonth: function( $event ) {

			var $this     = $( this ),
				$calendar = $this.closest( '.jet-calendar' ),
				$widget   = $calendar.closest( '.elementor-widget-container' ),
				settings  = $calendar.data( 'settings' ),
				post      = $calendar.data( 'post' ),
				month     = $this.data( 'month' );

			$calendar.addClass( 'jet-calendar-loading' );

			JetEngine.currentRequest = {
				action: 'jet_engine_calendar_get_month',
				month: month,
				settings: settings,
				post: post,
			};

			$( document ).trigger( 'jet-engine-request-calendar' );

			$.ajax({
				url: JetEngineSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: JetEngine.currentRequest,
			}).done( function( response ) {
				if ( response.success ) {
					$widget.html( response.data.content );
				}
				$calendar.removeClass( 'jet-calendar-loading' );
			} );


		},

		filters: ( function() {

			var callbacks = {};

			return {

				addFilter: function( name, callback ) {

					if ( ! callbacks.hasOwnProperty( name ) ) {
						callbacks[name] = [];
					}

					callbacks[name].push(callback);

				},

				applyFilters: function( name, value, args ) {

					if ( ! callbacks.hasOwnProperty( name ) ) {
						return value;
					}

					if ( args === undefined ) {
						args = [];
					}

					var container = callbacks[ name ];
					var cbLen     = container.length;

					for (var i = 0; i < cbLen; i++) {
						if (typeof container[i] === 'function') {
							value = container[i](value, args);
						}
					}

					return value;
				}

			};

		})()

	};

	$( window ).on( 'elementor/frontend/init', JetEngine.init );

	window.JetEngine = JetEngine;

}( jQuery ) );
