
  /**
  * galactusWeatherApp Module
  *
  * Description
  */
 var galactusWeatherApp = angular.module('galactusWeatherApp', ["weatherWidgetModule", "ngSanitize"]);

 galactusWeatherApp.controller('weatherWidgetEditorCtrl', ['$scope', function($scope) {

 	$scope.submitted = false;

 		$scope.widgetForm = {
 		};

 		$scope.widgetConfigs = [];

 		$scope.save = function(){
 			$scope.submitted = true;

 			if($scope.userForm.$invalid){return;}
 			if(isDuplicate($scope.widgetForm,$scope.widgetConfigs)) {$scope.duplicate=true; return;}

 			$scope.widgetConfigs.push(angular.copy($scope.widgetForm));
			$scope.reset();
  		};

 		$scope.reset = function(){
 			$scope.submitted = false;
 			$scope.duplicate = false;
 			$scope.widgetForm.title = '';
 		};

 		function isDuplicate(widgetForm,store){
 			for (var x in store) {
    				if (store[x].title == widgetForm.title) {
        			return true;
    				}
				}

				return false;
 		}

 		
 		

}]);;

var weatherWidgetModule = angular.module('weatherWidgetModule', []);

weatherWidgetModule.service('weatherService', ["$http", "$filter", "$window", "$q", "$timeout", function($http, $filter, $window, $q, $timeout) {
  "use strict";
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

                }, 10000);
        }

        return deferred.promise;
      }


    };
    return service;
}]);

weatherWidgetModule.filter('temparature', ["$filter", function($filter) {
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
}]);


weatherWidgetModule.directive('currentWeather', ["weatherService", "$compile", function(weatherService,$compile){
  return {
    restrict:'E',
    scope: {
      units: '@?',
      title: '@',
      showwind: '@?'
    },
    templateUrl:'templates/weatherWidgetDisplay.html',
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
}]);




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

;galactusWeatherApp.directive('weatherWidgetEditorOutput', function(){
  return {
    restrict:'E',
    scope: {
      units: '@?',
      title: '@',
      showwind: '@?'
    },
    templateUrl:'templates/weatherWidgetEditorOutput.html',
    link: function(scope, iElem, iAttr){
      
    }
  };
});
;angular.module('templates-main', ['index.html', 'templates/weatherWidgetDisplay.html', 'templates/weatherWidgetEditorOutput.html']);

angular.module("index.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("index.html",
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    "  <title>Reference Usage of Galactus Weather widget</title>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"bower_components/bootstrap/dist/css/bootstrap.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"bower_components/weather-icons/css/weather-icons.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"bower_components/weather-icons/css/weather-icons-wind.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"styles/galactus-weather-widget.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"styles/galactus-weather-widget-editor.css\"/>\n" +
    "  <script type=\"text/javascript\" src=\"bower_components/angular/angular.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"bower_components/angular-sanitize/angular-sanitize.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"bower_components/moment/moment.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"galactus-weather-widget-directive.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"app.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"galactus-weather-widget-editor-output-directive.js\"></script>\n" +
    "\n" +
    " \n" +
    "</head>\n" +
    "<body ng-app=\"galactusWeatherApp\" ng-controller=\"weatherWidgetEditorCtrl\">\n" +
    "  <div class=\"jumbotron\">\n" +
    "    <h1>Galctus Weather Widget Factory</h1> \n" +
    "    <p>This is a widget factory to create robust performant weather widgets with Angular and Bootstrap.</p> \n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"inputContainer col-md-4 col-md-offset-4 container\">\n" +
    "  <h2>Create a Widget</h2>\n" +
    "    <form name=\"userForm\" novalidate>\n" +
    "      <div class=\"form-group\" show-errors>\n" +
    "        <label class=\"control-label\">Title</label>\n" +
    "        <input type=\"text\" class=\"form-control\" name=\"title\" ng-model=\"widgetForm.title\" required placeholder=\"Title\" required/>\n" +
    "        <div class=\"help-inline\" ng-show=\"submitted && userForm.title.$error.required\">Required</div>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\" show-errors>\n" +
    "        <label class=\"control-label\">Show Wind</label>\n" +
    "        <div class=\"control-label\" ng-init=\"widgetForm.showwind='true'\" >\n" +
    "          <label class=\"radio-inline\"><input type=\"radio\" ng-model=\"widgetForm.showwind\" name=\"showwind\" value=\"true\" required>True</label>\n" +
    "          <label class=\"radio-inline\"><input type=\"radio\" ng-model=\"widgetForm.showwind\" name=\"showwind\" value=\"false\" required>False</label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "          <label for=\"sel1\">Unit</label>\n" +
    "          <select class=\"form-control\" id=\"sel1\" ng-model=\"widgetForm.units\" ng-init=\"widgetForm.units = 'metric'\">\n" +
    "            <option value=\"metric\">Metric</option>\n" +
    "            <option value=\"imperial\">Imperial</option>\n" +
    "          </select>\n" +
    "      </div>\n" +
    "      \n" +
    "      <button class=\"btn btn-primary\" ng-click=\"save()\">Manufacture</button>\n" +
    "      <button class=\"btn btn-link\" ng-click=\"reset()\">Reset</button>\n" +
    "      <span class=\"help-inline\" ng-if=\"duplicate\">Duplicate Widget exists.</span>\n" +
    "\n" +
    "    </form>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"col-xs-12\">&nbsp;</div>\n" +
    "  <div class=\"col-xs-12\">&nbsp;</div>\n" +
    "  <hr class=\"col-xs-12\">\n" +
    "  <div class=\"col-xs-12\">&nbsp;</div>\n" +
    "\n" +
    "  <div class=\"container\">\n" +
    "    <!--<div ng-repeat=\"row in widgetConfigs track by row.title\">-->\n" +
    "    <div ng-repeat=\"row in widgetConfigs\">\n" +
    "      <weather-widget-editor-output units=\"{{row.units}}\"\n" +
    "          showwind=\"{{row.showwind}}\"\n" +
    "          title=\"{{row.title}}\">\n" +
    "      </weather-widget-editor-output>\n" +
    "\n" +
    "\n" +
    "      <hr class=\"col-xs-12\">\n" +
    "\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "\n" +
    "</body>\n" +
    "</html>");
}]);

angular.module("templates/weatherWidgetDisplay.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/weatherWidgetDisplay.html",
    "<div class=\"row weather-widget\">\n" +
    "\n" +
    " <div class=\"col-xs-12\"><h4><b>{{title}}</b></h4></div>\n" +
    "  <div class=\"container col-xs-12\">\n" +
    "            <div class=\"panel panel-default\">\n" +
    "              <div class=\"panel-heading\">\n" +
    "                <div class=\"panel-title header\">\n" +
    "                  <div class=\"row\">\n" +
    "                    <div class=\"col-xs-4\">{{weather.locationname}}, {{weather.countryCode}}</div>\n" +
    "                    <div class=\"col-xs-6\"><span>{{weather.timestamp}}</span></div>\n" +
    "                     <div class=\"col-xs-1 metric pull-right\">\n" +
    "                          <i ng-class=\"(units=='metric') ? 'wi wi-celsius' : 'wi wi-fahrenheit'\"></i>\n" +
    "                      </div>\n" +
    "                  </div>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "              <div class=\"panel-body pull-center body day\">\n" +
    "                <div class=\"row\">\n" +
    "                  <div class=\"col-xs-4\">\n" +
    "                    <weather-icon cloudiness=\"{{ weather.clouds }}\" custom-size=\"33\" >\n" +
    "                    </weather-icon>\n" +
    "                  </div>\n" +
    "                  <div class=\"col-xs-4\"><span class=\"align-left tempContent\"><span ng-bind-html=\"weather.temp.current | temparature:1\"></span></span></div>\n" +
    "                  <div class=\"col-xs-4\" ng-if=\"showwind\"><span class=\"align-left windContent\">{{weather.windSpeed}} \n" +
    "                  <span ng-if=\"(units=='metric')\">km/h</span><span ng-if=\"(units=='imperial')\">mph</span>\n" +
    "                  </span></div>\n" +
    "                </div>\n" +
    "                <div class=\"row\">\n" +
    "                  <div class=\"col-xs-4\"><span class=\"align-left subContent\"><span ng-bind-html=\"weather.temp.max | temparature:1\"></span>/<span ng-bind-html=\"weather.temp.min | temparature:1\"></span></span></div>\n" +
    "                  <div class=\"col-xs-4\"><span class=\"align-left subContent\">Humidity {{weather.humidity}}%</span></div>\n" +
    "                  <div class=\"col-xs-4\" ng-if=\"showwind\">\n" +
    "                      \n" +
    "                      <wind-icon angle=\"{{ weather.windDeg }}\" custom-size=\"20\" > </weather-icon>\n" +
    "                  </div>\n" +
    "                 </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "  </div>\n" +
    "  \n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/weatherWidgetEditorOutput.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/weatherWidgetEditorOutput.html",
    "<div class=\"container\">\n" +
    "    <div class=\"col-xs-6\"><current-weather\n" +
    "      units=\"{{units}}\"\n" +
    "      showwind=\"{{showwind}}\"\n" +
    "      title=\"{{title}}\">\n" +
    "    </current-weather></div>\n" +
    "    <div class=\"col-xs-6\">\n" +
    "           <div class=\"col-xs-12\"><h2></h2><h6><b>Code Snippet</b></h6></div>\n" +
    "           <div class=\"col-xs-12\"><pre>&lt;current-weather\n" +
    "        units=\"{{units}}\"\n" +
    "        showwind=\"{{showwind}}\"\n" +
    "        title=\"{{title}}\"&gt;\n" +
    "      &lt;/current-weather&gt;</pre></div>\n" +
    "    </div>\n" +
    "</div>");
}]);
