// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

//FIX resolution on iE
(function() {
	if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement("style");
	msViewportStyle.appendChild(
		document.createTextNode("@-ms-viewport{width:auto!important}")
	);
	document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
	}
})();


var app = angular.module('starter', ['ionic']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
  	if(!window.cordova){
  		return;
  	}
	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	// for form inputs)
	if(window.cordova && window.cordova.plugins.Keyboard) {
	  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	}
	if(window.StatusBar) {
	  StatusBar.styleDefault();
	}

	var admobid = {};
		if( /(android)/i.test(navigator.userAgent) ) {
			admobid = {
				banner: 'ca-app-pub-9306461054994106/8419773176',
				interstitial: 'ca-app-pub-9306461054994106/9896506375',
			};
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
			admobid = {
				banner: 'ca-app-pub-9306461054994106/3989573573',
				interstitial: 'ca-app-pub-9306461054994106/5466306778',
			};
		} else {
			admobid = {
				banner: 'ca-app-pub-9306461054994106/2770192371',
				interstitial: 'ca-app-pub-9306461054994106/4246925578',
			};
		}
		if(AdMob){
			if(window.localStorage.getItem('first')){
				AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:true} );
				// AdMob.showInterstitial();
			}else{
				window.localStorage.setItem('first', 1);
			}
			// AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );
			// AdMob.showInterstitial();
			AdMob.createBanner( {adId: admobid.banner,position: AdMob.AD_POSITION.BOTTOM_CENTER,autoShow: true,adSize:AdMob.AD_SIZE.FULL_BANNER} );
		}


  });
});

app.controller('DataController', ['$scope', 'JsonReaderService', function ($scope, JsonReaderService) {
	$scope.pokemons = [];
	$scope.currentQuestion = {};
	$scope.darked = true;
	$scope.waiting = true;
	$scope.resultAnsware = 'CORRECT';
	$scope.pageTitle = 'Who is this Pokemón';
	$scope.isCorrect = false;
	$scope.inGame = false;
	$scope.generations = [[1,151],[152,251],[252,386],[387,493],[494,649]];
	$scope.currentGens = [0];
	$scope.block = false;
	$scope.rounds = [0,0,0,0,0,0,0,0,0,0,0];
	$scope.resetStatus = function() {
		$scope.lastPokemonId = 0;
		$scope.correctsCounter = 0;
		$scope.wrongCounter = 0;
		$scope.block = false;
	}
	$scope.resetStatus();

	$scope.backToInit = function() {
		$scope.pageTitle = 'Who is this Pokemón';
		$scope.inGame = false
	}
	$scope.randomQuestion = function() {
		$scope.block = false;
		$scope.darked = true;
		$scope.waiting = true;
		$scope.currentQuestion.options = [];
		var tempGen = $scope.currentGens[Math.floor($scope.currentGens.length * Math.random())];
		var min = $scope.generations[tempGen][0];
		var max = $scope.generations[tempGen][1];
		var currentPokemon = Math.floor((max - min) * Math.random()) + min - 1;
		if(currentPokemon === $scope.lastPokemonId){
			currentPokemon = Math.floor((max - min) * Math.random()) + min - 1;
		}
		$scope.currentQuestion.correctPokemon = $scope.pokemons[currentPokemon];
		$scope.lastPokemonId = currentPokemon;
		for (var i = 0; i < 3; i++) {
			var tempRandom = Math.floor((max - min) * Math.random()) + min - 1;
			if(tempRandom === currentPokemon){
				i --;
			}else{
				$scope.currentQuestion.options.push($scope.pokemons[tempRandom].name);
			}
		}
		$scope.currentQuestion.options.push($scope.currentQuestion.correctPokemon.name)
		$scope.currentQuestion.options = shuffle($scope.currentQuestion.options);
		console.log($scope.currentQuestion)
	}
	$scope.checkGen = function(targetId, add) {
		var has = false;
		for (var i = 0; i < $scope.currentGens.length; i++) {
			if($scope.currentGens[i] === targetId){
				has = true;
				if(!add){
					$scope.currentGens.splice(i,1);
				}else{
					return;
				}
			}
		};
		if(!has){
			$scope.currentGens.push(targetId);
		}
		console.log($scope.currentGens);
		// id = true;
	}
	$scope.initQuiz = function() {
		$scope.inGame = true;
		$scope.randomQuestion();
		$scope.pageTitle = '';
	}

	$scope.clickQuestion = function(target) {
		$scope.block = true;
		if($scope.currentQuestion.correctPokemon.name === target){
			$scope.isCorrect = true;
			$scope.resultAnsware = 'CORRECT';
			$scope.correctsCounter ++;
		}else{
			$scope.isCorrect = false;
			$scope.resultAnsware = 'WRONG';
			$scope.wrongCounter ++;
		}
		$scope.pageTitle = 'Corrects: '+$scope.correctsCounter + ' - Wrongs: '+$scope.wrongCounter;
		$scope.darked = false;
		$scope.waiting = false;
		setTimeout(function(){
			$scope.$apply(function(){
				$scope.randomQuestion();
        	})
		}, 1000);
	}

	JsonReaderService('pokemons')
		.success(function (data) {
			$scope.pokemons = data.pokemons;
			$scope.pokemons.sort(function(a, b){return a.id-b.id});
			$scope.initQuiz();
		});
}]);

app.factory('JsonReaderService', ['$http', function ($http) {
	return function (filename) {
		return $http.get('./json/'+filename+'.json');
	};
}]);


function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
	}
	return array;
}
