define([
  // Application.
  "app",

  // Initialize application
  "initialize",

  // Modules
  "modules/blouch",
  "modules/posts",
  "modules/github",
  "modules/user"
],

function(app, Initialize, Blouch, Posts, Github, User) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "posts/:postID": "post",
      "tags/:tag": "tag",
      "new_post": "newPost"
    },

    initialize: function() {
      this.user = new User.Model();
      this.navBar = new Blouch.Views.NavBar({model:this.user});
      this.features = new Blouch.Features();
      this.githubUser = new Github.User({ name: app.settings.github });
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
        }
      });

      $("#app-container").html(this.homepage.$el);
      //$("#disqus-base").html(this.disqusBase.render().view.$el);
      this.homepage.render();
      var u = this.user;
      /*
      this.user.fetch().done(function(resp) {
        console.log("FETCHED USER: ", resp, u);
      });
      */
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
    },

    newPost: function() {
      var post = new Posts.Model();
      console.log("NEW POST");

      var newPostView = this.homepage.setView("#blouch-content", new Posts.Views.New({
        model: post
      }));

      newPostView.render();
    }
  });

  return Router;

});
