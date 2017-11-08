'use strict'

angular.module('Movies', ['ngRoute'])

	.config(function($routeProvider) {
	    $routeProvider
	        .when('/home', {
	            templateUrl: 'assets/views/home.html',
	            controller: 'homeCtrl'
	        });
	})
	
	.controller('homeCtrl', function($scope, actorSrv, moviesSrv, saveSrv) {
		
	    	$('#searchButton').on('click', function (e) {

	    		$scope.movies = '';

	    		var actorName = $('#actorNameText').val();
	    		
	    		actorSrv.getActor(actorName).then(function(data){
		    		var movies = saveSrv.getObject('filmography.actor');
		    		console.log(data);
		    		if(Object.keys(movies).length == 0){		    			
		    				console.log(data);
		    				movies = data;
		    				saveSrv.setObject('filmography.actor', data);
		    				$scope.movies = movies.data;
		    			
		    		}
		    		else {
		    			console.log(movies.data);
		    			JSON.stringify(movies);
		    			$scope.movies = movies;
		    			
		    		}
	    		});
	    	});
    })
   
    .service('actorSrv', function($http, $q) {
    		this.getActor = function(actorName) {
	    		var q = $q.defer();
	    		var url = 'http://theimdbapi.org/api/find/person?name=' + encodeURIComponent(actorName);

	    		console.log(url);
	    		$http.get(url)
	    			.then(function(data){
	    				q.resolve(data);	    				
	    			}, function error(err) {
	    				q.reject(err);
	    			});
	    			
	    			return q.promise;
	    		};
    })
    
    .service('moviesSrv', function($http, $q) {
    		this.getMovies = function(actorName) {
			var q = $q.defer();
			$http.get('http://theimdbapi.org/api/find/person?name=' + encodeURIComponent(actorName))
				.then(function(data, status, headers, config){
					q.resolve(data.data);
				}, function error(err) {
					q.reject(err);
				});
			
			return q.promise;
		};
    })
    
    .service('saveSrv', function($window, $http){
		  this.setObject = function(key, value){
			  $window.localStorage[key] = JSON.stringify(value);
			  //Save in CouchDB
			  //$http.put('../../' + key, value);
		  };
		  
		  this.getObject = function(key){
			  return JSON.parse($window.localStorage[key] || '{}');
		  };
	});