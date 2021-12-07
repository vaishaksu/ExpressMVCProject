var mongoose = require('mongoose');

var followersSchema = new mongoose.Schema({
    follower_name: { type: String },
    follower_img: {type: String},
    follower_username: { type: String },
    follower_id: {type: Number},
});

mongoose.model('followers', followersSchema);