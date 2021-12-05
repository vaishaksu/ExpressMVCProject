var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/images', express.static(__dirname + 'public/images'));

/********************************** MODELS ***********************************************/
require('./model/userModel');
require('./model/postModel'); 
require('./model/commentModel'); 
require('./model/followerModel'); 
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

/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/validateUser', usersController.validateUser);
app.post('/registerUser', usersController.registerUser);


/***-----------------------------POSTSCONTROLLER------------------------------------- */
/* ++++++++++++++++ GET ++++++++++++++++ */
app.get('/posts', postsController.GetAllPosts);

/* ------------------------------ COMMENTSCONTROLLER---------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/comments', commentsController.GetAllComments);

/* ------------------------------ FOLLOWERSCONTROLLER---------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/followers', followersController.GetAllFollowers);



app.listen('3000');
