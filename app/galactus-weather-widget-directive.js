//IDEALLY this file should have been splitted into different directives.js files. filters.js file and service.js file.  Since content is minimal having it in single location.



 /**
  * weatherWidgetModule Module
  *
  * weatherWidgetModule container of weather widget services, filters, directives . ngSanitize module provides functionality to sanitize HTML.
  */
var weatherWidgetModule = angular.module('weatherWidgetModule', ["ngSanitize"]);


/**
*windIcon Directive
*
*Directive to display a wind direction icon basing on the wind angle input parameter
*/
weatherWidgetModule.directive('windIcon', function() {
    return {
        restrict: 'E', replace: true,
        scope: {
            angle: '@',
            customSize:'=',
            
        },
        link: function(scope){
            scope.getWindIconClass = function() {
                if (scope.angle) {
                   return "wi wi-wind towards-"+scope.angle+"-deg";
                }
            };
        },
        template: '<i style=\'font-size:{{customSize}}px;\' ng-class=\'getWindIconClass()\'></i>'
    };
});


/**
*weatherIcon Directive
*
*Directive to display a weather icon basing on the cloudiness input parameter
*/
weatherWidgetModule.directive('weatherIcon', function() {
    return {
        restrict: 'E', replace: true,
        scope: {
            cloudiness: '@',
            customSize:'=',
            useGoogleImages:'='
        },
        link: function(scope){
            scope.getIconClass = function() {
                if (scope.cloudiness < 20) {
                    return 'wi wi-day-sunny';
                } else if (scope.cloudiness < 90) {
                   return 'wi wi-day-cloudy';
                } else {
                    return 'wi wi-cloudy';
                }
            };
        },
        template: '<i style=\'font-size:{{customSize}}px;\' ng-class=\'getIconClass()\'></i>'
    };
});



/**
  * weatherService Service
  *
  * weatherService has wrapper methods to get the current location and get current weather and populate the result display object  from response.
  */
weatherWidgetModule.service('weatherService', ["$http", "$filter", "$window", "$q", "$timeout", function($http, $filter, $window, $q, $timeout) {
  "use strict";
    var service = {
      curWeather: {},
     
      
      // Asynch wrapper method getWeather which makes a asynch http call to OpenWeatherMapAPI takign input the units(imperial or metric), displayWind(true or false), locationObj(navigator.geolocation result object).
      // Returns a promise.
      getWeather: function(units, displayWind, locationObj) {

        var defer = $q.defer();

        var defaultCordinates = {
          latitude:33,
          longitude:151
        };

        locationObj = locationObj || {coords:defaultCordinates};
        
        var location = ''+locationObj.coords.latitude.toFixed(0)+locationObj.coords.longitude.toFixed(0);

        
        //AYSNCH HTTP GET call for getting the weather response. 
        //We have cached this http get call  using param {cache:true}, so that for a given session and for a given same set of input parameter values , the response is fetched from cache rather than making actual HTTP call.
        //Mhhhh . Second thoughts. rather than hard coding the link , the link should have been part of a Global variable  using either angular Constants or Value features.
        $http.get('http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat='+locationObj.coords.latitude+'&lon='+locationObj.coords.longitude+'&units='+units+'&cnt=5', { cache: true}).then(function(response) {
            defer.resolve(response.data);
        }, function(response) {
            //Not much error handling happening here :) 
            //console.error(response);
            defer.reject(response);
        });

        return defer.promise;
      },


      //Normal method to populate the display view model with the reponse from weatherService.getWeather. Title value is the key property used for the view model object.
      populateModalObjectFromResponse : function(data,title){

        var location = title;

        if(service.curWeather[location])
          return service.curWeather[location];
        
        service.curWeather[location] = { temp: {}, clouds: null };
        if (data) {
                if (data.main) {
                    service.curWeather[location].temp.current = data.main.temp;
                    service.curWeather[location].temp.min = data.main.temp_min;
                    service.curWeather[location].temp.max = data.main.temp_max;
                    service.curWeather[location].humidity = data.main.humidity;
                }
                if(data.sys){
                    service.curWeather[location].countryCode = data.sys.country;
                }

                if(data.wind){
                   service.curWeather[location].windSpeed = data.wind.speed;
                   service.curWeather[location].windDeg = data.wind.deg;
                }

                service.curWeather[location].locationname = data.name;
                service.curWeather[location].clouds = data.clouds ? data.clouds.all : undefined;
                service.curWeather[location].timestamp = $filter('date')(new Date(), 'dd,MMM yy hh:mm a');
            }

              return service.curWeather[location];

      },

      // Asynch wrapper method getCurrentPosition which makes a asynch call $window.navigator.geolocation.getCurrentPosition
      // Returns a promise.
      getCurrentPosition: function() {
        var deferred = $q.defer();

        if (!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
        } else {

            //Hell with this navigator.geolocation.getCurrentPosition . Looks like there is no timeout speecified for the function to return, its taking agaes with infinity timeout.
            // Had to put these options for the getCurrentPosition to work. Thanks to stackoverflow.
            var options = {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0       
            };

            $window.navigator.geolocation.getCurrentPosition(
                function (position) {
                    deferred.resolve(position);
                },
                function (err) {
                    //Not much error handling happening here :) 
                   // console.error(response);
                    deferred.reject(err);
                },
                options);

            //Timeout yourself
            $timeout(function() {
                   // console.error('Geo Location timed out');
                    deferred.reject('Geo Location timed out');

                }, 20000);
        }

        return deferred.promise;
      }


    };
    return service;
}]);

/**
  * temparature Filter
  *
  * Input precision to desired digits and add degrees symbol to the end of the input string.
  */
weatherWidgetModule.filter('temparature', ["$filter", function($filter) {
  return function(input, precision) {
    if (!precision) {
        precision = 1;
    }

    var numberFilter = $filter('number');
    return numberFilter(input, precision) + '&deg;' ;
  };
}]);


/**
*currentWeather Directive
*
*Directive to display a weather widget basing on input attributes units, title showing
*/
weatherWidgetModule.directive('currentWeather', ["weatherService", "$compile", function(weatherService,$compile){
  return {
    restrict:'E',
    // allow passthrough of the models -  units, title, showing from the parent scope to the currentWeather isolated scope
    scope: {
      units: '@?',
      title: '@',
      showwind: '@?'
    },
    // component template, later converted to js using html2js
    templateUrl:'templates/weatherWidgetDisplay.html',
    //link function where all the action takes place.
    link: function(scope, iElem, iAttr){
      scope.units = scope.units;  
      scope.showwind = scope.showwind || true;
      scope.title =    scope.title || "Sample Date Widget" ;
      scope.weather = {};
      
      //Promise Chaining at work. 
      //Promise chaining getCurrentPoition and getWeather both returning promises. When handling input arguments for subsequent calls within promise chanining we need to do function bind for the args.
      var weatherPromise = weatherService.getCurrentPosition().then(weatherService.getWeather.bind(null,scope.units,scope.showwind));
      weatherPromise.then(function(result){
        scope.weather = weatherService.populateModalObjectFromResponse(result,scope.title);
       
      });
 
    }
  };
}]);





