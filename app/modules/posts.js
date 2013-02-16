define([
  "app",

  // Libs
  "backbone",
  "showdown"

  // Modules
],

function(app, Backbone, Showdown) {
  var Posts = app.module();

  // Functions

  Posts.Model = Backbone.Model.extend({
    idAttribute: "_id",

    link: function() {
      return "/posts/" + this.slug();
    },

    content: function() {
      this.converter = this.converter || new Showdown.converter();
      return this.converter.makeHtml(this.get('markdownContent'));
    },

    url: function() {
      if (this.get("slug")) {
        return [
          app.couchhost,
          '/_design/blouch/_view/by_slug?key="',
          this.get('slug') + '"&include_docs=true&limit=1'
        ].join(''); 
      } else {
        return app.couchhost + "/" + this.id;
      }
    },

    parse: function(resp) {
      if (resp.rows && resp.rows.length === 1) {
        return resp.rows[0].doc;
      } else {
        return resp;
      }
    },

    slug: function() {
      var title = this.get("title");
      if (!title) return this.id;

      return title.toLowerCase().replace(/\s+/g, '-');
    },

    hasTags: function() {
      var tags = this.get('tags');
      return tags && tags.length;
    },

    tags: function() {
      return this.get('tags').sort();
    },

    hasImage: function() {
      var attachments = this.get('_attachments');
      return attachments && _.keys(attachments).length;
    },

    imageUrl: function() {
      if (!this.hasImage()) {
        return false;
      }

      var attachments = this.get('_attachments');
      var key = _.keys(attachments)[0];

      return app.couchhost + '/' + this.id + '/' + key;
    }
  });

  Posts.List = Backbone.Collection.extend({
    model: Posts.Model,
    limit: 10,

    url: function() {
      return app.couchhost + '/_design/blouch/_view/by_type?key="post"&include_docs=true&limit='+this.limit;
    },

    parse: function(resp) {
      return _.map(resp.rows, function(row) {
        return row.doc;
      });
    }
  });

  Posts.ByTag = Backbone.Collection.extend({
    model: Posts.Model,
    limit: 10,

    initialize: function(_models, options) {
      this.tag = options.tag;
    },

    url: function() {
      return app.couchhost + '/_design/blouch/_view/by_tag?reduce=false&key="'+this.tag+'"&include_docs=true&limit='+this.limit;
    },

    parse: function(resp) {
      return _.map(resp.rows, function(row) {
        return row.doc;
      });
    }
  });

  // Views

  Posts.Views.Item = Backbone.View.extend({
    template: "posts/item",
    tagName: "li",
    className: "media",

    serialize: function() {
      return { post: this.model };
    }
  });

  Posts.Views.List = Backbone.View.extend({
    template: "posts/list",

    serialize: function() {
      return {
        posts: this.collection
      };
    },

    beforeRender: function() {
      this.collection.each(function(post) {
        this.insertView("ul.media-list", new Posts.Views.Item({
          model: post
        }));
      }, this);
    }
  });

  Posts.Views.Full = Backbone.View.extend({
    template: "posts/full",

    serialize: function() {
      return {
        post: this.model
      };
    }
  });

  return Posts;
});
