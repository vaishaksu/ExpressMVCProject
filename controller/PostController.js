var mongoose = require('mongoose'),
  Posts = mongoose.model('posts'),
  Users = mongoose.model('users');

const randomIdGenerator = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  GetAllPosts: function (req, res) {
    console.log("List all post");
    Posts.aggregate([{
        $lookup: {
          from: "comments",
          let: {
            comment_added: "$comment_ids"
          },
          pipeline: [{
            $match: {
              $expr: {
                $in: ["$comment_id", "$$comment_added"]
              }
            }
          }],
          as: "post_comments"
        }
      },
      {
        $project: {
          post_info: 1,
          img: 1,
          likes: 1,
          users_post: 1,
          _id: 0,
          post_id: 1,
          post_comments: 1,
          posted_date: 1,
          user_img: 1,
        }
      },
    ], (err, results) => {
      if (err) {
        throw err;
      }
      console.log("-----------------", results);
      console.log("req.session:L ", req.session);

      // TODO: Comment the below only
      // req.session.username = "@vaishak.surendran";

      const {
        username
      } = req.session;

      Users.findOne({
        username
      }, (err1, result1) => {
        if (err1) throw err1;

        if (result1) {
          res.render("postsList.ejs", {
            allPosts: results,
            username,
            user_img: result1.img,
          });
        } else {
          res.redirect('/')
        }
      })
    });

  },
  GetAddPost: (req, res) => {
    console.log("Add post clicked");
    const {
      username
    } = req.params;

    Users.findOne({
      username
    }, (err, result) => {
      if (err) throw err;

      res.render("addPostForm.ejs", {
        users_post: username,
        result
      });
    })
  },
  PostAddPost: (req, res) => {
    const {
      users_post,
      post_info
    } = req.body;

    Users.findOne({
      username: users_post
    }, (err1, result1) => {
      if (err1) {
        throw err1;
      }

      const jsonBody = {
        "users_post": users_post,
        "post_info": post_info,
        "likes": 0,
        "img": req.file?.path,
        "comment_ids": [],
        "post_id": randomIdGenerator(1000, 10000000),
        "posted_date": new Date().toLocaleDateString('en-CA'),
        "user_img": result1.img
      }

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
    })
  },
  GetEditPost: (req, res) => {
    console.log("Add post clicked");
    const {
      post_id
    } = req.params;

    // Posts.findOne({
    //   post_id
    // }, (err, result) => {
    //   if (err) throw err;

    //   Users.findOne({
    //     username: result.users_post
    //   }, (err1, result1) => {
    //     if (err1) throw err;
    //     res.render("editPostForm.ejs", {
    //       post: result
    //     });
    //   });

    // })

    Posts.aggregate([{
      $match: {
        post_id: parseInt(post_id)
      }
    }, {
      $lookup: {
        from: "users",
        let: {
          fetch_user: "$users_post"
        },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$username", "$$fetch_user"]
            }
          }
        }],
        as: "post_user"
      }
    }, {
      $unwind: '$post_user'
    }], (err, result) => {
      if (err) {
        throw err
      }
      console.log('LLLLLLL', result);

      res.render("editPostForm.ejs", {
        post: result[0]
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

        // if (result1.acknowledged) {
        res.redirect('/posts');
        // }

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
          users_post
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
      }, {
        $lookup: {
          from: "users",
          pipeline: [{
            $match: {
              $expr: {
                $eq: ["$username", req.session.username]
              }
            }
          }],
          as: "logged_in_user_info"
        }
      }, {
        $unwind: "$logged_in_user_info"
      }
    ], (err, result) => {
      if (err) {
        throw err
      }
      console.log('LLLLLLL', result);

      res.render('ViewPost.ejs', {
        post: result[0],
        username: req.session.username
      })
    })
  },
  LikePost: (req, res) => {
    const {
      users_post,
      post_id,
      likes,
      allPosts
    } = req.params;

    Posts.updateOne({
      post_id: parseInt(post_id)
    }, {
      $set: {
        likes: parseInt(likes) + 1
      }
    }, (err, result) => {
      if (err) throw err;
      console.log("==: ", result);

      if (allPosts === "allPosts") {
        res.redirect("/posts");
      }
    })
  }
}