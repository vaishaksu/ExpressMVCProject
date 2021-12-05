var mongoose = require('mongoose'),
  Users = mongoose.model('users'),
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
        res.redirect('/users');
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
        res.redirect("/users")
      }
    })

  }
}