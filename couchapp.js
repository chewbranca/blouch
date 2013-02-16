var couchapp = require('couchapp'),
    path = require('path'),
    ddoc;

ddoc = {
  _id: '_design/blouch',
  rewrites: [
    {from:"/", to:'index.html'},
    {from:"/assets/*", to:'/assets/*'},
    {from:"/api/*", to:'../../*'},
    {from:"/*", to:'../../*'}
  ],
  views: {
    by_type: {
      map: function(doc) {
        if (doc.type) {
          emit(doc.type, null);
        }
      }
    },
    by_slug: {
      map: function(doc) {
        if (doc.title) {
          var slug = doc.title.toLowerCase().replace(/\s+/g, '-');
          emit(slug, null);
        }
      }
    },
    by_tag: {
      map: function(doc) {
        if (doc.tags && doc.tags.length) {
          doc.tags.forEach(function(tag) {
            emit(tag, null);
          });
        }
      },
      reduce: "_count"
    },
    by_date: {
      map: function(doc) {
        if (doc.type == "post") {
          emit(doc.created_at, {
            title: doc.title,
            description: doc.blurb
          });
        }
      }
    }
  },
  shows: {},
  lists: {
    rss: function(head, req) {
      log("HEAD IS: "+head.toString());
      start({"headers":{"Content-Type":"application/rss+xml"}});
      var output = '<?xml version="1.0"?>\n\
        <rss version="2.0">\n\
        <channel>\n\
          <title>Chewbranca.com | Powered by Blouch</title>\n\
          <link>http://chewbranca.com</link>\n\
          <description>Random musings from my trenches</description>\n\
          <language>en-us</language>\n\
          <pubDate>Sun, 13 Jan 2013 04:00:00 GMT</pubDate>\n\
          <lastBuildDate>Sun, 13 Jan 2013 09:41:01 GMT</lastBuildDate>\n';

      var row, count = 0;
      while((row = getRow()) && count < 20) {
        count++;
        log("ROW IS: "+JSON.stringify(row));
        output += '\
          <item>\n\
            <title>'+row.value.title+'</title>\n\
            <description>'+row.value.description+'</description>\n\
            <link>http://chewbranca.com/posts/'+row.value.title.toLowerCase().replace(/\s+/g, '-')+'</link>\n\
            <pubDate>'+row.key+'</pubDate>\n\
            <guid>'+row.id+'</guid>\n\
          </item>\n';
      }
      output += '</channel>\n</rss>\n'
      return output;
    }
  },
  validate_doc_update: function(newDoc, oldDoc, userCtx) {
    /*if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
      throw "Only admin can delete documents on this database.";
    }*/
  }
};


couchapp.loadAttachments(ddoc, path.join(__dirname, 'dist', 'debug'));
module.exports = ddoc;
