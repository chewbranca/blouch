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
      return this.converter.makeHtml(this.get('content'));
    },

    url: function() {
      if (!this.id) {
        return app.couchhost;
      } else if (this.get("slug")) {
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

    setAttributes: function() {
      this.set('slug', this.slug());
      this.set('created_at', (new Date()).getTime());
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
        post: this.model,
        blouch: app.settings
      };
    }
  });

  Posts.Views.New = Backbone.View.extend({
    template: "posts/new",
    imageRegex: /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/i,
    events: {
      "click button.preview-post": "previewPost",
      "click button.publish-post": "publishPost"
    },

    validate: function() {
      this.model.setAttributes();
      var imageUrl = this.model.get('imageUrl');
      var tags = this.model.get('tags');
      var bodyContent = this.model.get('content');

      $(".control-group").removeClass("error");

      if (imageUrl && !imageUrl.match(this.imageRegex)) {
        $(".control-group-imageUrl").addClass("error");
        $(".control-group-imageUrl span.help-block").html("Image URL should look like a remote image url");
        return "Image URL Error";
      }

      if (tags.length && ! _.all(tags, function(tag) { return tag.match(/^[a-zA-Z0-9_]+$/); })) {
        console.log("TAGS", tags.length, tags, _.all(tags, function(tag) { return tag.match(/^[a-zA-Z0-9_]$/); }));
        $(".control-group-tags").addClass("error");
        $(".control-group-tags span.help-block").html("Tags may be alphanumerics and underscores");
        return "Tags Error";
      }

      if (!bodyContent) {
        $(".control-group-body").addClass("error");
        $(".control-group-body span.help-block").html("Body must be present");
        return "Body Error";
      }
    },

    loadFromForm: function() {
      var data = this.$el.find("form.post-form").serializeObject();
      data.tags = _.compact(data.tags.trim().split(/,\s*/));
      this.model.set(data);
    },

    previewPost: function() {
      this.loadFromForm();
      if (this.validate()) return false;

      console.log("PREVIEWING POST", this);
      $("#preview-form-body h1.title").html(this.model.get('title'));
      $("#preview-form-body h3.type").html("Type: " + this.model.get('type'));
      $("#preview-form-body h3.tags").html("Tags: " + this.model.get('tags'));
      $("#preview-form-body img.imageUrl").attr("src", this.model.get('imageUrl'));
      $("#preview-form-body .body").html(this.model.content());
      $("#preview-form-body").removeClass('hide');
    },

    publishPost: function(event) {
      event.preventDefault();

      this.loadFromForm();
      if (this.validate()) return false;
      var post = this.model;

      this.model.save().done(function(resp) {
        console.log("POST PUBLISHED: ", resp);
        app.navigate(post.link());
      });

      console.log("PUBLISHING POST", this);
    },

    serialize: function() {
      return {
        post: this.model
      };
    }
  });

  return Posts;
});
