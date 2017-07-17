'use strict';

angular.module('myNetCMSApp')

.service('HelpTour', ['$http', '$sce', function($http, $sce) {
		/**
		 *	Tour files SharePoint list base path.
		 */
		const BASE_PATH = '/sites/MyNetCMSPROD/Help%20Tours/';

		/**
     *  Default template.
     */
    const DEFAULT_TEMPLATE = "<div class='popover tour'>"
              + "<div class='arrow'></div>"
              + "<h3 class='popover-title'></h3>"
              + "<div class='popover-content'></div>"
              + "<div class='popover-navigation'>"
              + "<button class='btn btn-default' data-role='prev'>« Prev</button>"
              + "<button class='btn btn-default' data-role='next'>Next »</button>"
              + "<button class='btn btn-default' data-role='end'>End tour</button>"
              + "</div>"
              + "</div>";

		/**
		 *	Help tours container object.
		 */
		var HELP_TOURS = {};

		/**
		 *	Default language.
		 */
		this.lang = 'en';

		/**
		 *	Language accessor.
		 *	@return lang {String}
		 */
		this.getLanguage = function() {
				return this.lang;
		};

		/**
		 *	Language mutator.
		 *	@param lang {String}
		 */
		this.setLanguage = function(lang) {
				this.lang = lang.toLowerCase();
				this.reloadTours();
		};

		/**
		 *	Gets the data from the config file, initilizes the tour and attaches it
		 *	to the right DOM element.
		 *	@param id {String}
		 *	@param selector {String}
		 */
		this.init = function(id, selector, trustedHtml) {
			const self = this;

			/**
			 *  Retrieve configuration data from tour file using the specified id
			 *  as file name.
			 */
			$http({
					method: 'GET',
					url:	BASE_PATH + id + '_' + self.lang + '.tour',
					headers: {
							'Content-Type' : 'application/json; charset=UTF-8'
					}
			}).then(function(result) {
						/**
						 *  JSON data stringify and parse.
						 */
						var config = JSON.parse(JSON.stringify(result.data));
						/**
						 *  Tour object instantiation using configuration data.
						 */
						var tour = self.newTour(config, id);

						/**
						 *	Save the created tour on the tour object.
						 */
						HELP_TOURS[selector] = tour;

						/**
						 *	Tours init.
						 */
						self.initTours();

						/**
						 *  Click event attaching using the specified selector.
						 */
						$(document).ready(function() {
								$('#' + selector).on('click', function() {
										var tour = self.getTour(id);
										if(tour !== false)
												tour.start(true);
								});
						});

			}, function(err) {
					console.log(err);
			});
		};

		/**
		 *	Tours initialization.
		 */
		this.initTours = function() {
				Object.keys(HELP_TOURS).map(function(k) {
						HELP_TOURS[k].init();
				});
		};

		/**
		 *	Tour reloading to change the language of the config file.
		 */
		this.reloadTours = function() {
				const self  = this;
				const tours = HELP_TOURS;
				HELP_TOURS  = {};
				Object.keys(tours).map(function(k) {
						self.init(tours[k]._options.name, k);
				});
		};

    /**
     *  Creates a new tour object.
     *  @param cnf {Object}
     *  @param id {String}
     *
     *  @return {Tour}
     */
    this.newTour = function(cnf, id) {

        const tour = new Tour({
            name:              cnf.name || id,
            steps:             [],
            container:         cnf.container || 'body',
            keyboard:          cnf.keyboard || true,
            storage:           cnf.storage  || false,
            debug:             cnf.debug    || false,
            backdrop:          cnf.backdrop || false,
            backdropContainer: cnf.backdropContainer || 'body',
            backdropPadding:   cnf.backdropPadding   || 0,
            redirect:          cnf.redirect || true,
            orphan:            cnf.orphan   || false,
            duration:          cnf.duration || false,
            delay:             cnf.delay    || false,
            basePath:          cnf.basePath || '',
            template:          cnf.template || DEFAULT_TEMPLATE,
        });

        /**
         *  Tour and steps initialization.
         */
        this.initTour(tour, cnf.steps, DEFAULT_TEMPLATE);
        return tour;
    };

		/**
		 *	Gets a specific tour given its id. Returns false if does not exist.
		 *	@param id {String}
		 *
		 *	@return tour {Tour|Boolean}
		 */
		this.getTour = function(id) {
				const len = Object.keys(HELP_TOURS).length;
				for(var k in HELP_TOURS) {
						if(HELP_TOURS[k]._options.name === id)
								return HELP_TOURS[k];
				}

				return false;
		};

    /**
     *  Adds all steps to the tour.
     *  @param tour {Tour}
     *  @param steps {Array}
     */
    this.addSteps = function(tour, steps) {
        steps.forEach(function(s) {
            tour.addStep(s);
        });
    };

    /**
     *  Adds next / prev / end functions to popover buttons.
     *  @param tour {Tour}
     *  @param steps {Array}
     */
    this.stepFunctions = function(tour, steps) {
        steps.forEach(function(s) {
            s.onShown = function(obj) {
                $('button[data-role="next"]').click(function(e){
                    tour.next();
                });
                $('button[data-role="prev"]').click(function(e){
                    tour.prev();
                });
                $('button[data-role="end"]').click(function(e){
                    tour.end();
                });
            };
        });
    };

    /**
     *  Sets the steps' template if not set.
     *  @param tour {Tour}
     *  @param tmpl {String|HTML}
     */
    this.setupTemplates = function(tour, tmpl) {
        var steps = tour._options.steps;
        Object.keys(steps).map(function(k, v) {
            Object.keys(steps[k]).map(function(i, val) {
                if(i.match(/^template/)) {
                    steps[k][i] = steps[k][i] === '' ? tmpl : steps[k][i];
                }
            });
        });
    };

    /**
     *  Initializes the tour and steps structures.
     *  @param tour {Tour}
     *  @param steps {Array}
     *  @param template {String|HTML}
     */
    this.initTour = function(tour, steps, template) {

				/**
				 *	Local reference to service scope.
				 */
				const self = this;

        /**
         *  Sets up buttons step functions.
         */
        self.stepFunctions(tour, steps);

        /**
         *  Adds all steps to the tour.
         */
        self.addSteps(tour, steps);

        /**
         *  Sets up steps' templates.
         */
        self.setupTemplates(tour, template);
    };
}]);
