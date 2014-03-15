define([
  "app"
],

function(app) {
  var Blouch = app.module();
  Blouch.Disqus = {};

  Blouch.Views.NavBar = Backbone.View.extend({
    template: "nav_bar",

    initialize: function() {
      this.userNavBar = new Blouch.Views.UserNavBar({model:this.model});
    },

    serialize: function() {
      return { blouch: app.settings };
    },

    afterRender: function() {
      //$("#user-nav-bar").html(this.userNavBar.el);
      $("#primary-nav-list").append(this.userNavBar.el);
    }
  });

  Blouch.Views.UserNavBar = Backbone.View.extend({
    template: "user_nav_bar",
    tagName: "li",
    className: "dropdown",

    initialize: function() {
      this.model.on("reset", "render", this);
      var that = this;
      this.model.fetch().done(function(resp) {
        that.render();
      });
    },

    serialize: function() {
      return {
        blouch: app.settings,
        user: this.model
      };
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
