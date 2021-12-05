var mongoose = require('mongoose');

var followersSchema = new mongoose.Schema({
    follower_name: { type: String },
    follower_img: {type: String},
    follower_username: { type: String },
    follower_post: { type: Array },
    others_post: { type: Array }, 
    user_follower: {type: String}
});

mongoose.model('followers', followersSchema);