var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    value: { type: String },
    user_comment: {type: String},
});

mongoose.model('comments', commentSchema);