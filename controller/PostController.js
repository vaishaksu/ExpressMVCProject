var mongoose = require('mongoose'),
  Posts = mongoose.model('posts'),
  Users = mongoose.model('users');

const randomIdGenerator = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  GetAllPosts: function (req, res) {
    console.log("List all post");
    Users.aggregate([{
        $lookup: {
          from: "posts",
          let: {
            vaishakpost: "$post_ids"
          },
          pipeline: [{
              $match: {
                $expr: {
                  $in: ["$post_id", "$$vaishakpost"]
                }
              }
            },
            {
              $lookup: {
                from: "comments",
                let: {
                  vaishak_comment: "$comment_ids"
                },
                pipeline: [{
                  $match: {
                    $expr: {
                      $in: ["$comment_id", "$$vaishak_comment"]
                    }
                  }
                }],
                as: "comments_list"
              }
            }
          ],
          as: "posts_list"
        }
      },
      {
        $lookup: {
          from: "followers",
          let: {
            followers_overall: "$follower_username"
          },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ["$follower_username", "$$followers_overall"]
              }
            }
          }],
          as: "followers_list"
        }
      }
    ], (err, results) => {
      if (err) {
        throw err;
      }
      console.log("-----------------", results);

      res.render("postsList.ejs", {
        allPosts: results
      });
    });
  },
  GetAddPost: (req, res) => {
    console.log("Add post clicked");
    const {
      username
    } = req.params;
    res.render("addPostForm.ejs", {
      users_post: username
    });
  },
  PostAddPost: (req, res) => {
    const {
      users_post,
      post_info
    } = req.body;

    const jsonBody = {
      "users_post": users_post,
      "post_info": post_info,
      "likes": 0,
      "img": "",
      "comment_ids": [],
      "post_id": randomIdGenerator(1000, 10000000)
    }
    console.log("post clicked::: ", jsonBody, users_post);
    Posts.create(jsonBody, (err, result) => {
      if (err) throw err;
      console.log("RERSUHRFJNKolfbn: :::::: ", result);
      if (result) {

        Users.updateOne({
            username: users_post
          }, {
            $push: {
              'post_ids': jsonBody.post_id
            }
          },
          (err1, result1) => {
            if (err1) {
              throw err1;
            }
            console.log("+++++++++++++> ", result1);
            if (result1.acknowledged) {
              res.redirect('/posts');

            }
          }
        )
      } else {
        res.render("addPostForm.ejs", {
          users_post
        });
      }
    });
  },
  GetEditPost: (req, res) => {
    console.log("Add post clicked");
    const {
      post_id
    } = req.params;
    Posts.findOne({
      post_id
    }, (err, result) => {
      if (err) throw err;

      res.render("editPostForm.ejs", {
        post: result
      });
    })
  },
  postEditPost: (req, res) => {
    console.log("Edited post sdf clicked");
    const {
      post_info,
      users_post
    } = req.body;
    const {
      post_id
    } = req.params;

    let postEdit = {
      post_info,
      post_id,
      users_post
    };

    console.log("----> ", postEdit);

    Posts.updateOne({
      post_id
    }, {
      $set: {
        post_info,
      }
    }, (err, result) => {
      console.log("result: ", result);
      if (err) throw err;
      if (result.acknowledged) {
        // Users.updateOne({
        //     username: users_post
        //   }, {
        //     $push: {
        //       'post_ids': post_id
        //     }
        //   },
        //   (err1, result1) => {
        //     if (err1) {
        //       throw err1;
        //     }
        //     console.log("+++++++++++++> ", result1);
        //   }
        //   )

        if (result1.acknowledged) {
          res.redirect('/posts');
        }

      } else {
        res.render("editPostForm.ejs", {
          post: postEdit
        });
      }
    })
  },
  DeletePost: (req, res) => {
    console.log("Deleteing post");
    const {
      post_id
    } = req.params;

    Posts.deleteOne({
      post_id
    }, (err, result) => {
      if (err) throw err;
      console.log("result: ", result);
      if (result.deletedCount) {
        console.log({
          post_id
        });
        Users.updateMany({}, {
          $pull: {
            'post_ids': parseInt(post_id)
          }
        }, {
          multi: true
        }, (err1, result1) => {
          if (err1) throw err1;
          if (result1.acknowledged) {
            res.redirect("/posts");
          } else {
            res.redirect("/posts");
          }
        })
      }
    })
  },
  GetPostById: (req, res) => {
    console.log("View post by id: ");
    const {
      users_post,
      post_id,
    } = req.params

    console.log({
      post_id,
      users_post
    });

    Posts.aggregate([{
        $match: {
          post_id: parseInt(post_id),
          users_post: users_post
        }
      },
      {
        $lookup: {
          from: "comments",
          let: {
            comment_list: "$comment_ids"
          },
          pipeline: [{
            $match: {
              $expr: {
                $in: ["$comment_id", "$$comment_list"]
              }
            }
          }],
          as: "comment_info"
        }
      }
    ], (err, result) => {
      if (err) {
        throw err
      }
      console.log('LLLLLLL', result);

      res.render('ViewPost.ejs', {
        post: result[0]
      })
    })
  }
}