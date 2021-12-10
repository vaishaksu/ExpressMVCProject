var mongoose = require('mongoose'),
  Comments = mongoose.model('comments'),
  Users = mongoose.model('users'),
  Posts = mongoose.model('posts');

const randomIdGenerator = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  GetAllComments: function (req, res) {
    console.log("List all Comments");
    Comments.find({}, function (err, results) {
      if (err) {
        throw err;
      }

      res.render("commentsList.ejs", {
        allComments: results
      });
    });
  },
  GetAddCommentForm: (req, res) => {
    console.log("List all Comments");
    const {
      users_post,
      post_id,
      allPost
    } = req.params;

    Posts.findOne({
      post_id,
      users_post
    }, (err, result) => {
      if (err) throw err;

      // TODO: 
      // req.session.username = "@ashik.surendran";h
      console.log("++++++++++++++++++++++++++++", req.session);
      const addCommentHereResult = {
        result,
        logged_in_user: req.session.username,
      }
      console.log("result: ", result);
      console.log("addddddd::: ", addCommentHereResult);

      Users.findOne({
        username: addCommentHereResult.logged_in_user
      }, (err, result1) => {
        if (err) throw err;

        res.render("addCommentForm.ejs", {
          commentPost: addCommentHereResult,
          allPost,
          result: result1
        });
      });
    });

  },
  PostAddComment: (req, res) => {
    console.log('post all comment')
    const {
      post_id,
      users_post,
      allPost
    } = req.params;

    const username = req.body.user_comment;
    console.log("*****************: ", req.body.user_comment, username);


    Users.findOne({
      username
    }, (err1, result1) => {
      if (err1) {
        throw err1;
      }

      console.log("POSTTGYUHG: ", result1);

      // The person who commented will go inside the postids
      Users.updateOne({
          username
        }, {
          $push: {
            'post_ids': parseInt(post_id)
          }
        },
        (err2, result2) => {
          if (err2) {
            throw err2;
          }

          if (result2.acknowledged) {
            const addComment = {
              "value": req.body.value,
              "user_comment": username,
              "post_info": req.body.post_info,
              "comment_id": randomIdGenerator(5000, 50000000),
              "user_img": result1.img
            };
  
            Comments.create(addComment, (err, result) => {
              if (err) throw err;
              console.log("result: ", result);
              console.log("----****: ", username);
              if (result) { // Success
                console.log(post_id);
  
                Posts.updateOne({
                  post_id: parseInt(post_id)
                }, {
                  $push: {
                    'comment_ids': parseInt(addComment.comment_id)
                  }
                }, (err1, result1) => {
                  if (err1) throw err1;
                  console.log("----------------: ", result1);
                  if (result1.acknowledged) {
  
                    if (allPost === "allPost") {
                      res.redirect("/posts");
                    } else {
                      res.redirect(`/getPostById/belongsTo/${users_post}/belongsToUser/${post_id}`);
                    }
                  }
                });
                // res.redirect('/posts');
              } else {
                res.redirect('/');
              }
            });
          } else {
            res.redirect('/');
          }

        });


    });

  },
  EditCommentForm: (req, res) => {
    console.log('post all comment');
    const {
      post_id,
      users_post,
      comment_id,
      allPost,
    } = req.params;

    Comments.findOne({
      comment_id
    }, (err, result) => {
      if (err) {
        throw err;
      }

      const concatenateResult = {
        result,
        post_id,
        users_post
      }

      console.log("erereeer: ", concatenateResult);

      if (result) { // Success
        res.render('editComment.ejs', {
          commentPost: concatenateResult,
          allPost
        });
      } else {
        res.redirect('/');
      }
    })
  },
  PostEditComment: (req, res) => {
    console.log('Edit  [posy] all comment');
    const {
      post_id,
      users_post,
      allPost,
    } = req.params;

    const {
      value,
      comment_id
    } = req.body;

    console.log({
      value,
      comment_id
    });

    Comments.updateOne({
      comment_id
    }, {
      $set: {
        value,
      }
    }, (err, result) => {
      if (err) throw err;
      console.log("---- + + ------------: ", result);
      if (result.acknowledged) {
        if (allPost === "allPost") {
          res.redirect("/posts");
        } else {
          res.redirect(`/getPostById/belongsTo/${users_post}/belongsToUser/${post_id}`);
        }
      }
    });
  },
  DeleteComment: (req, res) => {
    const {
      post_id,
      users_post,
      comment_id,
      allPost,
    } = req.params;

    Comments.deleteOne({
      comment_id
    }, (err, result) => {
      if (err) {
        throw err;
      }

      if (result.deletedCount) {
        console.log("Dedlkete: ------- ", result);
        Posts.updateOne({
          post_id
        }, {
          $pull: {
            'comment_ids': comment_id
          }
        }, (err1, result1) => {
          console.log("resul;t ****// ", result1);
          if (err1) throw error;
          if (result1.acknowledged) {
            if (allPost === "allPost") {
              res.redirect("/posts");
            } else {
              res.redirect(`/getPostById/belongsTo/${users_post}/belongsToUser/${post_id}`);
            }
          }
        })
      }
    })
  }
}