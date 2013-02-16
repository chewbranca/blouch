var request = require('request');

module.exports = function(grunt) {
  var currentTask = grunt.task.current;

  var getSettings = function(data, callback) {
    request.get({
      url: data.url,
      json: true
    }, function(error, response, body) {
      var errorResp;

      if (error) {
        errorResp = {
          error: response.statusCode,
        };
      } else if (response.statusCode == 404) {
        errorResp = {
          error: "Settings not found at: " + data.url,
        }
      } else if (response.statusCode !== 200) {
        errorResp = {
          error: "UNKNOWN ERROR: " + response.statusCode
        }
      }

      if (errorResp) errorResp.code = response.statusCode;

      callback(errorResp, body);
    });
  };

  var saveSettings = function(url, settings, callback) {
    request({
      method: 'PUT',
      url: url,
      json: settings
    }, function(error, response, body) {
      if (response.statusCode == 201) {
        callback(body);
      } else {
        grunt.fatal("ERROR: " + response.statusCode);
      }
    });
  };

  grunt.registerMultiTask('loadSettings', 'Load settings from a json resource', function() {
    var done = this.async();
    console.log("Generating settings!");
    console.log(this);
    getSettings(this.data, function(error, settings) {
      if (error && error.code === 404) {
        grunt.fatal(error.error);
      } else if (error) {
        grunt.fatal(error.error);
      } else {
        console.log("GOT SETTINGS: ", settings);
        done(settings);
      }
    });
  });

  grunt.registerMultiTask('uploadSettings', 'Push settings to a json resource', function() {
    var done = this.async();
    var data = this.data;
    var settings = require("./settings.json");

    getSettings(this.data, function(error, resp) {
      if (error && error.code === 404) {
        saveSettings(data.url, settings, done);
      } else if (error) {
        grunt.fatal(error.error);
      } else {
        if (!resp._rev) {
          grunt.fatal("Found invalid settings: "+resp)
        } else {
          settings._rev = resp._rev;
          saveSettings(data.url, settings, done);
        }
      }
    });
  });

  return {
    getSettings: getSettings,
    saveSettings: saveSettings
  };
}
