/**
 * Extend default number object with format function
 *
 * @param integer n: length of decimal
 * @param integer x: length of whole part
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 */
Number.prototype.jetFormat = function( n, x, s, c ) {
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
		num = this.toFixed(Math.max(0, ~~n));
	return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ''));
};

( function( $ ) {

	"use strict";

	var JetSmartFilterSettings = window.JetSmartFilterSettings || false;
	var xhr = null;
	var ajaxFiltersDelayID = null;

	var JetSmartFilters = {
		currentQuery: null,
		hashQuery: null,
		page: false,
		controls: false,
		resetFilters: false,
		resetHierarchy: false,
		currentHierarchy: {
			filterID: false,
			depth: false,
			trail: [],
		},
		hasRedirectData: false,
		savedFiltersQuery: [],

		init: function() {
			var self = JetSmartFilters;

			$( document )
				.on( 'click.JetSmartFilters', '.apply-filters__button[data-apply-type="reload"]', self.addFilterHandler )
				.on( 'click.JetSmartFilters', 'button[data-apply-type="ajax-reload"]', self.addFilterHandler )
				.on( 'click.JetSmartFilters', 'button[data-apply-type="ajax"]', self.addFilterHandler )
				.on( 'click.JetSmartFilters', '.jet-active-filter', self.removeFilterHandler )
				.on( 'click.JetSmartFilters', '.jet-active-tag', self.removeFilterHandler )
				.on( 'click.JetSmartFilters', '.jet-remove-all-filters__button', self.removeAllFiltersHandler )
				.on( 'click.JetSmartFilters', '.jet-active-tag--clear', self.removeAllFiltersHandler )
				.on( 'change.JetSmartFilters', 'input[data-apply-type="ajax"]', self.addFilterHandler )
				.on( 'change.JetSmartFilters', 'select[data-hierarchical="1"]', self.getNextHierarchyLevelsHandler )
				.on( 'change.JetSmartFilters', 'select[data-apply-type="ajax"]', self.addFilterHandler )
				.on( 'keypress.JetSmartFilters', 'input.jet-search-filter__input', self.onEnterFilterHandler )
				.on( 'click.JetSmartFilters', '.jet-search-filter__input-clear', self.clearFilterHandler )
				.on( 'keyup.JetSmartFilters', 'input[data-apply-type="ajax-ontyping"]', self.onTypingFilterHandler)

				.on( 'click.JetSmartFilters', 'button[data-apply-type="mixed-reload"]', self.addFilterHandler )
				.on( 'click.JetSmartFilters', 'button[data-apply-type="mixed"]', self.addFilterHandler )
				.on( 'change.JetSmartFilters', 'input[data-apply-type="mixed"]', self.addFilterHandler )
				.on( 'change.JetSmartFilters', 'select[data-apply-type="mixed"]', self.addFilterHandler )

				.on( 'click.JetSmartFilters', '.jet-filters-pagination__link', self.paginationHandler )

				.on( 'jet-filter-add-rating-vars', self.processRating )
				.on( 'jet-filter-add-checkboxes-vars', self.processCheckbox )
				.on( 'jet-filter-add-color-image-vars', self.processCheckbox )
				.on( 'jet-filter-add-check-range-vars', self.processCheckbox )
				.on( 'jet-filter-add-range-vars', self.processRange )
				.on( 'jet-filter-add-date-range-vars', self.processRange )
				.on( 'jet-filter-add-select-vars', self.processSelect )
				.on( 'jet-filter-add-sorting-vars', self.processSelect )
				.on( 'jet-filter-add-search-vars', self.processSearch )
				.on( 'jet-filter-add-radio-vars', self.processRadio )

				.on( 'jet-filter-remove-checkboxes-vars', self.removeCheckbox )
				.on( 'jet-filter-remove-color-image-vars', self.removeCheckbox )
				.on( 'jet-filter-remove-check-range-vars', self.removeCheckbox )
				.on( 'jet-filter-remove-range-vars', self.removeRange )
				.on( 'jet-filter-remove-date-range-vars', self.removeDateRange )
				.on( 'jet-filter-remove-select-vars', self.removeSelect )
				.on( 'jet-filter-remove-search-vars', self.removeSearch )
				.on( 'jet-filter-remove-radio-vars', self.removeCheckbox )
				.on( 'jet-filter-remove-rating-vars', self.removeCheckbox )

				.on( 'click.JetSmartFilters', 'input.jet-rating-star__input', self.unselectRating)

				.on( 'jet-filter-load', self.applyLoader )
				.on( 'jet-filter-loaded', self.removeLoader )

				.on( 'jet-engine-request-calendar', self.addFiltersToCalendarRequest )

				.on( 'jet-filter-before-loaded', self.showRemoveAllButtonOnAjax );

			$( window ).on( 'elementor/frontend/init', function() {
				self.maybeApplyDataFromStorage();
				self.showRemoveAllButtonOnReload();

				if ( ! self.hasRedirectData ){
					if ( false !== JetSmartFilterSettings && JetSmartFilterSettings.refresh_controls ) {
						$.each( JetSmartFilterSettings.refresh_provider, function( provider, instances ) {
							$.each( instances, function( index, queryID ) {
								setTimeout( function() {
									self.refreshControls( provider, queryID );
								} );
							});
						});
					}
				}

				self.hasRedirectData = false;
			} );

		},

		maybeApplyDataFromStorage: function() {
			var storageData = localStorage.getItem( 'jet_smart_filters_query' );

			if ( storageData ){
				storageData = JSON.parse( storageData );
				JetSmartFilters.currentQuery = storageData.query;
				JetSmartFilters.controls = storageData.controls;
				JetSmartFilters.hasRedirectData = true;

				$( 'div[data-content-provider="' + storageData.provider + '"][data-query-id="' + storageData.queryID + '"]' ).each( function() {
					var $this          = $( this ),
						queryType      = $this.data( 'query-type' ),
						queryVar       = $this.data( 'query-var' ),
						filterType     = $this.data( 'smart-filter' ),
						filterID       = parseInt( $this.data( 'filter-id' ), 10 ),
						key            = '_' + queryType + '_' + queryVar,
						skip           = false;

					$( document ).trigger(
						'jet-filter-load',
						[ $this, JetSmartFilters, storageData.provider, JetSmartFilters.currentQuery, storageData.queryID ]
					);

					if ( storageData.hierarchy && filterID === storageData.hierarchy.filterID ) {
						var filterDepth = parseInt( $this.data( 'depth' ), 10 );

						if ( 0 === filterDepth ) {
							JetSmartFilters.currentHierarchy = storageData.hierarchy;
							JetSmartFilters.getAllHierarchyLevels( $this, storageData.hierarchy.trail );
						}

						if ( filterDepth > JetSmartFilters.currentHierarchy.depth ) {
							skip = true;
						}
					}

					key = JetSmartFilters.addQueryVarSuffix( key, $this );

					if ( ! skip ) {
						$( document ).trigger(
							'jet-filter-add-' + filterType + '-vars',
							[ $this, key, JetSmartFilters ]
						);
					}
				} );

				xhr = JetSmartFilters.ajaxRequest(
					false,
					'jet_smart_filters',
					storageData.provider,
					storageData.query,
					storageData.props,
					storageData.queryID
				);

				localStorage.removeItem( 'jet_smart_filters_query' );
			}
		},

		showRemoveAllButtonOnAjax: function( e, $scope, $filters, provider, query, queryID, response ) {
			var removeButton = '.jet-remove-all-filters__button[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]';

			$( removeButton ).each( function() {
				var $scope = $( this );

				if ( !$.isEmptyObject( JetSmartFilters.currentQuery ) ) {
					$scope.parent().removeClass( 'hide' );
					$scope.parent().addClass( 'show' );
				} else {
					$scope.parent().removeClass( 'show' );
					$scope.parent().addClass( 'hide' );
				}
			} );
		},

		showRemoveAllButtonOnReload: function(  ) {
			$( '.jet-remove-all-filters__button' ).each( function(){
				var $scope        = $( this ),
					provider      = $scope.data( 'apply-provider' ),
					reloadType    = $scope.data( 'apply-type' ),
					queryID       = $scope.data( 'query-id' );

				if ( 'ajax' !== reloadType ){
					var $searchText = document.location.search,
						hasActiveFilters = $searchText.toLowerCase().indexOf( provider + '/' + queryID );

					if ( 0 < hasActiveFilters ){
						$scope.parent().removeClass( 'hide' );
						$scope.parent().addClass( 'show' );
					}
				}
			} );
		},

		resetCurrentHierarchy: function() {
			JetSmartFilters.currentHierarchy = {
				filterID: false,
				depth: false,
				trail: [],
			};
		},

		addFiltersToCalendarRequest: function( event ) {
			window.JetEngine.currentRequest.query    = JetSmartFilters.getQuery( 'jet-engine-calendar' );
			window.JetEngine.currentRequest.provider = 'jet-engine-calendar';
		},

		providerSelector: function( providerWrap, queryID ) {
			var delimiter = '';

			if ( providerWrap.inDepth ) {
				delimiter = ' ';
			}

			return providerWrap.idPrefix + queryID + delimiter + providerWrap.selector;
		},

		applyLoader: function ( event, $scope, JetSmartFilters, provider, query, queryID ) {
			var providerWrap = JetSmartFilterSettings.selectors[ provider ],
				$provider    = null;

			if ( ! queryID ) {
				queryID = 'default';
			}

			if ( 'default' === queryID ) {
				$provider = $( providerWrap.selector );
			} else {
				$provider = $( JetSmartFilters.providerSelector( providerWrap, queryID ) );
			}

			$provider.addClass( 'jet-filters-loading' );
			// add single loading only for search filter when typing
			if ( 'ajax-ontyping' === $scope.data( 'apply-type' ) ) {
				$scope.closest( '.jet-search-filter' ).addClass( 'jet-filters-single-loading' );
			} else {
				$( 'div[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"], button[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' ).addClass( 'jet-filters-loading' );
			}

			if ( 'jet-engine' === provider && JetSmartFilterSettings.settings[ provider ] ) {
				var useLoadMore = JetSmartFilterSettings.settings[ provider ][ queryID ].use_load_more || false,
					$loadMore   = $( '#' + JetSmartFilterSettings.settings[ provider ][ queryID ].load_more_id );

				if ( useLoadMore && $loadMore.length ) {
					$loadMore.addClass( 'jet-filters-loading' );
				}
			}
		},

		removeLoader: function ( event, $scope, JetSmartFilters, provider, query, queryID ) {
			var providerWrap = JetSmartFilterSettings.selectors[ provider ],
				$provider    = null;

			if ( ! queryID ) {
				queryID = 'default';
			}

			if ( 'default' === queryID ) {
				$provider = $( providerWrap.selector );
			} else {
				$provider = $( JetSmartFilters.providerSelector( providerWrap, queryID ) );
			}

			$provider.removeClass( 'jet-filters-loading' );
			$( 'div[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"], button[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' ).removeClass( 'jet-filters-loading jet-filters-single-loading' );

			if ( 'jet-engine' === provider ) {
				var useLoadMore = JetSmartFilterSettings.settings[ provider ][ queryID ].use_load_more || false,
					$loadMore   = $( '#' + JetSmartFilterSettings.settings[ provider ][ queryID ].load_more_id );

				if ( useLoadMore && $loadMore.length ) {
					$loadMore.removeClass( 'jet-filters-loading' );
				}
			}

			if ( false !== $scope ){
				if( $scope.hasClass('jet-filters-pagination__link') && $scope.data('apply-type') ){
					$('html, body').stop().animate({ scrollTop: $provider.offset().top }, 500);
				}
			}
		},

		removeFilterHandler: function() {
			var $filter    = $( this ),
				$filters   = $filter.closest( '.jet-active-filters, .jet-active-tags' ),
				data       = $filter.data( 'filter' ),
				queryID    = $filters.data( 'query-id' ),
				provider   = $filters.data( 'apply-provider' ),
				reloadType = $filters.data( 'apply-type' ),
				isAjax     = 'reload' !== reloadType ? true : false;

			$( document ).trigger(
				'jet-filter-remove-' + data.type + '-vars',
				[JetSmartFilters, data, isAjax]
			);

			if ( 'rating' === data.type ) {
				JetSmartFilters.resetRating( provider, queryID );
			}

			if ( 'reload' === reloadType ) {
				JetSmartFilters.reloadRequest( provider, queryID );
			}
		},

		removeAllFiltersHandler: function() {
			var $scope        = $( this ),
				provider      = $scope.data( 'apply-provider' ),
				reloadType    = $scope.data( 'apply-type' ),
				queryID       = $scope.data( 'query-id' ),
				$currentQuery = JetSmartFilters.currentQuery;

			if ( !queryID ) {
				queryID = 'default';
			}

			if ( 'reload' === reloadType ) {
				JetSmartFilters.reloadRequest();
			} else {
				JetSmartFilters.resetFilters = true;

				$( '.jet-filter div[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"]' ).each( function() {
					var $this          = $( this ),
						queryType      = $this.data( 'query-type' ),
						filterId       = $this.data( 'filter-id' ),
						queryVar       = $this.data( 'query-var' ),
						filterType     = $this.data( 'smart-filter' ),
						key            = '_' + queryType + '_' + queryVar;

					key = JetSmartFilters.addQueryVarSuffix( key, $this );

					if ( 'undefined' !== typeof $currentQuery[ key ] ){
						var data = {
							'id' : filterId,
							'type' : filterType,
							'value' : $currentQuery[key],
							'queryVar' : queryVar
						};

						$( document ).trigger(
							'jet-filter-remove-' + filterType + '-vars',
							[JetSmartFilters, data, true]
						);

						if ( 'rating' === filterType ) {
							JetSmartFilters.resetRating( provider, queryID );
						}

						if ( 'sorting' === filterType ) {
							JetSmartFilters.resetSorting( provider, queryID );
						}
					}
				} );

				JetSmartFilters.hashQuery = {};
				JetSmartFilters.resetFilters = false;
				JetSmartFilters.resetHierarchy = false;
				JetSmartFilters.applyAjaxFilters( $scope );
			}
		},

		removeRange: function( event, JetSmartFilters, data, isAjax ) {
			var filterID  = data.id,
				$filter   = JetSmartFilters.getFilterElement( filterID ),
				$slider   = $filter.find( '.jet-range__slider' ),
				$input    = $filter.find( '.jet-range__input' ),
				$min      = $filter.find( '.jet-range__values-min' ),
				$max      = $filter.find( '.jet-range__values-max' ),
				min       = $slider.data( 'min' ),
				max       = $slider.data( 'max' );

			$slider.slider( 'values', [ min, max ] );

			$min.text( min );
			$max.text( max );

			$input.val( min + ':' + max );

			if ( JetSmartFilters.resetFilters ) {
				return;
			}

			if ( isAjax ) {
				JetSmartFilters.applyAjaxFilters( $input );
			}
		},

		removeDateRange: function( event, JetSmartFilters, data, isAjax ) {
			var filterID = data.id,
				$filter  = JetSmartFilters.getFilterElement( filterID ),
				$from    = $filter.find( '.jet-date-range__from' ),
				$to      = $filter.find( '.jet-date-range__to' ),
				$input   = $filter.find( '.jet-date-range__input' ),
				$submit  = $filter.find( '.jet-date-range__submit' );

			$from.val( '' );
			$to.val( '' );
			$input.val( '' );

			if ( JetSmartFilters.resetFilters ) {
				return;
			}

			if ( isAjax ) {
				JetSmartFilters.applyAjaxFilters( $submit );
			}
		},

		removeCheckbox: function( event, JetSmartFilters, data, isAjax ) {
			var filterID  = data.id,
				$last     = null,
				$filter   = JetSmartFilters.getFilterElement( filterID );

			$filter.find( 'input:checked' ).each( function() {
				var $this = $( this );

				if ( $.isArray( data.value ) ) {
					// if data.value is Array
					if ( $.inArray( $this.val(), data.value ) === -1 ) {
						return;
					}
				} else {
					// if data.value is String
					if ( $this.val() != data.value ) {
						return;
					}
				}

				$this.removeAttr( 'checked' );
				$last = $this;
			});

			if ( JetSmartFilters.resetFilters ){
				return;
			}

			if ( $last && isAjax ) {
				JetSmartFilters.applyAjaxFilters( $last );
			}
		},

		removeSelect: function( event, JetSmartFilters, data, isAjax ) {
			var filterID  = data.id,
				$select   = JetSmartFilters.getFilterElement( filterID, 'div[data-filter-id="' + filterID + '"] select' );

			$select.find( 'option:selected' ).removeAttr( 'selected' );

			if ( JetSmartFilters.resetFilters ) {
				var $selectItem =  $( $select[0] );

				if ( $selectItem.data( 'hierarchical' ) && ! JetSmartFilters.resetHierarchy ) {
					JetSmartFilters.resetHierarchy = true;
					JetSmartFilters.getNextHierarchyLevels( $selectItem );
				}

				return;
			}

			if ( isAjax ) {
				JetSmartFilters.applyAjaxFilters( $select );
			}
		},

		removeSearch: function( event, JetSmartFilters, data, isAjax ) {
			var filterID     = data.id,
				$filter      = JetSmartFilters.getFilterElement( filterID ),
				$filterInput = $filter.find( '.jet-search-filter__input' );

			$filterInput.val( '' ).removeClass( 'jet-input-not-empty' );

			if ( JetSmartFilters.resetFilters ){
				return;
			}

			if ( isAjax ) {
				JetSmartFilters.applyAjaxFilters( $filterInput );
			}
		},

		unselectRating : function () {
			var $this = $(this);

			if ( $this.hasClass('is-checked') ) {
				var applyType = $this.data( 'apply-type' );

				$this.attr('checked', false);
				$this.removeClass('is-checked');

				if ( 'ajax' === applyType ) {
					$this.trigger( 'change.JetSmartFilters' );
				}
			} else {
				$this.siblings().removeClass('is-checked');
				$this.addClass('is-checked');
			}
		},

		resetRating: function( provider, queryID ) {
			var $rating = $( 'input.jet-rating-star__input[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' );

			$rating.each( function() {
				if ( $(this).hasClass('is-checked') ) {
					$(this).removeClass('is-checked');
				}
			} );
		},

		resetSorting: function( provider, queryID ) {
			var $sorting = $( 'select.jet-sorting-select[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' );

			$sorting.find('option').removeAttr('selected');
		},

		getFilterElement: function( filterID, selector ) {
			if ( ! selector ) {
				selector = 'div[data-filter-id="' + filterID + '"]';
			}

			var $el = $( selector );

			if ( ! $el.length ) {
				if ( window.elementorProFrontend && window.elementorFrontend ) {
					$.each( window.elementorFrontend.documentsManager.documents, function( index, elementorDocument ) {
						if ( 'popup' === elementorDocument.$element.data( 'elementor-type' ) ) {
							var $popupEl = elementorDocument.$element.find( selector );

							if ( $popupEl.length ) {
								$el = $popupEl;
							}
						}
					});
				}
			}

			return $el;
		},

		addQueryVarSuffix: function( queryVar, $scope ) {
			var queryVarSuffix = $scope.data( 'query-var-suffix' );

			if ( queryVarSuffix ) {
				queryVar = queryVar + '|' + queryVarSuffix;
			}

			return queryVar;
		},

		processSearch: function( event, $scope, queryVar, JetSmartFilters ) {
			var $searchInput = $scope.find( 'input[type="search"]' ),
				val = $searchInput.val(),
				minLettersCount = $searchInput.data( 'min-letters-count' );

			if ( JetSmartFilters.hasRedirectData ){
				if ( JetSmartFilters.currentQuery[queryVar] ){
					$searchInput.val( JetSmartFilters.currentQuery[queryVar] );
				}

				return;
			}

			queryVar = JetSmartFilters.addQueryVarSuffix( queryVar, $scope );

			if ( ! val ) {
				return;
			}

			if ( val.length < minLettersCount ) {
				val = '';
			}

			JetSmartFilters.currentQuery[ queryVar ] = val;
			JetSmartFilters.addHashQuery( $scope, queryVar );
		},

		processRadio: function( event, $scope, queryVar, JetSmartFilters ) {
			if ( JetSmartFilters.hasRedirectData ){
				if ( JetSmartFilters.currentQuery[queryVar] && 'string' === typeof JetSmartFilters.currentQuery[queryVar] ){
					$scope.find( 'input[value="' + JetSmartFilters.currentQuery[ queryVar ] + '"]' ).attr( 'checked', true );
				}

				return;
			}

			queryVar = JetSmartFilters.addQueryVarSuffix( queryVar, $scope );

			var val = $scope.find( 'input:checked' ).val();

			if ( ! val ) {
				return;
			}

			JetSmartFilters.currentQuery[ queryVar ] = val;
			JetSmartFilters.addHashQuery( $scope, queryVar );
		},

		processRating: function( event, $scope, queryVar, JetSmartFilters ) {
			if ( JetSmartFilters.hasRedirectData ){
				if ( JetSmartFilters.currentQuery[ queryVar ] ){
					$scope.find( 'input[value="' + JetSmartFilters.currentQuery[ queryVar ] + '"]' ).attr( 'checked', true ).addClass('is-checked');
				}

				return;
			}

			queryVar = JetSmartFilters.addQueryVarSuffix( queryVar, $scope );

			var val = $scope.find( 'input:checked' ).addClass('is-checked').val();

			if ( ! val ) {
				return;
			}

			JetSmartFilters.currentQuery[ queryVar ] = val;
			JetSmartFilters.addHashQuery( $scope, queryVar );
		},

		processSelect: function( event, $scope, queryVar, JetSmartFilters ) {
			if ( JetSmartFilters.hasRedirectData ){
				$scope.find( 'option' ).each( function() {
					var $this = $( this );

					if ( $this.val() === JetSmartFilters.currentQuery[queryVar] ) {
						$this.attr( 'selected', true );
					}
				} );

				return;
			}

			queryVar = JetSmartFilters.addQueryVarSuffix( queryVar, $scope );

			var val            = $scope.find( 'option:selected' ).val(),
				isHierarchical = $scope.data( 'hierarchical' );

			if ( ! val ) {
				return;
			}

			if ( JetSmartFilters.currentQuery[ queryVar ] && ! isHierarchical ) {
				if ( ! JetSmartFilters.isArray( JetSmartFilters.currentQuery[ queryVar ] ) ) {
					JetSmartFilters.currentQuery[ queryVar ] = [ JetSmartFilters.currentQuery[ queryVar ] ];
				}

				JetSmartFilters.currentQuery[ queryVar ].push( val );
			} else {
				JetSmartFilters.currentQuery[ queryVar ] = val;
			}

			JetSmartFilters.addHashQuery( $scope, queryVar );
		},

		isArray: function(o) {
			return Object.prototype.toString.call(o) === '[object Array]';
		},

		getAllHierarchyLevels: function( $scope, trail ) {
			if ( ! $scope.length || ! trail.length ) {
				return;
			}

			var toDepth  = trail.length - 1,
				filterId = $scope.data( 'filter-id' );

			$.ajax({
				url: JetSmartFilterSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'jet_smart_filters_get_hierarchy_level',
					values: trail,
					filter_id: $scope.data( 'filter-id' ),
					args: {
						apply_type: $scope.data( 'apply-type' ),
						content_provider: $scope.data( 'content-provider' ),
						query_id: $scope.data( 'query-id' ),
						layout_options: $scope.data( 'layout-options' ),
					}
				},
			}).done( function( response ) {
				for ( var j = 0; j <= toDepth + 1; j++ ) {
					var $item = $( 'div[data-hierarchy="' + filterId + '-' + j + '"]' );
					if ( $item.length ) {
						$item.replaceWith( response.data[ 'level_' + j ] );
					}
				}
			});
		},

		getNextHierarchyLevels: function( $el ) {
			var $scope     = $el.closest( 'div[data-hierarchical="1"]' ),
				$container = $el.closest( 'div.jet-filter' ),
				depth      = 0,
				newDepth   = 0,
				maxDepth   = 0,
				values     = [],
				filterId   = 0,
				indexer    = false,
				provider   = $scope.data( 'content-provider' ),
				queryID    = $scope.data( 'query-id' ),
				applyType  = $scope.data( 'apply-type' ),
				$item;

			if ( ! $scope.length ) {
				return;
			}

			depth    = parseInt( $scope.data( 'depth' ), 10 );
			newDepth = depth + 1;
			maxDepth = parseInt( $scope.data( 'max-depth' ), 10 );
			filterId = $scope.data( 'filter-id' );

			JetSmartFilters.currentHierarchy.filterID = filterId;
			JetSmartFilters.currentHierarchy.depth    = depth;

			for ( var i = 0; i <= depth; i++ ) {
				var filterSelector = 'div[data-hierarchy="' + filterId + '-' + i + '"]';

				$item = $( filterSelector );

				values.push( {
					value: $item.find( 'option:selected' ).val() || false,
					tax: $item.data( 'query-var' ),
					selector: filterSelector,
				} );

			}

			for ( var j = newDepth; j <= maxDepth; j++ ) {
				$item = $( 'div[data-hierarchy="' + filterId + '-' + j + '"]' );
				$item.addClass( 'jet-filters-loading' );
			}

			JetSmartFilters.currentHierarchy.trail = values;

			if ( 'yes' === $container.data( 'show-counter' ) && 'reload' === applyType ) {
				if ( JetSmartFilterSettings.queries[ provider ] ) {
					indexer = {
						query: JetSmartFilters.getQuery( provider ),
						defaults: JetSmartFilterSettings.queries[ provider ][ queryID ],
						provider: provider + '/' + queryID,
					};
				}
			}

			$.ajax({
				url: JetSmartFilterSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'jet_smart_filters_get_hierarchy_level',
					depth: newDepth,
					values: values,
					filter_id: $scope.data( 'filter-id' ),
					indexer: indexer,
					args: {
						apply_type: applyType,
						content_provider: provider,
						query_id: queryID,
						layout_options: $scope.data( 'layout-options' ),
					}
				},
			}).done( function( response ) {

				for ( var j = newDepth; j <= maxDepth; j++ ) {
					$item = $( 'div[data-hierarchy="' + filterId + '-' + j + '"]' );
					$item.replaceWith( response.data[ 'level_' + j ] );
				}

				$( document ).trigger(
					'jet-filter-hierarchy-updated',
					[ $scope, JetSmartFilters, response.data ]
				);
			});
		},

		getNextHierarchyLevelsHandler: function() {
			JetSmartFilters.getNextHierarchyLevels( $( this ) );
		},

		processRange: function( event, $scope, queryVar, JetSmartFilters ) {
			var val     = $scope.find( 'input[type="hidden"]' ).val(),
				$slider = $scope.find( '.jet-range__slider' ),
				values  = val.split( ':' );

			if ( JetSmartFilters.hasRedirectData ){
				if ( JetSmartFilters.currentQuery[ queryVar ] ) {
					values = JetSmartFilters.currentQuery[ queryVar ].split(':');

					$scope.find( 'input[type="hidden"]' ).val( JetSmartFilters.currentQuery[queryVar] );
					$scope.find( 'input.jet-date-range__from' ).val( values[0] );
					$scope.find( 'input.jet-date-range__to' ).val( values[1] );

					if ( $slider.length ) {
						var $min    = $scope.find( '.jet-range__values-min' ),
							$max    = $scope.find( '.jet-range__values-max' ),
							format  = $scope.data( 'format' );

						if ( ! format ) {
							format = {
								'thousands_sep' : '',
								'decimal_sep' : '',
								'decimal_num' : 0,
							};
						}

						$slider.on( 'jet-smart-filters/init-slider', function( event, sliderInstance ) {
							sliderInstance.slider( "values", this.values );

							$min.html( parseInt(this.values[ 0 ]).jetFormat(
								format.decimal_num,
								3,
								format.thousands_sep,
								format.decimal_sep
							) );

							$max.html( parseInt(this.values[ 1 ]).jetFormat(
								format.decimal_num,
								3,
								format.thousands_sep,
								format.decimal_sep
							) );

						}.bind( { values: values } ) );
					}
				}

				return;
			}

			queryVar = JetSmartFilters.addQueryVarSuffix( queryVar, $scope );

			if ( ! values[0] && ! values[1] ) {
				return;
			}

			// Prevent of adding slider defaults
			if ( $slider.length ) {
				var min = $slider.data( 'min' ),
					max = $slider.data( 'max' );

				if ( values[0] && values[0] == min && values[1] && values[1] == max ) {
					return;
				}
			}

			if ( ! val ) {
				return;
			}

			JetSmartFilters.currentQuery[ queryVar ] = val;
			JetSmartFilters.addHashQuery( $scope, queryVar );
		},

		processCheckbox: function( event, $scope, queryVar, JetSmartFilters ) {
			var checkboxData = [],
				relationalOperator = $scope.data( 'relational-operator' );

			if ( JetSmartFilters.hasRedirectData ) {
				if ( JetSmartFilters.currentQuery[queryVar] && 'object' === typeof JetSmartFilters.currentQuery[queryVar] ) {
					JetSmartFilters.currentQuery[queryVar].forEach( function( key ) {
						$scope.find( 'input[value="' + key + '"]' ).attr( 'checked', true );
					});
				}

				return;
			}

			queryVar = JetSmartFilters.addQueryVarSuffix( queryVar, $scope );

			$scope.find( 'input:checked' ).each( function() {
				checkboxData.push( $( this ).val() );
			} );

			if ( checkboxData.length ) {
				JetSmartFilters.currentQuery[ queryVar ] = checkboxData;

				if ( relationalOperator && checkboxData.length > 1 ) {
					JetSmartFilters.currentQuery[ queryVar ].push( 'operator_' + relationalOperator );
				}
			}

			JetSmartFilters.addHashQuery( $scope, queryVar );
		},

		refreshControls: function( provider, queryID ) {
			var action = 'jet_smart_filters_refresh_controls',
				query  = JetSmartFilters.getQuery( provider ),
				props  = null,
				$pager = $( '.jet-smart-filters-pagination[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"]' );

			if ( xhr ) {
				xhr.abort();
			}

			if ( $pager.length ) {
				JetSmartFilters.controls = $pager.data( 'controls' );
			}

			if ( JetSmartFilterSettings.props && JetSmartFilterSettings.props[ provider ] && JetSmartFilterSettings.props[ provider ][ queryID ] ) {
				props = JetSmartFilterSettings.props[ provider ][ queryID ];
			}

			xhr = JetSmartFilters.ajaxRequest(
				$pager.length ? $pager : false,
				action,
				provider,
				query,
				props,
				queryID
			);
		},

		paginationHandler: function() {
			var $this = $( this );

			JetSmartFilters.page     = $this.data( 'page' );
			JetSmartFilters.controls = $this.closest( '.jet-smart-filters-pagination' ).data( 'controls' );
			JetSmartFilters.applyFilters( $this );
		},

		onEnterFilterHandler: function( e ) {
			if ( 'keypress' === e.type && 13 === e.keyCode){
				var $this = $( this );

				JetSmartFilters.applyFilters( $this );
			}
		},

		clearFilterHandler: function( e ) {
			var $clearBtn = $( this ),
				$searchInput = $clearBtn.siblings('.jet-input-not-empty');

			if ( $searchInput.length ) {
				clearTimeout( ajaxFiltersDelayID );
				$searchInput.removeClass('jet-input-not-empty');
				$searchInput.val('');
				JetSmartFilters.applyFilters( $searchInput );
			}
		},

		onTypingFilterHandler: function( e ) {
			var $this = $( this ),
				value = e.target.value,
				minLettersCount = $this.data( 'min-letters-count' );

			if ( minLettersCount <= value.length ) {
				JetSmartFilters.ajaxFiltersWithDelay( $this );

				$this.addClass('jet-input-not-empty');
			} else {
				if ( $this.hasClass( 'jet-input-not-empty' ) ) {
					JetSmartFilters.ajaxFiltersWithDelay( $this );
				}

				$this.removeClass( 'jet-input-not-empty' );
			}
		},

		ajaxFiltersWithDelay: function( $scope, delay ) {
			if ( delay === undefined ) {
				delay = 350;
			}

			clearTimeout( ajaxFiltersDelayID );
			ajaxFiltersDelayID = setTimeout( function() {
				JetSmartFilters.applyFilters( $scope );
			}, delay );
		},

		addFilterHandler: function() {
			var $this = $( this );

			JetSmartFilters.applyFilters( $this );
		},

		applyFilters: function( $scope ) {
			var applyType = $scope.data( 'apply-type' );

			if ( 'reload' === applyType ) {
				JetSmartFilters.applyReloadFilters( $scope );
			} else {
				JetSmartFilters.applyAjaxFilters( $scope );
			}
		},

		applyAjaxFilters: function( $scope ) {
			var provider         = $scope.data( 'apply-provider' ),
				queryID          = $scope.data( 'query-id' ),
				applyRedirect    = $scope.data( 'redirect' ),
				redirectPath     = $scope.data( 'redirect-path' ),
				$pager           = $( '.jet-smart-filters-pagination[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"]' ),
				currentHierarchy = JetSmartFilters.currentHierarchy,
				query            = {},
				props            = null;

			if ( ! queryID ) {
				queryID = 'default';
			}

			query = JetSmartFilters.getQuery( provider, queryID );

			if ( 'yes' === applyRedirect ) {
				var localStorageData = {};

				localStorageData.provider = provider;
				localStorageData.queryID = queryID;
				localStorageData.query = query;

				if ( $pager.length ) {
					localStorageData.controls = $pager.data( 'controls' );
				}

				if ( JetSmartFilterSettings.props && JetSmartFilterSettings.props[ provider ] && JetSmartFilterSettings.props[ provider ][ queryID ] ) {
					localStorageData.props = JetSmartFilterSettings.props[ provider ][ queryID ];
				}

				localStorageData.JetSmartFilterSettings = JetSmartFilterSettings;

				if ( currentHierarchy.trail.length ) {
					localStorageData.hierarchy = currentHierarchy;
				}

				localStorage.setItem( 'jet_smart_filters_query', JSON.stringify( localStorageData ) );
				document.location = redirectPath;

			} else {

				if ( xhr ) {
					xhr.abort();
				}

				if ( $pager.length ) {
					JetSmartFilters.controls = $pager.data( 'controls' );
				}

				$( document ).trigger(
					'jet-filter-load',
					[ $scope, JetSmartFilters, provider, query, queryID ]
				);

				if ( JetSmartFilterSettings.props && JetSmartFilterSettings.props[ provider ] && JetSmartFilterSettings.props[ provider ][ queryID ] ) {
					props = JetSmartFilterSettings.props[ provider ][ queryID ];
				}

				xhr = JetSmartFilters.ajaxRequest(
					$scope,
					'jet_smart_filters',
					provider,
					query,
					props,
					queryID
				);
			}
		},

		applyReloadFilters: function ( $scope ) {
			var queryID      = $scope.data( 'query-id' ),
				provider     = $scope.data( 'apply-provider' ),
				hasRedirect  = $scope.data( 'redirect' ),
				redirectPath = $scope.data( 'redirect-path' );

			if ( ! queryID ) {
				queryID = 'default';
			}

			JetSmartFilters.reloadRequest( provider, queryID, ( 'yes' === hasRedirect && redirectPath ) ? redirectPath : false );
		},

		reloadRequest: function( provider, queryID, redirectPath ) {
			var query     = JetSmartFilters.getQuery( provider, queryID ),
				urlParams = JetSmartFilters.getUrlParams( provider + '/' + queryID, query );

			if ( redirectPath && '' !== redirectPath ) {
				document.location = redirectPath + '?' + urlParams;
			} else {
				if ( urlParams ) {
					document.location.search = urlParams;
				} else {
					document.location = window.location.pathname;
				}
			}
		},

		getPreparedFilters: function( provider, queryID, $scope ) {
			// Ensure requested provider filters is exists on the page
			if ( ! window.JetSmartFilterSettings ) {
				return;
			}

			if ( ! window.JetSmartFilterSettings.filters[ provider ] ) {
				return;
			}

			if ( ! window.JetSmartFilterSettings.filters[ provider ][ queryID ] ) {
				return;
			}

			var filters        = JetSmartFilterSettings.filters[ provider ][ queryID ],
				result         = {},
				isHierarchical = false,
				depth          = 0,
				changedFID     = 0;

			if ( $scope ) {
				$scope         = $scope.closest( 'div[data-content-provider="' + provider + '"]' );
				isHierarchical = $scope.data( 'hierarchical' );
				depth          = parseInt( $scope.data( 'depth' ), 10 );
				changedFID     = parseInt( $scope.data( 'filter-id' ), 10 );
			}

			if ( ! filters ) {
				return result;
			}

			$.each( filters, function( filterID, filter ) {
				var hierarchyValues = [],
					$item           = null;

				if ( filter.hierarchical ) {
					if ( JetSmartFilters.hasRedirectData ) {
						hierarchyValues = JetSmartFilters.currentHierarchy.trail;
					} else {
						for ( var i = 0; i <= filter.max_depth; i++ ) {
							$item = $( 'div[data-hierarchy="' + filterID + '-' + i + '"]' );

							if ( ( changedFID != filterID ) || ( isHierarchical && i <= depth ) ) {
								hierarchyValues.push( {
									value: $item.find( 'option:selected' ).val() || false,
									tax: $item.data( 'query-var' ),
								} );
							}
						}
					}

					filter['values'] = hierarchyValues;
				}

				result[ filterID ] = filter;

				// clear value after initialization
				filter.value = false;
			} );

			return result;
		},

		getApplyType: function( $scope ) {
			var applyType = '';

			if ( $scope && $scope.data( 'apply-type' ) ) {
				applyType = $scope.data( 'apply-type' );
			}

			return applyType;
		},

		ajaxRequest: function( $scope, action, provider, query, props, queryID ) {
			if ( ! queryID ) {
				queryID = 'default';
			}

			var defaults, settings, filters, applyType, controls;

			if ( JetSmartFilterSettings.queries[ provider ] ) {
				defaults = JetSmartFilterSettings.queries[ provider ][ queryID ];
			} else {
				defaults = {};
			}

			if ( JetSmartFilterSettings.settings[ provider ] ) {
				settings = JetSmartFilterSettings.settings[ provider ][ queryID ];
			} else {
				settings = {};
			}

			filters                  = JetSmartFilters.getPreparedFilters( provider, queryID, $scope );
			applyType                = JetSmartFilters.getApplyType( $scope );
			controls                 = JetSmartFilters.controls;
			JetSmartFilters.controls = false;

			return $.ajax({
				url: JetSmartFilterSettings.ajaxurl,
				type: 'POST',
				dataType: 'json',
				data: {
					action: action,
					provider: provider + '/' + queryID,
					query: query,
					defaults: defaults,
					settings: settings,
					filters: filters,
					paged: JetSmartFilters.page,
					props: props,
					controls: controls,
					apply_type: applyType
				},
			}).done( function( response ) {
				if ( 'jet_smart_filters' === action ) {
					JetSmartFilters.renderResult( response, provider, queryID );

					$( document ).trigger(
						'jet-filter-before-loaded',
						[ $scope, JetSmartFilters, provider, query, queryID, response ]
					);

					$( document ).trigger(
						'jet-filter-loaded',
						[ $scope, JetSmartFilters, provider, query, queryID ]
					);
				} else {
					JetSmartFilters.renderActiveFilters( response.activeFilters, provider, queryID );
					JetSmartFilters.renderActiveTags( response.activeTags, provider, queryID );
					JetSmartFilters.renderPagination( response.pagination, provider, queryID );
				}

				JetSmartFilters.setHash( provider, queryID );
				JetSmartFilters.hashQuery = {};
				JetSmartFilters.page = false;
			});
		},

		renderResult: function( result, provider, queryID ) {
			if ( ! queryID ) {
				queryID = 'default';
			}

			var providerWrap = JetSmartFilterSettings.selectors[ provider ],
				$scope       = null;

			if ( 'default' === queryID ) {
				$scope = $( providerWrap.selector );
			} else {
				$scope = $( JetSmartFilters.providerSelector( providerWrap, queryID ) );
			}

			if ( ! result.customRender ) {

				if ( 'insert' === providerWrap.action ) {
					$scope.html( result.content );
				} else {
					$scope.replaceWith( result.content );
				}

				JetSmartFilters.triggerElementorWidgets( $scope, provider );

			} else {

				$scope.trigger(
					'jet-filter-custom-content-render',
					[ result, JetSmartFilters, provider, queryID ]
				);

			}

			$( document ).trigger(
				'jet-filter-content-rendered',
				[ $scope, JetSmartFilters, provider, queryID ]
			);

			JetSmartFilters.renderActiveFilters( result.activeFilters, provider, queryID );
			JetSmartFilters.renderActiveTags( result.activeTags, provider, queryID );
			JetSmartFilters.renderPagination( result.pagination, provider, queryID );
		},

		triggerElementorWidgets : function( $scope, provider ) {
			switch ( provider ) {
				case 'jet-engine':
					window.elementorFrontend.hooks.doAction(
						'frontend/element_ready/jet-listing-grid.default',
						$scope,
						$
					);

					break;

				case 'epro-portfolio':
					window.elementorFrontend.hooks.doAction(
						'frontend/element_ready/portfolio.default',
						$scope,
						$
					);

					break;
			}

			$scope.find( 'div[data-element_type]' ).each( function() {
				var $this       = $( this ),
					elementType = $this.data( 'element_type' );

				if( 'widget' === elementType ){
					elementType = $this.data( 'widget_type' );
					window.elementorFrontend.hooks.doAction( 'frontend/element_ready/widget', $this, $ );
				}

				window.elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $this, $ );
			});
		},

		renderActiveFilters: function( html, provider, queryID ) {
			if ( ! queryID ) {
				queryID = 'default';
			}

			var $activeFiltersWrap = $( 'div.jet-active-filters[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' );

			if ( $activeFiltersWrap.length ) {
				$activeFiltersWrap.html( html );
				$activeFiltersWrap.find( '.jet-active-filters__title' ).html(
					$activeFiltersWrap.data( 'filters-label' )
				);
			}
		},

		renderActiveTags: function( html, provider, queryID ) {
			if ( ! queryID ) {
				queryID = 'default';
			}

			var $activeTagsWrap = $( 'div.jet-active-tags[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' );

			if ( $activeTagsWrap.length ) {
				$activeTagsWrap.html( html );
				$activeTagsWrap.find( '.jet-active-tags__title' ).html(
					$activeTagsWrap.data( 'tags-label' )
				);

				// clear item
				var $clearItem = $activeTagsWrap.find( '.jet-active-tag.jet-active-tag--clear' ),
					clearItemLabel = $activeTagsWrap.data( 'clear-item-label' );

				if ( $clearItem.length ) {
					if ( clearItemLabel ) {
						$clearItem.find( '.jet-active-tag__val' ).html( clearItemLabel );
						$clearItem.data( 'apply-type', $activeTagsWrap.data( 'apply-type' ) );
						$clearItem.data( 'apply-provider', provider );
						$clearItem.data( 'query-id', queryID );
					} else {
						$clearItem.remove();
					}
				}
			}
		},

		renderPagination: function( html, provider, queryID ) {
			if ( ! queryID ) {
				queryID = 'default';
			}

			var $paginationWrap = $( 'div.jet-smart-filters-pagination[data-apply-provider="' + provider + '"][data-query-id="' + queryID + '"]' );

			if ( $paginationWrap.length ) {
				$paginationWrap.html( html );
			}
		},

		getQuery: function( provider, queryID ) {
			var query = null;

			if ( ! queryID ) {
				queryID = 'default';
			}

			JetSmartFilters.currentQuery = {};

			$( 'div[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"]' ).each( function() {
				var $this          = $( this ),
					queryType      = $this.data( 'query-type' ),
					queryVar       = $this.data( 'query-var' ),
					filterType     = $this.data( 'smart-filter' ),
					filterID       = parseInt( $this.data( 'filter-id' ), 10 ),
					key            = '_' + queryType + '_' + queryVar,
					skip           = false;

				if ( JetSmartFilters.currentHierarchy.filterID === filterID ) {
					var filterDepth = parseInt( $this.data( 'depth' ), 10 );
					if ( filterDepth > JetSmartFilters.currentHierarchy.depth ) {
						skip = true;
					}
				}

				if ( ! skip ) {
					$( document ).trigger(
						'jet-filter-add-' + filterType + '-vars',
						[ $this, key, JetSmartFilters ]
					);
				}
			} );

			if ( window.elementorProFrontend && window.elementorFrontend ) {
				$.each( window.elementorFrontend.documentsManager.documents, function( index, elementorDocument ) {
					if ( 'popup' === elementorDocument.$element.data( 'elementor-type' ) ) {
						elementorDocument.$element.find( 'div[data-content-provider="' + provider + '"][data-query-id="' + queryID + '"]' ).each( function() {
							var $this          = $( this ),
								queryType      = $this.data( 'query-type' ),
								queryVar       = $this.data( 'query-var' ),
								filterType     = $this.data( 'smart-filter' ),
								filterID       = parseInt( $this.data( 'filter-id' ), 10 ),
								key            = '_' + queryType + '_' + queryVar,
								skip           = false;

							if ( JetSmartFilters.currentHierarchy.filterID === filterID ) {
								var filterDepth = parseInt( $this.data( 'depth' ), 10 );
								if ( filterDepth > JetSmartFilters.currentHierarchy.depth ) {
									skip = true;
								}
							}

							if ( ! skip ) {
								$( document ).trigger(
									'jet-filter-add-' + filterType + '-vars',
									[ $this, key, JetSmartFilters ]
								);
							}

						} );
					}
				});
			}

			query = JetSmartFilters.currentQuery;

			return query;
		},

		getUrlParams: function( provider, query ) {
			var prefix    = 'jet-smart-filters',
				queryStr  = '';

			if ( JetSmartFilters.page ) {
				query.jet_paged = JetSmartFilters.page
			}

			queryStr = JetSmartFilters.queryToUrlString( query );

			return queryStr ? '?' + prefix + '=' + provider + '&' + queryStr : '';
		},

		queryToUrlString: function( query ) {
			var urlString = '';

			if ( $.isEmptyObject( query ) ) {
				return urlString;
			}

			for ( var key in query ) {
				if ( urlString.length ) {
					urlString += '&';
				}

				if ( Array.isArray( query[key] ) ) {
					if ( query[key].length ) {
						urlString += key + '[]=' + query[key].join( '&' + key + '[]=' );
					}
				} else {
					urlString += key + '=' + query[key];
				}
			}

			return encodeURI( urlString );
		},

		addHashQuery: function( $scope, queryVar ) {
			if ( JetSmartFilters.currentQuery[queryVar] && ('mixed' === $scope.data( 'apply-type' ) || 'mixed-reload' === $scope.data( 'apply-type' )) ) {
				if ( ! JetSmartFilters.hashQuery ) {
					JetSmartFilters.hashQuery = {};
				}

				JetSmartFilters.hashQuery[queryVar] = JetSmartFilters.currentQuery[queryVar]
			}
		},

		setHash: function( provider, queryID ) {
			var query = JetSmartFilters.hashQuery,
				urlParams = JetSmartFilters.getUrlParams( provider + '/' + queryID, query );

			if ( !query ) {
				return;
			}

			if ( ! urlParams ) {
				urlParams = window.location.pathname;
			}

			history.replaceState( null, null, urlParams );
			//history.pushState( null, action, '?' + hash );
		},

	};

	var JSFEProCompat = {
		archivePostsClass: '.elementor-widget-archive-posts',
		defaultPostsClass: '.elementor-widget-posts',
		postsSettings: {},
		skin: 'archive_classic',

		init: function() {
			$( document ).on( 'jet-filter-content-rendered', function( event, $scope, JetSmartFilters, provider ) {
				if ( 'epro-archive' === provider || 'epro-posts' === provider ) {
					var postsSelector = JSFEProCompat.defaultPostsClass,
						$archive = null,
						widgetName = 'posts',
						hasMasonry = false;

					if ( 'epro-archive' === provider ) {
						postsSelector = JSFEProCompat.archivePostsClass;
						widgetName = 'archive-posts';
					}

					$archive = $( $scope.selector ).parent( postsSelector );

					JSFEProCompat.fitImages( $archive );
					JSFEProCompat.postsSettings = $archive.data( 'settings' );

					if ( 'widget' === $archive.data( 'element_type' ) ) {
						JSFEProCompat.skin = $archive.data( 'widget_type' );
					} else {
						JSFEProCompat.skin = $archive.data( 'element_type' );
					}

					JSFEProCompat.skin = JSFEProCompat.skin.split( widgetName + '.' );
					JSFEProCompat.skin = JSFEProCompat.skin[1];

					hasMasonry = JSFEProCompat.postsSettings[ JSFEProCompat.skin + '_masonry' ];

					if ( 'yes' === hasMasonry ) {
						setTimeout( JSFEProCompat.initMasonry( $archive ), 0 );
					}
				}
			} );
		},

		initMasonry: function( $archive ) {
			var $container = $archive.find( '.elementor-posts-container' ),
				$posts     = $container.find( '.elementor-post' ),
				settings   = JSFEProCompat.postsSettings,
				colsCount  = 1,
				hasMasonry = true;

			$posts.css({
				marginTop: '',
				transitionDuration: ''
			});

			var currentDeviceMode = window.elementorFrontend.getCurrentDeviceMode();

			switch ( currentDeviceMode ) {
				case 'mobile':
					colsCount = settings[ JSFEProCompat.skin + '_columns_mobile' ];
					break;
				case 'tablet':
					colsCount = settings[ JSFEProCompat.skin + '_columns_tablet' ];
					break;
				default:
					colsCount = settings[ JSFEProCompat.skin + '_columns' ];
			}

			hasMasonry = colsCount >= 2;

			$container.toggleClass( 'elementor-posts-masonry', hasMasonry );

			if ( ! hasMasonry ) {
				$container.height('');
				return;
			}

			var verticalSpaceBetween = settings[ JSFEProCompat.skin + '_row_gap' ]['size'];

			if ( ! verticalSpaceBetween ) {
				verticalSpaceBetween = settings[ JSFEProCompat.skin + '_item_gap' ]['size'];
			}

			var masonry = new elementorModules.utils.Masonry({
				container: $container,
				items: $posts.filter( ':visible' ),
				columnsCount: colsCount,
				verticalSpaceBetween: verticalSpaceBetween
			});

			masonry.run();
		},

		fitImage: function( $post ) {
			var $imageParent = $post.find( '.elementor-post__thumbnail' ),
				$image       = $imageParent.find( 'img' ),
				image        = $image[0];

			if ( ! image ) {
				return;
			}

			var imageParentRatio = $imageParent.outerHeight() / $imageParent.outerWidth(),
				imageRatio       = image.naturalHeight / image.naturalWidth;

			$imageParent.toggleClass( 'elementor-fit-height', imageRatio < imageParentRatio );
		},

		fitImages: function( $scope ) {
			var $element  = $scope,
				itemRatio = getComputedStyle( $element[0], ':after' ).content;

			$element.find( '.elementor-posts-container' ).toggleClass( 'elementor-has-item-ratio', !!itemRatio.match(/\d/) );

			$element.find( '.elementor-post' ).each( function () {
				var $post = $(this),
					$image = $post.find( '.elementor-post__thumbnail img' );

				JSFEProCompat.fitImage($post);

				$image.on( 'load', function () {
					JSFEProCompat.fitImage( $post );
				});
			} );
		},
	};

	JSFEProCompat.init();

	var JetSmartFiltersUI = {
		init: function() {
			var widgets = {
				'jet-smart-filters-range.default' : JetSmartFiltersUI.range,
				'jet-smart-filters-date-range.default' : JetSmartFiltersUI.dateRange
			};

			$.each( widgets, function( widget, callback ) {
				window.elementorFrontend.hooks.addAction( 'frontend/element_ready/' + widget, callback );
			});
		},

		range: function( $scope ) {
			$scope.find( '.jet-range' ).each( function() {
				var $el = $( this );
				JetSmartFiltersUI.rangeHandler( $el );
			} );
		},

		rangeHandler: function( $scope ) {
			var $slider = $scope.find( '.jet-range__slider' ),
				$input  = $scope.find( '.jet-range__input' ),
				$min    = $scope.find( '.jet-range__values-min' ),
				$max    = $scope.find( '.jet-range__values-max' ),
				format  = $slider.data( 'format' ),
				slider;

			if ( ! format ) {
				format = {
					'thousands_sep' : '',
					'decimal_sep' : '',
					'decimal_num' : 0,
				};
			}

			slider = $slider.slider({
				range: true,
				min: $slider.data( 'min' ),
				max: $slider.data( 'max' ),
				step: $slider.data( 'step' ),
				values: $slider.data( 'defaults' ),
				slide: function( event, ui ) {
					$input.val( ui.values[ 0 ] + ':' + ui.values[ 1 ] );

					$min.html( ui.values[ 0 ].jetFormat(
						format.decimal_num,
						3,
						format.thousands_sep,
						format.decimal_sep
					) );

					$max.html( ui.values[ 1 ].jetFormat(
						format.decimal_num,
						3,
						format.thousands_sep,
						format.decimal_sep
					) );

				},
				stop: function( event, ui ) {
					$input.trigger( 'change' );
				},
			});

			$slider.trigger( 'jet-smart-filters/init-slider', [ slider ] );
		},

		dateRange: function( $scope ) {
			var $id = $scope.data('id'),
				$from  = $scope.find( '.jet-date-range__from' ),
				$to    = $scope.find( '.jet-date-range__to' ),
				$input = $scope.find( '.jet-date-range__input' ),
				from,
				$texts = JetSmartFilterSettings.datePickerData,
				to;

			from = $from.datepicker({
				defaultDate: '+1w',
				closeText: $texts.closeText,
				prevText: $texts.prevText,
				nextText: $texts.nextText,
				currentText: $texts.currentText,
				monthNames: $texts.monthNames,
				monthNamesShort: $texts.monthNamesShort,
				dayNames: $texts.dayNames,
				dayNamesShort: $texts.dayNamesShort,
				dayNamesMin: $texts.dayNamesMin,
				weekHeader: $texts.weekHeader,
				firstDay: parseInt( JetSmartFilterSettings.misc.week_start, 10 ),
				beforeShow: function (textbox, instance) {
					var $calendar = instance.dpDiv;
					$calendar.addClass('jet-smart-filters-datepicker-' + $id );
				},
				onClose: function (textbox, instance){
					var $calendar = instance.dpDiv;
					$calendar.removeClass('jet-smart-filters-datepicker-' + $id );
				}
			}).on( 'change', function() {
				to.datepicker( 'option', 'minDate', JetSmartFiltersUI.getDate( this ) );
				$input.val( $from.val() + ':' + $to.val() );
			});

			to = $to.datepicker({
				defaultDate: '+1w',
				closeText: $texts.closeText,
				prevText: $texts.prevText,
				nextText: $texts.nextText,
				currentText: $texts.currentText,
				monthNames: $texts.monthNames,
				monthNamesShort: $texts.monthNamesShort,
				dayNames: $texts.dayNames,
				dayNamesShort: $texts.dayNamesShort,
				dayNamesMin: $texts.dayNamesMin,
				weekHeader: $texts.weekHeader,
				firstDay: parseInt( JetSmartFilterSettings.misc.week_start, 10 ),
				beforeShow: function (textbox, instance) {
					var $calendar = instance.dpDiv;
					$calendar.addClass('jet-smart-filters-datepicker-' + $id );
				},
				onClose: function (textbox, instance){
					var $calendar = instance.dpDiv;
					$calendar.removeClass('jet-smart-filters-datepicker-' + $id );
				}
			}).on( 'change', function() {
				from.datepicker( 'option', 'maxDate', JetSmartFiltersUI.getDate( this ) );
				$input.val( $from.val() + ':' + $to.val() );
			});
		},

		getDate: function( element ) {
			var dateFormat = 'mm/dd/yy',
				date;

			try {
				date = $.datepicker.parseDate( dateFormat, element.value );
			} catch ( error ) {
				date = null;
			}

			return date;
		}

	};

	JetSmartFilters.init();

	$( window ).on( 'elementor/frontend/init', JetSmartFiltersUI.init );

	window.JetSmartFilters = JetSmartFilters;

}( jQuery ) );
