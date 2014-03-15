define([
  "app"
],

function(app) {
  var User = app.module();

  User.Model = Backbone.Model.extend({
    url: app.host + "/session",

    parse: function(resp) {
      if (resp.ok === true) {
        var newResp = resp.userCtx;
        newResp.info = resp.info;
        return newResp;
      }
    },

    name: function() {
      if (this.isLoggedIn()) {
        return this.get('name');
      } else if (this.isAdminParty()) {
        return "Admin Party";
      } else {
        return "Guest";
      }
    },

    isLoggedIn: function() {
      return this.get('name') !== null;
    },

    isAdmin: function() {
      return this.hasRole('_admin');
    },

    canPost: function() {
      return this.isAdmin();
    },

    isAdminParty: function() {
      return ! this.isLoggedIn() && this.isAdmin();
    },

    hasRole: function(role) {
      return _.contains(this.roles(), role);
    },

    roles: function() {
      return this.get('roles');
    }
  });

  return User;
});
