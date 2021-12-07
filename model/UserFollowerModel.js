var mongoose = require('mongoose');

var userFollowerSchema = new mongoose.Schema({
    username: { type: String },
    Results: { type: Array },
});

mongoose.model('user_followers', userFollowerSchema);