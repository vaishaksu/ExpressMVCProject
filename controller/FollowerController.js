var mongoose = require('mongoose'),
  Followers = mongoose.model('followers'),
  UserFollowers = mongoose.model('user_followers'),
  Users = mongoose.model('users');

module.exports = {
  GetAllFollowers: function (req, res) {
    console.log("List all Followers");
    // TODO: remove the below code
    req.session.username = "@vaishak.surendran"
    // FIXME: Fetching result from the new collection using map
    UserFollowers.aggregate([{
        $match: {
          username: req.session.username
        }
      },
      {
        $project: {
          username: 1,
          Results: {
            $map: {
              input: "$followers_list",
              as: "c",
              in: {
                follower_id: "$$c.follower_id",
                follower_username: "$$c.follower_username",
                follower_name: "$$c.follower_name",
                follower_img: "$$c.follower_img",
                isFollowing: {
                  $arrayElemAt: [
                    "$follower_ids",
                    {
                      $indexOfArray: ["$follower_ids", "$$c.follower_id"]
                    }
                  ]
                },
                follow_buzz: {
                  $cond: {
                    if: {
                      $gte: [{
                        $indexOfArray: ["$follower_ids", "$$c.follower_id"]
                      }, 0]
                    },
                    then: true,
                    else: false
                  }
                }
              }
            }
          }
        }
      }
    ], (err, result) => {
      if (err) throw err;
      res.render("followersList.ejs", {
        allFollowers: result[0]
      });
    })
  },
  ConvertFollowers: (req, res) => {
    const {
      follower_id,
      username,
      follow
    } = req.params;

    if (follow == "true") { // Convert Following to Follower. Clicked on Following button
      Users.updateOne({
        username
      }, {
        $pull: {
          "follower_ids": parseInt(follower_id)
        }
      }, (err, result) => {
        if (err) throw err;

        console.log("Pull: ", result);
        if (result.acknowledged) {

          //FIXME: Create a new collection just to update 'user_followers' collection 
          Users.aggregate([{
            $lookup: {
              from: "followers",
              let: {
                vaishak: "$follower_ids"
              },
              pipeline: [{
                $match: {
                  $expr: {
                    $not: {
                      $in: ["follower_id", "$$vaishak"]
                    }
                  }
                }
              }],
              as: "followers_list"
            }
          }, {
            $out: "user_followers"
          }], (err1, result1) => {
            if (err1) throw err1;
            console.log("result CONBERT: ", result1.length);
            res.redirect('/followers');
          })
        }
      });
    } else { // Convert Follower to Following. Clicked on Follower button
      Users.updateOne({
        username
      }, {
        $push: {
          "follower_ids": parseInt(follower_id)
        }
      }, (err, result) => {
        if (err) throw err;
        if (result.acknowledged) {

          //FIXME: Create a new collection just to update 'user_followers' collection 
          Users.aggregate([{
            $lookup: {
              from: "followers",
              let: {
                vaishak: "$follower_ids"
              },
              pipeline: [{
                $match: {
                  $expr: {
                    $not: {
                      $in: ["follower_id", "$$vaishak"]
                    }
                  }
                }
              }],
              as: "followers_list"
            }
          }, {
            $out: "user_followers"
          }], (err1, result1) => {
            if (err1) throw err1;
            res.redirect('/followers');
          })
        }
      });
    }


  }
}