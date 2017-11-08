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
	    			console.log(data);
		    		var movies = saveSrv.getObject('actor');
		    		console.log(movies);
		    		if(Object.keys(movies).length == 0){		    			
		    				console.log(data);
		    				movies = data;
		    				saveSrv.setObject('actor', data);
		    				$scope.movies = movies.data;		    			
		    		}
		    		else {
		    			console.log(movies);
		    			$scope.movies = movies;
		    			
		    		}
		    		createDoc(actorName, movies);
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

var ALL_DOCS = '../../_all_docs?include_docs=true';
function createDoc(actorName, movies){				
		var actorName = actorName;
		var movies = movies;
		var doc = {};

		doc.actorName = actorName;
		doc.movies = movies;
		var json = JSON.stringify(doc);
		console.log(json);
		
		$.ajax({
		type:              'PUT',
		url:              '../../' + actorName,
		data:              json,
		contentType:       'application/json',
		async:             true,
		success:       function(data){
		       console.log(data);
		       buildOutput(ALL_DOCS, '');
		},
		error:         function(XMLHttpRequest, textStatus, errorThrown){
			console.log(errorThrown);
			}
		});
	}

function buildOutput(view, param){
	$('#output').html('The movies the actor has been in are : ');
	$.ajax({
		type:	'GET',
		url:	'../../_all_docs?include_docs=true',
		contentType: 'application/json',
		async:	true,		
		succes:	function(data){
			console.log('It works');
			var arr = JSON.parse(data).rows;
			var htmlString = '<table>';
			for(var i=0; i<arr.length; i++){
					var doc = arr[i].doc;
					htmlString += '<tr><td>' + doc.actorName + '</td><td>' + doc.movies + '</td></tr>';
			}
			htmlString += '</table>';
			console.log(htmlString);
			$('#output').html(htmlString);
			
		},
		
		error:	function(XMLHttpRequest, textStatus, errorThrown){
			console.log('Something went wrong');
			console.log(errorThrown)
		}
	});
}