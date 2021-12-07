var mongoose = require('mongoose'),
  Comments = mongoose.model('comments'),
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
    } = req.params;

    Posts.findOne({
      post_id,
      users_post
    }, (err, result) => {
      if (err) throw err;
      // req.session.username = "@ashik.surendran";
      console.log("++++++++++++++++++++++++++++", req.session);
      const addCommentHereResult = {
        result,
        logged_in_user: req.session.username,
      }
      console.log("result: ", result);
      console.log("addddddd::: ", addCommentHereResult);
      res.render("addCommentForm.ejs", {
        commentPost: addCommentHereResult
      });
    });

  },
  PostAddComment: (req, res) => {
    console.log('post all comment')
    const {
      post_id,
      users_post,
    } = req.params;

    const addComment = {
      "value": req.body.value,
      "user_comment": req.body.logged_in_user,
      "post_info": req.body.post_info,
      "comment_id": randomIdGenerator(5000, 50000000)
    };

    Comments.create(addComment, (err, result) => {
      if (err) throw err;
      console.log("result: ", result);
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
            res.redirect(`/getPostById/belongsTo/${users_post}/belongsToUser/${post_id}`);
          }
        });
        // res.redirect('/posts');
      } else {

      }
    });
  },
  EditCommentForm: (req, res) => {
    console.log('post all comment');
    const {
      post_id,
      users_post,
      comment_id
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

      if (result) { // Success
        res.render('editComment.ejs', {
          commentPost: concatenateResult
        });
      }
    })
  },
  PostEditComment: (req, res) => {
    console.log('Edit  [posy] all comment');
    const {
      post_id,
      users_post,
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
        res.redirect(`/getPostById/belongsTo/${users_post}/belongsToUser/${post_id}`);
      }
    });
  },
  DeleteComment: (req, res) => {
    const {
      post_id,
      users_post,
      comment_id
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
          if  (err1) throw error;
          if (result1.acknowledged) {
            res.redirect(`/getPostById/belongsTo/${users_post}/belongsToUser/${post_id}`);
          }
        })
      }
    })
  }
}