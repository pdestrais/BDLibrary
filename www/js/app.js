// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('BDLibApp', ['ionic', 'ionic-material', 'BDLibApp.controllers', 'BDLibApp.services', 'BDLibApp.directives', 'ngPouch', 'ngMessages'])

.run(function ($ionicPlatform,ngPouch,$log,$cacheFactory) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
	});

})

.config(function ($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	.state('app.home', {
		url : '/home',
		views : {
			appContent : {
				templateUrl : 'pages/home.html',
				controller : 'HomeCtrl'
			}
		}
	})

	.state('app.preferences', {
		url : '/preferences',
		views : {
			appContent : {
				templateUrl : 'pages/preferences.html',
				controller : 'PreferenceCtrl'
			}
		}
	})

	.state('app', {
		url : '/app',
		abstract : true,
		templateUrl : 'pages/menu.html',
		controller : 'AppCtrl'
	})

// 	.state('app.album', {
// 		url : '/album/:serieId/:albumId',
// //		url : '/album',
// 		views : {
// 			appContent : {
// 				templateUrl : 'pages/album.html',
// 				controller : 'AlbumCtrl'
// 			}
// 		}
// 	})

	.state('app.serie.album', {
		parent: 'app.serie',
		cache : false,
		url : '/album/:albumNr',
//		url : '^/serie/album/:serieId/:albumNr',
	//		url : '/album',
		views : {
			"appContent@app" : {
				templateUrl : 'pages/album.html',
				controller : 'AlbumCtrl'
			}
		}
		// ,
		// params: ['id']
	})

	.state('app.series', {
		url : '/series',
		views : {
			appContent : {
				templateUrl : 'pages/seriesList.html',
				controller : 'SeriesCtrl'
			}
		}
	})

	.state('app.serie', {
		url : '/serie/:serieId',
		cache : false,
		views : {
			appContent : {
				templateUrl : 'pages/serie.html',
				controller : 'SerieCtrl'
			}
		}
	})

	.state('app.editeurs', {
		url : '/editeurs',
		views : {
			appContent : {
				templateUrl : 'pages/editeurs.html',
				controller : 'EditeurCtrl'
			}
		}
	})

	.state('app.importAlbums', {
		url : '/importAlbums',
		views : {
			appContent : {
				templateUrl : 'pages/importAlbums.html',
				controller : 'ImportAlbumsCtrl'
			}
		}
	})

	.state('app.biblio', {
		url : '/biblio',
		views : {
			appContent : {
				templateUrl : 'pages/biblio.html',
				controller : 'BiblioCtrl'
			}
		}
	})

	.state('confirmModal', {
		url : '/confirmModal/:msg/:state/:id',
		templateUrl : 'pages/confirm.html',
		controller : 'ConfirmCtrl'
	})

	.state('errorModal', {
		url : '/errorModal/:msg',
		templateUrl : 'pages/erreur.html',
		controller : 'ConfirmCtrl'
	})

	;

	// if none of the above states are matched, use this as the fallback

	$urlRouterProvider.otherwise('/app/home');

	});

// test of nested views
	// .state("app.main", {
	// 		url:"/main",
	// 		views : {
	// 			appContent : {
	// 				templateUrl: "pages/main_init.html",
	// 				controller:'mainController'
	// 			}
	// 		}
	// })
	//
	// .state("app.main.1", {
	// 		parent: 'app.main',
	// 		url:"/1",
	// 		views : {
	// 			mainContent : {
	// 				templateUrl: "pages/form_1.html"
	// 			}
	// 		}
	// })
	//
	// .state("app.main.2", {
	// 		parent: 'app.main',
	// 		url:"/2",
	// 		views : {
	// 			mainContent : {
	// 				templateUrl: "pages/form_2.html",
	// 			}
	// 		}
	// })
