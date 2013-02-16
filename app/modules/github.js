define([
  "backbone"
],

function(Backbone) {
  var Github = {
    Views: {},
    api: "https://api.github.com"
  };

  Github.User = Backbone.Model.extend({
    idAttribute: "login",

    initialize: function(options) {
      this.name = options.name;
      this.set('login', this.name);
    },

    user: function() {
      return this.get('login') || this.name || '';
    },

    url: function() {
      return Github.api + "/users/" + this.user();
    }
  });

  Github.Event = Backbone.Model.extend({
    blurb: function() {
      return [
        this.get('actor').login,
        "performed",
        this.get('type'),
        "to",
        this.get('repo').name
      ].join(" ");
    },

    url: function() {
      return app.root;
    }
  });

  Github.Events = Backbone.Collection.extend({
    model: Github.Event,

    initialize: function(_models, options) {
      this.user = options.user;
    },

    parse: function(resp) {
			return resp.data;
		},

    url: function() {
      return this.user.url() + "/events?callback=?";
    }
  });

  Github.Views.Item = Backbone.View.extend({
    template: "github_item",
    tagName: "li",
    className: "media",

    serialize: function() {
      return { event: this.model };
    }
  });

  Github.Views.List = Backbone.View.extend({
    template: "github_list",

    serialize: function() {
      return {
        events: this.collection
      };
    },

    beforeRender: function() {
      _.each(this.collection.first(5), function(event) {
        this.insertView("ul.media-list", new Github.Views.Item({
          model: event
        }));
      }, this);
    }
  });

  return Github;
});
