var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    first_name: { type: String },
    last_name: {type: String },
    username: {type: String },
    password: {type: String },
    date_of_birth: {type: String },
    email: {type: String },
    img: {type: String },
    followers: {type: Array },
    posts: {type: Array },
    post_ids: { type: Array },
});

mongoose.model('users', userSchema);