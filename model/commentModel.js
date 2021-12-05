var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    value: { type: String },
    user_comment: {type: String},
    post_info: {type: String},
    comment_id: {type: Number}
});

mongoose.model('comments', commentSchema);