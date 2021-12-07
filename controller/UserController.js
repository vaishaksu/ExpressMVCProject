var mongoose = require('mongoose'),
  Users = mongoose.model('users'),
  Comments = mongoose.model('comments'),
  UserFollowers = mongoose.model('user_followers'),
  Posts = mongoose.model('posts');

module.exports = {
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

    let validate = {
      "username": `@${username}`,
      "password": password
    }

    Users.findOne({
      username: validate.username,
      password: validate.password
    }, (err, results) => {
      if (err) throw err;
      console.log("result: ", results);
      if (results != null) { // Success
        req.session.username = `${validate.username}`;
        // console.log("username: ", validate.username);
        console.log("--------------------------------------", req.session);
        // sessionStorage.setItem("username", username);
        res.redirect('/posts');
      } else { // Failure
        res.render("login.ejs");
      }
    })
  },
  registerUser: (req, res) => {
    console.log("Signup user: ");
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
        "username": `@${first_name}.${last_name}`,
        "password": password
      }

      Users.create(register, (err, result) => {
        if (err) throw err;
        if (result) { // Success
          req.session.username = `${register.username}`;

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
          }], ( err1, result1 ) => {
            if (err1) throw err1;

            res.redirect('/users');
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
      username
    } = req.params;
    Users.findOne({
      username
    }, (err, result) => {
      if (err) throw err;
      console.log("*****: ", result, !result);
      if (result) { // Success
        res.render('editUser.ejs', {
          user: result
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

    console.log("POSTING: ", req.body);
    let postEdit = {
      first_name,
      last_name,
      email,
      password
    };

    const {
      username
    } = req.params;

    Users.updateOne({
      username
    }, {
      $set: {
        first_name,
        last_name,
        email,
        password
      }
    }, (err, result) => {
      if (err) throw err;
      console.log("result: ", result);
      if (result.acknowledged) {
        res.redirect('/users');
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
      username
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
                  res.redirect('/users');
                } else {
                  console.log("resul2222222346753473472: ", result2);
                  res.redirect('/users');
                }
              })
            } else {
              console.log("no post ");
              res.redirect('/users');
            }
          })
          res.redirect("/users");
        }
      );
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
  LoggedOutUser: (req, res) => {
    if (req.session.username) {
      req.sesion.username = "";
    }
  }
}