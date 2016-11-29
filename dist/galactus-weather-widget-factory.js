
  /**
  * galactusWeatherApp Module
  *
  * galactusWeatherApp container of weather widget editor controllers. ngSanitize module provides functionality to sanitize HTML.  weatherWidgetModule provides functionality of weather widget.
  */
 var galactusWeatherApp = angular.module('galactusWeatherApp', ["weatherWidgetModule", "ngSanitize"]);

 /**
  * weatherWidgetEditorCtrl Controller
  *
  * Controller constructor with dependencies injected.
  */
 galactusWeatherApp.controller('weatherWidgetEditorCtrl', ['$scope', function($scope) {

 	$scope.submitted = false;

    //base model object to hold the widget editor form information
 		$scope.widgetForm = {
 		};

    //Array model to hold the list of created widgetform base models
 		$scope.widgetConfigs = [];

    //Function to validate the form and if valid save the widgetForm modal  object into the existing widgetConfigs array.
 		$scope.save = function(){
 			$scope.submitted = true;

 			if($scope.userForm.$invalid){return;}
 			if(isDuplicate($scope.widgetForm,$scope.widgetConfigs)) {$scope.duplicate=true; return;}

 			$scope.widgetConfigs.push(angular.copy($scope.widgetForm));
			$scope.reset();
  		};

     //Function to reset the form and some modal default values. 
 		$scope.reset = function(){
 			$scope.submitted = false;
 			$scope.duplicate = false;
 			$scope.widgetForm.title = '';
 		};

    //Method to check if already another widget with same title exists.  The function Need not be a scope level, but can be controller level . 

    // Mhhh... Ideally this should be a part of a static Utility service method and inject that Utility service to the controller and use it. For now having it in controller. :)
 		function isDuplicate(widgetForm,store){
 			for (var x in store) {
    				if (store[x].title == widgetForm.title) {
        			return true;
    				}
				}

				return false;
 		}

 		
 		

}]);;//IDEALLY this file should have been splitted into different directives.js files. filters.js file and service.js file.  Since content is minimal having it in single location.



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

        

        //Mhhhh . Second thoughts. rather than hard coding the link , the link should have been part of a Global variable  using either angular Constants or Value features.
        $http.get('http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat='+locationObj.coords.latitude+'&lon='+locationObj.coords.longitude+'&units='+units+'&cnt=5').then(function(response) {
            defer.resolve(response.data);
        }, function(response) {
            //Not much error handling happening here :) 
            console.error(response);
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
                    console.error(response);
                    deferred.reject(err);
                },
                options);

            //Timeout yourself
            $timeout(function() {
                    console.error('Geo Location timed out');
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





;/*! galactus-weather-widget-factory 29-11-2016 */
var weatherWidgetModule=angular.module("weatherWidgetModule",["ngSanitize"]);weatherWidgetModule.service("weatherService",["$http","$filter","$window","$q","$timeout",function(a,b,c,d,e){"use strict";var f={curWeather:{},getWeather:function(b,c,e){var f=d.defer(),g={latitude:33,longitude:151};e=e||{coords:g};""+e.coords.latitude.toFixed(0)+e.coords.longitude.toFixed(0);return a.get("http://api.openweathermap.org/data/2.5/weather?appid=227b37f61eeafe6959b97149fff86cc2&lat="+e.coords.latitude+"&lon="+e.coords.longitude+"&units="+b+"&cnt=5").then(function(a){f.resolve(a.data)},function(a){f.reject(a)}),f.promise},populateModalObjectFromResponse:function(a,c){var d=c;return f.curWeather[d]?f.curWeather[d]:(f.curWeather[d]={temp:{},clouds:null},a&&(a.main&&(f.curWeather[d].temp.current=a.main.temp,f.curWeather[d].temp.min=a.main.temp_min,f.curWeather[d].temp.max=a.main.temp_max,f.curWeather[d].humidity=a.main.humidity),a.sys&&(f.curWeather[d].countryCode=a.sys.country),a.wind&&(f.curWeather[d].windSpeed=a.wind.speed,f.curWeather[d].windDeg=a.wind.deg),f.curWeather[d].locationname=a.name,f.curWeather[d].clouds=a.clouds?a.clouds.all:void 0,f.curWeather[d].timestamp=b("date")(new Date,"dd,MMM yy hh:mm a")),f.curWeather[d])},getCurrentPosition:function(){var a=d.defer();if(c.navigator.geolocation){var b={enableHighAccuracy:!0,timeout:5e3,maximumAge:0};c.navigator.geolocation.getCurrentPosition(function(b){a.resolve(b)},function(b){a.reject(b)},b),e(function(){a.reject("Geo Location timed out")},1e4)}else a.reject("Geolocation not supported.");return a.promise}};return f}]),weatherWidgetModule.filter("temparature",["$filter",function(a){return function(b,c){c||(c=1);var d=a("number");return d(b,c)+"&deg;"}}]),weatherWidgetModule.directive("currentWeather",["weatherService","$compile",function(a,b){return{restrict:"E",scope:{units:"@?",title:"@",showwind:"@?"},templateUrl:"templates/weatherWidgetDisplay.html",link:function(b,c,d){b.units=b.units,b.showwind=b.showwind||!0,b.title=b.title||"Sample Date Widget",b.weather={};var e=a.getCurrentPosition().then(a.getWeather.bind(null,b.units,b.showwind));e.then(function(c){b.weather=a.populateModalObjectFromResponse(c,b.title)})}}}]),weatherWidgetModule.directive("weatherIcon",function(){return{restrict:"E",replace:!0,scope:{cloudiness:"@",customSize:"=",useGoogleImages:"="},link:function(a){a.getIconClass=function(){return a.cloudiness<20?"wi wi-day-sunny":a.cloudiness<90?"wi wi-day-cloudy":"wi wi-cloudy"}},template:"<i style='font-size:{{customSize}}px;' ng-class='getIconClass()'></i>"}}),weatherWidgetModule.directive("windIcon",function(){return{restrict:"E",replace:!0,scope:{angle:"@",customSize:"="},link:function(a){a.getWindIconClass=function(){if(a.angle)return"wi wi-wind towards-"+a.angle+"-deg"}},template:"<i style='font-size:{{customSize}}px;' ng-class='getWindIconClass()'></i>"}});;galactusWeatherApp.directive('weatherWidgetEditorOutput', function(){
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
;angular.module('templates-main', ['index.html', 'sample.html', 'templates/weatherWidgetDisplay.html', 'templates/weatherWidgetEditorOutput.html']);

angular.module("index.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("index.html",
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    "  <title>Galactus Weather Widget Editor</title>\n" +
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
    "<!-- Tell angular this is the root element of the app and load the module named \"galactusWeatherApp\"-->\n" +
    "<!-- invoke the controller weatherWidgetEditorCtrl - create ctr obect with a $scope object.-->\n" +
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
    "      <!--Invoke the wrapper directive weather-widget-editor-output -->\n" +
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

angular.module("sample.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sample.html",
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    "  <title>Reference Usage of Galactus Weather widget</title>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"bower_components/bootstrap/dist/css/bootstrap.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"bower_components/weather-icons/css/weather-icons.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"bower_components/weather-icons/css/weather-icons-wind.css\"/>\n" +
    "  <link rel=\"stylesheet\" type=\"text/css\" href=\"styles/galactus-weather-widget.min.css\"/>\n" +
    "  <script type=\"text/javascript\" src=\"bower_components/angular/angular.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"bower_components/angular-sanitize/angular-sanitize.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"bower_components/moment/moment.js\"></script>\n" +
    "  <script type=\"text/javascript\" src=\"galactus-weather-widget-directive.min.js\"></script>\n" +
    " </head>\n" +
    "\n" +
    " <!-- Tell angular this is the root element of the app and load the module named \"weatherWidgetModule\"-->\n" +
    "<body ng-app=\"weatherWidgetModule\">\n" +
    "	<div class=\"col-md-4 col-md-offset-4 container\">\n" +
    "\n" +
    "  <!-- call the widget Element directive -->\n" +
    "		<current-weather units=\"imperial\"\n" +
    "		          showwind=\"true\"\n" +
    "		          title=\"A sample Weather widget\">\n" +
    "		</current-weather>\n" +
    "	</div>\n" +
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
