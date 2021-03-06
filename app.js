var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
// var upload = multer({dest: 'uploads/'});
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
app.use('/scripts', express.static(__dirname + 'public/scripts'));


app.use('/assets', express.static('assets'));

app.use(express.static(__dirname));
app.use('/uploads',express.static('uploads'));

var upload = multer({
    storage: multer.diskStorage ({
        destination: (req, file, cb) => {
            cb(null, './uploads');
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
        }
    })
})

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
app.get("/", usersController.GetIndexPage)
app.get('/login', usersController.GetDisplayLogin);
app.get('/signup', usersController.GetDisplaySignup);
app.get('/users', usersController.GetAllUsers);
app.get('/EditUser/:username/:yourProfile', usersController.EditUser);
app.get('/DeleteUser/:username/:yourProfile', usersController.DeleteUser);
app.get('/ViewReadOnlyUserById/:username', usersController.ViewReadOnlyUserById);
app.get('/loggedOutUser', usersController.LoggedOutUser);

/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/validateUser', usersController.validateUser);
app.post('/registerUser', upload.single('img'), usersController.registerUser);
app.post('/EditUser/:username/PostEditUser/:username/:yourProfile', upload.single('img'), usersController.PostEditUser);


/***-----------------------------POSTSCONTROLLER------------------------------------- */
/* ++++++++++++++++ GET ++++++++++++++++ */
app.get('/posts', postsController.GetAllPosts);
app.get('/addPost/:username', postsController.GetAddPost);
app.get('/editPost/:post_id', postsController.GetEditPost);
app.get('/deletePost/:post_id', postsController.DeletePost);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id', postsController.GetPostById);
app.get('/likePost/belongsTo/:users_post/belongsToUser/:post_id/likes/:likes/:allPosts', postsController.LikePost)

/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/addPost/postAddPost', upload.single('img'), postsController.PostAddPost);
app.post('/editPost/postEditPost/:post_id', upload.single('img'), postsController.postEditPost);


/* ------------------------------ COMMENTSCONTROLLER---------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/comments', commentsController.GetAllComments);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/addComment/:allPost', commentsController.GetAddCommentForm);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/editComment/:comment_id/:allPost', commentsController.EditCommentForm);
app.get('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/deleteComment/:comment_id/:allPost', commentsController.DeleteComment);


/*++++++++++++++++++ POST ++++++++++++++++++ */
app.post('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/postAddComment/:allPost', commentsController.PostAddComment);
app.post('/getPostById/belongsTo/:users_post/belongsToUser/:post_id/postEditComment/:allPost', commentsController.PostEditComment);

/* ------------------------------ FOLLOWERSCONTROLLER---------------------------------- */
/** ++++++++++++++++ GET ++++++++++++++++ */
app.get('/followers', followersController.GetAllFollowers);
app.get('/followLink/:follower_id/:username/:follow', followersController.ConvertFollowers);


app.get('/about', followersController.About);
app.get('/privacy', followersController.Privacy);
app.get('/faq', followersController.Faq);
app.get('/guidelines', followersController.Guidelines);
app.get('/contact', followersController.Contact);

app.listen('3000');
