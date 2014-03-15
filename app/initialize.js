define([
  // Application.
  "app",

  // Libraries
  "lodash",
  "bootstrap"
],

function(app, _, Bootstrap) {
  var settings = _.reduce(_.map($("meta[name^='blouch:']"), function(ele) {
    console.log([$(ele).attr('name'), $(ele).attr('content')]);
    return [$(ele).attr('name'), JSON.parse($(ele).attr('content'))];
  }), function(acc, tuple) {
    console.log("TUPLE IS: ", tuple);
    var key = tuple[0].replace(/^blouch:/, '');
    acc[key] = tuple[1];
    return acc;
  }, {});
  console.log("SETTINGS", settings);

  // Provide a global location to place configuration settings and module
  // creation.
  _.extend(app, {
    // The root path to run the application through.
    root: "/",
    //host: "http://localhost:8000",
    //couchhost: "http://localhost:5984/blouch",
    host: window.location.origin,
    couchhost: window.location.origin + "/api",
    settings: settings,
    navigate: function(path) {
      Backbone.history.navigate(path, true);
    }
  });

  // Thanks to http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
  jQuery.fn.serializeObject = function() {
    var arrayData, objectData;
    arrayData = this.serializeArray();
    objectData = {};

    $.each(arrayData, function() {
      var value;

      if (this.value !== undefined) {
        value = this.value;
      } else {
        value = '';
      }

      if (objectData[this.name] !== undefined) {
        if (!objectData[this.name].push) {
          objectData[this.name] = [objectData[this.name]];
        }

        objectData[this.name].push(value);
      } else {
        objectData[this.name] = value;
      }
    });

    return objectData;
  };


});
