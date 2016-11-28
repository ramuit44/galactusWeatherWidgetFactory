'use strict';

var weatherWidgetModule = angular.module('weatherWidgetModule', []);

weatherWidgetModule.service('weatherService', function($http, $filter, $window, $q, $timeout) {
    var service = {
      curWeather: {},
     
      
      
      getWeather: function(units, displayWind, locationObj) {

        var defer = $q.defer();

        var defaultCordinates = {
          latitude:33,
          longitude:151
        };

        locationObj = locationObj || {coords:defaultCordinates};
        
        var location = ''+locationObj.coords.latitude.toFixed(0)+locationObj.coords.longitude.toFixed(0);

        
        $http.get('http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat='+locationObj.coords.latitude+'&lon='+locationObj.coords.longitude+'&units='+units+'&cnt=5').then(function(response) {
            defer.resolve(response.data);
        }, function(response) {
            defer.reject(response);
        });

        return defer.promise;
      },


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


      getCurrentPosition: function() {
        var deferred = $q.defer();

        if (!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
        } else {

            var options = {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0       
            };

            /*var options = {
                          maximumAge:Infinity, timeout:0
            }*/

            $window.navigator.geolocation.getCurrentPosition(
                function (position) {
                    deferred.resolve(position);
                },
                function (err) {
                    deferred.reject(err);
                },
                options);

            $timeout(function() {
                    deferred.reject('Geo Location timed out');

                }, 10000)
        }

        return deferred.promise;
      }


    };
    return service;
});

weatherWidgetModule.filter('temparature', function($filter) {
  return function(input, precision) {
    if (!precision) {
        precision = 1;
    }

    /*var unitDisplay;

    switch (units){
      case "imperial":
        unitDisplay = "F"
        break;
      case "metric":
        unitDisplay = "C"
        break;
      default:
        unitDisplay = "F"
        break;
    } */

    var numberFilter = $filter('number');
    //return numberFilter(input, precision) + '&deg;' + unitDisplay;
    return numberFilter(input, precision) + '&deg;' ;
  };
});


weatherWidgetModule.directive('currentWeather', function(weatherService,$compile){
  return {
    restrict:'E',
    scope: {
      units: '@?',
      title: '@',
      showwind: '@?'
    },
    templateUrl:'templates/basicWeatherDisplay.tpl.html',
    link: function(scope, iElem, iAttr){
      scope.units = scope.units;  
      scope.showwind = scope.showwind || true;
      scope.title =    scope.title || "Sample Date Widget" ;
      scope.weather = {};
      
      var weatherPromise = weatherService.getCurrentPosition().then(weatherService.getWeather.bind(null,scope.units,scope.showwind));
      weatherPromise.then(function(result){
        scope.weather = weatherService.populateModalObjectFromResponse(result,scope.title);
       
      });
 
    }
  };
});




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

