define([
  // Application.
  "app",

  // Initialize application
  "initialize",

  // Modules
  "modules/blouch",
  "modules/posts",
  "modules/github"
],

function(app, Initialize, Blouch, Posts, Github) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "posts/:postID": "post",
      "tags/:tag": "tag"
    },

    initialize: function() {
      this.navBar = new Blouch.Views.NavBar();
      this.features = new Blouch.Features();
      this.githubUser = new Github.User({ name: "chewbranca" });
      this.githubEvents = new Github.Events(null, { user: this.githubUser });
      //this.disqusBase = new Blouch.Disqus.Base();
      //this.googleAnalytics = new Blouch.GoogleAnalytics();
      var featuresView = this.featuresView = new Blouch.Views.Features({
        model: this.features
      });
      var githubEventsView = this.githubEventsView = new Github.Views.List({
        collection: this.githubEvents
      });

      this.homepage = new Backbone.Layout({
        template: "blouch_layout",

        views: {
          "#blouch-features": this.featuresView,
          "#github-feed": this.githubEventsView,
          "#primary-navbar": this.navBar
          //"#disqus-base": this.disqusBase,
          //"#google-analytics": this.googleAnalytics
        }
      });

      $("#app-container").html(this.homepage.$el);
      //$("#disqus-base").html(this.disqusBase.render().view.$el);
      this.homepage.render();
      this.features.fetch().done(function(resp) {
        featuresView.render();
      });
      this.githubEvents.fetch().done(function(resp) {
        githubEventsView.render();
      });
    },

    index: function() {
      var posts = new Posts.List();

      var postsView = this.homepage.setView("#blouch-content", new Posts.Views.List({
        collection: posts
      }));

      posts.fetch().done(function(resp) {
        postsView.render();
      });
    },

    tag: function(tag) {
      var posts = new Posts.ByTag(null, { tag: tag });

      var postsView = this.homepage.setView("#blouch-content", new Posts.Views.List({
        collection: posts
      }));

      posts.fetch().done(function(resp) {
        postsView.render();
      });
    },

    post: function(postSlug) {
      var post = new Posts.Model({ slug: postSlug });

      var postView = this.homepage.setView("#blouch-content", new Posts.Views.Full({
        model: post
      }));

      post.fetch().done(function(resp) {
        postView.render();
      });
    }
  });

  return Router;

});
