var mongoose = require('mongoose'),
Comments = mongoose.model('comments');

module.exports = {
  GetAllComments: function (req, res) {
    console.log("List all Comments");
    Comments.find({}, function (err, results) {
      if (err) {
        throw err;
      }

      res.render("commentsList.ejs", {
        allComments : results
      });
    });
  }
}