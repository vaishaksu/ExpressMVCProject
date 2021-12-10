var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    value: { type: String },
    user_comment: {type: String},
    post_info: {type: String},
    comment_id: {type: Number},
    user_img: { type: String }
});

mongoose.model('comments', commentSchema);