var mongoose = require('mongoose'),
  Users = mongoose.model('users'),
  Comments = mongoose.model('comments'),
  UserFollowers = mongoose.model('user_followers'),
  Posts = mongoose.model('posts');

module.exports = {
  GetIndexPage: (req, res) => {
    req.session.destroy();
    res.render('index.ejs');
  },
  GetAllUsers: function (req, res) {
    console.log("List all users");
    Users.find({}, function (err, results) {
      if (err) {
        throw err;
      }
      // console.log("usersss: ", results);
      res.render("usersList.ejs", {
        allUsers: results
      });
    });
  },
  GetDisplayLogin: (req, res) => {
    console.log("Show loging page");
    res.render('login.ejs');
  },
  GetDisplaySignup: (req, res) => {
    const error = "";
    console.log("Show Singup page");
    res.render('signup.ejs', {
      error
    });
  },
  validateUser: (req, res) => {
    console.log("validate user: ");
    let {
      username,
      password
    } = req.body;

    let validate = {};

    if(username.charAt(0) === "@") {
      validate = {
        "username": username,
        "password": password
      }
    } else {
      validate = {
        "username": `@${username}`,
        "password": password
      }
    }
    
    console.log("validate.username.toLowerCase()::: ", validate.username.toLowerCase(), validate.password);

    Users.findOne({
      username: validate.username.toLowerCase(),
      password: validate.password
    }, (err, results) => {
      if (err) throw err;
      console.log("result: ", results);
      if (results != null) { // Success
        req.session.username = `${validate.username}`;
        // console.log("username: ", validate.username);
        console.log("--------------------------------------", req.session);
        // sessionStorage.setItem("username", username);

        if ( username == "@admin" ) {
          res.redirect('/users');
        } else {
          res.redirect('/posts');
        }
      } else { // Failure
        res.render("login.ejs");
      }
    })
  },
  registerUser: (req, res) => {
    console.log("Signup user: ", req.file);
    let {
      first_name,
      last_name,
      email,
      password,
      confirmPassword
    } = req.body;

    let isPasswordValid = password === confirmPassword;

    if (isPasswordValid) { // Password is valid
      let register = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "img": req.file?.path,
        "username": `@${first_name}.${last_name}`.toLowerCase(),
        "password": password,
        "joined_date": new Date().toLocaleDateString('en-CA'),
      }

      Users.create(register, (err, result) => {
        if (err) throw err;
        if (result) { // Success
          req.session.username = `${register.username}`;
          console.log("SUCCESSSSSSS:   ", result);

          //FIXME: Create a new collection 'user_followers' 
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

            
            res.redirect('/posts');
          })
        } else { // Failure

        }
      });
    } else { // Password is not correct
      const error = "Password and Confirm Password mismatch";
      res.render("signup.ejs", {
        error
      });
    }
  },
  EditUser: (req, res) => {
    let {
      username,
      yourProfile
    } = req.params;
    Users.findOne({
      username
    }, (err, result) => {
      if (err) throw err;
      console.log("*****: ", result, !result);
      if (result) { // Success
        res.render('editUser.ejs', {
          user: result,
          yourProfile
        });
      } else { // Failed
        res.redirect("/users");
      }
    })
  },
  PostEditUser: (req, res) => {
    let {
      first_name,
      last_name,
      email,
      password
    } = req.body;

    const img = req.file?.path;

    console.log("POSTING: ", req.body);
    let postEdit = {
      first_name,
      last_name,
      email,
      password
    };

    const {
      username,
      yourProfile
    } = req.params;

    console.log("File to upload: ", req.file);

    Users.updateOne({
      username
    }, {
      $set: {
        first_name,
        last_name,
        email,
        img,
        password
      }
    }, (err, result) => {
      if (err) throw err;
      console.log("result: ", result);
      if (result.acknowledged) {
        if (yourProfile === "yourProfile") {
          res.redirect(`/ViewReadOnlyUserById/${username}`);
        } else {
          res.redirect('/users');
        }
      } else {
        res.render("editUser.ejs", {
          user: postEdit
        });
      }
    });
  },
  DeleteUser: (req, res) => {
    console.log("Deleteing");
    const {
      username,
      yourProfile
    } = req.params;

    Users.deleteOne({
      username
    }, (err, result) => {
      if (err) throw err;
      console.log("result: ", result);
      if (result.deletedCount) {

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
        }], (err3, result3) => {
          if (err3) throw err3;

          Posts.deleteMany({
            users_post: username
          }, (err1, result1) => {
            if (err1) throw err1;
            console.log("result111111111: ", result1);

            if (result1.deletedCount) {

              Comments.deleteMany({
                user_comment: username
              }, (err2, result2) => {
                if (err2) throw err2;
                console.log("resul22222222: ", result2);
                if (result2.deletedCount) {
                  if ( yourProfile === "yourProfile" ) {
                    res.redirect(`/signup`);
                  } else {
                    res.redirect('/users');
                  }
                } else {
                  console.log("resul2222222346753473472: ", result2);
                  if ( yourProfile === "yourProfile" ) {
                    res.redirect(`/signup`);
                  }
                }
              })
            } else {
              console.log("no post ");
              if ( yourProfile === "yourProfile" ) {
                res.redirect(`/signup`);
              } else {
                console.log("hit here");
                res.redirect('/users');
              }
            }
          })
          if ( yourProfile === "yourProfile" ) {
            res.redirect(`/signup`);
          } else {
            res.redirect('/users');
          }
        });
      }
    })
  },
  GetUserFollowersList: (req, res) => {
    // TODO: Need to remove req.session.username hardcoded value
    Users.aggregate([{
        $match: {
          username: req.session.username
        }
      },
      {
        $lookup: {
          from: "followers",
          let: {
            user_followers_list: "$follower_ids"
          },
          pipeline: [{
            $match: {
              $expr: {
                $in: ["$follower_id", "$$user_followers_list"]
              }
            }
          }],
          as: "user_followers_list"
        }
      }
    ], (err, result) => {
      if (err) {
        throw err;
      }
      if (result) {
        res.render("userFolowersList.ejs", {
          userListFollowers: result
        });
      }
    })

  },
  ViewReadOnlyUserById: (req, res) => {
    console.log("----> ");
    const {
      username
    } = req.params;

    Users.aggregate([{
        $match: {
          username
        }
      },
      {
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
            followers_overall: "$follower_ids"
          },
          pipeline: [{
            $match: {
              $expr: {
                $in: ["$follower_id", "$$followers_overall"]
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
      console.log("-----------------", results[0]);

      res.render("ViewProfile.ejs", {
        viewYourInfo: results[0],
        username: req.session.username
      });
    });
  },
  LoggedOutUser: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  }
}