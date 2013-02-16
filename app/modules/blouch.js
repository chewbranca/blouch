define([
  "app"
],

function(app) {
  var Blouch = app.module();
  Blouch.Disqus = {};

  Blouch.Views.NavBar = Backbone.View.extend({
    template: "nav_bar",

    serialize: function() {
      return { blouch: app.settings };
    }
  });

  Blouch.Views.Features = Backbone.View.extend({
    template: "features",

    serialize: function() {
      return {
        features: this.model
      };
    }
  });

  Blouch.Features = Backbone.Model.extend({
    idAttribute: "_id",

    url: function() {
      return app.couchhost + "/features";
    },

    hasFeatures: function() {
      return !! this.get("features");
    },

    features: function() {
      return this.get("features");
    },

    convert: function(text) {
      this.converter = this.converter || new Showdown.converter();
      return this.converter.makeHtml(text);
    }
  });

  return Blouch;
});
