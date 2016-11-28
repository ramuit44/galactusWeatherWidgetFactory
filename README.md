# galactusWeatherWidgetFactory
Editor Factory to create configurable weather widgets. Each Weather widget is built using angular directives, feeded using OpenWeatherMap API and styled uising weather-icons.

## Libraries used
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
* This project deleiverables are in dist directory.

## Installation instructions / Building & running

### Pre requisites:
 * Install npm by installing NodeJs.
 * Install bower using  `npm install -g bower`.
 * Install grunt-cli globally using `npm install -g grunt-cli`.

### Preparing
 * Run `bower install` to download your web app dependencies described in bower.json to `app/bower_components`.
 * Run `npm install` once to install the components described in `package.json`, required to run `grunt`.
 
### Building

Run `grunt` to prepare your web assets in the `dist` directory.  The default taks does the following.
 * Clean the existing assets in the dist folder.
 * Run jshint validation  and create the report/
 * Covert the html templates to js using html2js,
 * ngAnnotate to inject dependencies - used for minified files.
 * concat the required js files. 
 * minify the js files using uglify.
 * minify the css files using cssmin.
 

### Running

Note: You need to have your backend server running.

To run the app:

`grunt serve`

It will:

 - build your sass assets,
 - run a server to serve your web app static assets on port 9000, with a reverse proxy to your backend server on port
  8000, a file watching mechanism to rebuild your sass assets, and live reload support so that your browser is
  refreshed whenever you make changes to your sources

### Testing

Run `grunt test` to run karma tests.


 
