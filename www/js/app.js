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
		AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );
		AdMob.createBanner( {adId: admobid.banner,position: AdMob.AD_POSITION.BOTTOM_CENTER,autoShow: true,adSize:AdMob.AD_SIZE.FULL_BANNER} );
		document.addEventListener('onAdLoaded', function(data){});
        document.addEventListener('onAdPresent', function(data){});
        document.addEventListener('onAdLeaveApp', function(data){});
        document.addEventListener('onAdDismiss', function(data){});
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
	$scope.gameStatus = 0;
	$scope.generations = [[1,151,0],[152,251,50],[252,386,120],[387,493,250],[494,649,400]];
	$scope.scores = [];
	$scope.currentGens = [0];
	$scope.globalIds = [];
	$scope.block = false;
	$scope.currentRound = 0;
	$scope.interval = 0;
	$scope.maxTime = 90;


	for (var i = 0; i < $scope.generations.length; i++) {
		tempHigh = getSafeCookie('highscores'+i);
		// console.log(tempHigh)
		if(tempHigh && parseInt(tempHigh) >= 0 ){
			$scope.scores.push(parseInt(tempHigh));
		}else{
			console.log('override')
			setSafeCookie('highscores'+i,0);
		}
	}

	console.log($scope.scores);

	$scope.resetStatus = function() {
		$scope.lastPokemonId = 0;
		$scope.currentRound = 0;
		$scope.time = $scope.maxTime;
		$scope.block = false;
		$scope.points = 0;
		$scope.ableMore = true;
	}
	$scope.resetStatus();

	$scope.restart = function() {
		$scope.updateIDs();
		$scope.resetStatus();
		// $scope.randomQuestion();
		$scope.initQuiz();
		$scope.gameStatus = 1;
	}

	$scope.backToInit = function() {
		$scope.pageTitle = 'Who is this Pokemón';
		$scope.inGame = false;
		$scope.gameStatus = 0;
		$scope.resetStatus();
	}
	$scope.randomQuestion = function() {
		$scope.block = false;
		$scope.darked = true;
		$scope.waiting = true;
		$scope.currentQuestion.options = [];

		var currentPokemon = $scope.globalIds[$scope.currentRound];
		$scope.currentQuestion.correctPokemon = $scope.pokemons[currentPokemon];
		$scope.lastPokemonId = currentPokemon;
		$scope.currentQuestion.options = [];

		while($scope.currentQuestion.options.length < 3){
			var tempRandom = Math.floor($scope.globalIds.length * Math.random()) + $scope.generations[$scope.currentGens[0]][0] - 1;
			var tempName = $scope.pokemons[tempRandom].name;
			if(tempName !== $scope.currentQuestion.correctPokemon.name){
				var pass = true;
				for (var i = 0; i < $scope.currentQuestion.options.length; i++) {
					if($scope.currentQuestion.options[i] === tempName){
						pass = false;
						break;
					}
				}
				if(pass){
					$scope.currentQuestion.options.push($scope.pokemons[tempRandom].name);
				}
			}
		}
		$scope.currentQuestion.options.push($scope.currentQuestion.correctPokemon.name)
		$scope.currentQuestion.options = shuffle($scope.currentQuestion.options);
	}
	$scope.checkGen = function(targetId, add) {
		// var has = false;
		// for (var i = 0; i < $scope.currentGens.length; i++) {
		// 	if($scope.currentGens[i] === targetId){
		// 		has = true;
		// 		if(!add){
		// 			$scope.currentGens.splice(i,1);
		// 		}else{
		// 			return;
		// 		}
		// 	}
		// }
		// if(!has){
		// 	$scope.currentGens.push(targetId);
		// }

		$scope.currentGens = [targetId];

		console.log($scope.currentGens);
		$scope.updateIDs();
		$scope.initQuiz();
	}
	$scope.updateIDs = function() {
		var tempMin = 0;
		var tempMax = 0;
		$scope.globalIds = [];
		for (var i = 0; i < $scope.currentGens.length; i++) {
			tempMin = $scope.generations[$scope.currentGens[i]][0];
			tempMax = $scope.generations[$scope.currentGens[i]][1];
			for (var j = tempMin; j <= tempMax; j++) {
				$scope.globalIds.push(j);
			}
		}
		$scope.globalIds = shuffle($scope.globalIds);
	}
	$scope.initQuiz = function() {
		console.log('init')
		$scope.pageTitle = '';
		$scope.inGame = true;
		$scope.gameStatus = 1;
		$scope.randomQuestion();
		$scope.currentRound = 0;
		clearInterval($scope.interval);
		$scope.interval = setInterval(function(){
			$scope.$apply(function(){
				$scope.time --;
				if($scope.time <= 0){
					clearInterval($scope.interval);
					$scope.endGame();
				}
			})
		},1000);
	}

	$scope.more30 = function() {
		$scope.ableMore = false;
		$scope.time += 30;
		if(window.cordova && AdMob){
			AdMob.showInterstitial();
		}
	}
	$scope.endGame = function() {
		// console.log($scope.currentGens[0], $scope.points)
		$scope.pageTitle = 'Congratulations!';
		if($scope.scores[$scope.currentGens[0]] < $scope.points){
			$scope.scores[$scope.currentGens[0]] = $scope.points;
			console.log('new high');
		}
		$scope.saveScore();
		$scope.gameStatus = 2;
		// $scope.backToInit();
	}
	$scope.clickQuestion = function(target) {
		if($scope.block){
			return
		}
		$scope.block = true;
		if($scope.currentQuestion.correctPokemon.name === target){
			$scope.isCorrect = true;
			$scope.resultAnsware = 'CORRECT';
			$scope.points += 5;
		}else{
			$scope.isCorrect = false;
			$scope.resultAnsware = 'WRONG';
			$scope.points -= 5;
			if($scope.points < 0){
				$scope.points = 0;
			}
		}
		$scope.darked = false;
		$scope.waiting = false;
		setTimeout(function(){
			$scope.$apply(function(){
				$scope.currentRound ++;
				$scope.randomQuestion();
        	})
		}, 1000);
	}

	$scope.saveScore = function(){
		for (var i = 0; i < $scope.scores.length; i++) {
			setSafeCookie('highscores'+i,$scope.scores[i]);
		}
	}

	JsonReaderService('pokemons')
		.success(function (data) {
			$scope.pokemons = data.pokemons;
			$scope.pokemons.sort(function(a, b){return a.id-b.id});
			$scope.updateIDs();
			// $scope.initQuiz();
		});
}]);

app.factory('JsonReaderService', ['$http', function ($http) {
	return function (filename) {
		return $http.get('./json/'+filename+'.json');
	};
}]);


function setSafeCookie(key, value) {
	window.localStorage.setItem(key, value);
}

function getSafeCookie(key, callback) {
	var value = window.localStorage.getItem(key);
	return value;
}

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
