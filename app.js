var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}))

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/images', express.static(__dirname + 'public/images'));

/********************************** MODELS ***********************************************/
require('./model/userModel');
require('./model/postModel'); 
require('./model/commentModel'); 
require('./model/followerModel'); 
require('./model/UserFollowerModel'); 
/*****************************************************************************************/

mongoose.connect("mongodb+srv://VaishakS4:intresting@cluster0.6fcs1.mongodb.net/BuzzTalk", {useUnifiedTopology: true, useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.once('open', function() {
    console.log('mongoose is connected');
});

/********************************** CONTROLLERS ***********************************************/
var usersController  = require('./controller/UserController');
var postsController = require('./controller/PostController');
var commentsController = require('./controller/CommentController');
var followersController = require('./controller/FollowerController');
/***********************************************************************************************/

/* ------------------------------USERSCONTROLLER----------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/login', usersController.GetDisplayLogin);
app.get('/signup', usersController.GetDisplaySignup);
app.get('/users', usersController.GetAllUsers);
app.get('/EditUser/:username', usersController.EditUser);
app.get('/DeleteUser/:username', usersController.DeleteUser);
app.get('/loggedOutUser', usersController.LoggedOutUser);

/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/validateUser', usersController.validateUser);
app.post('/registerUser', usersController.registerUser);
app.post('/EditUser/PostEditUser/:username', usersController.PostEditUser);


/***-----------------------------POSTSCONTROLLER------------------------------------- */
/* ++++++++++++++++ GET ++++++++++++++++ */
app.get('/posts', postsController.GetAllPosts);
app.get('/addPost/:username', postsController.GetAddPost);
app.get('/editPost/:post_id', postsController.GetEditPost);
app.get('/deletePost/:post_id', postsController.DeletePost);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id', postsController.GetPostById);

/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/addPost/postAddPost', postsController.PostAddPost);
app.post('/editPost/postEditPost/:post_id', postsController.postEditPost);


/* ------------------------------ COMMENTSCONTROLLER---------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/comments', commentsController.GetAllComments);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/addComment', commentsController.GetAddCommentForm);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/editComment/:comment_id', commentsController.EditCommentForm);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/deleteComment/:comment_id', commentsController.DeleteComment);

/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/postAddComment', commentsController.PostAddComment);
app.post('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/postEditComment', commentsController.PostEditComment);

/* ------------------------------ FOLLOWERSCONTROLLER---------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/followers', followersController.GetAllFollowers);
app.get('/followLink/:follower_id/:username/:follow', followersController.ConvertFollowers);

app.listen('3000');
