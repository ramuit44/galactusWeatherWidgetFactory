# galactusWeatherWidgetFactory
Editor Factory to create configurable weather widgets. Each Weather widget is built using angular directives, feeded using OpenWeatherMap API and styled uising weather-icons.

# Libraries used
* Angular Js - MV* framework for this SPA for building the custom directives(components) "current-weather" and "weather-widget-editor-output".
* Bootstrap - For RWD/ grid layoutting and inbuilt base styling of widget editor app and widget directive.
* Weather-icons from http://erikflowers.github.io/weather-icons  - for stylign weather widget with weather icons
* Bower - package manager for the solution , resolving any required library dependencies.
* Grunt - Task runner tool for building the project and running app on static server and tests on Karma.

## Code organization
* This project's sources are located in the app directory.
  * The required libraries are located in the app/bower_components directory.
  * The widget component html templates are located in the app/templates directory .
  * The widget component styles are located in the app/styles directory.
* This project's test sources are in the test directory.
  * This project's tests code coverage is in coverage directory.
  * This project's tests result report (grunt-junit-report) is in ./test-results.xml.
* This project's jshint configuration is in ./.jshintrc and jshint report is in ./jshint-report .  

