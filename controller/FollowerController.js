var mongoose = require('mongoose'),
Followers = mongoose.model('followers');

module.exports = {
  GetAllFollowers: function (req, res) {
    console.log("List all Followers");
    Followers.find({}, function (err, results) {
      if (err) {
        throw err;
      }
      console.log("results: ", results);
      res.render("followersList.ejs", {
        allFollowers : results
      });
    });
  }
}