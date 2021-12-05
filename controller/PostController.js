var mongoose = require('mongoose'),
Posts = mongoose.model('posts');

module.exports = {
  GetAllPosts: function (req, res) {
    console.log("List all post");
    Posts.find({}, function (err, results) {
      if (err) {
        throw err;
      }

      res.render("postsList.ejs", {
        allPosts : results
      });
    });
  }
}