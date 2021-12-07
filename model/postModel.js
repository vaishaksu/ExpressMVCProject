var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  post_info: { type: String },
  img: {type: String},
  likes: { type: Number },
  comment_ids: { type: Array },
  users_post: { type: String }, 
  post_id: {type: Number},
});

mongoose.model('posts', postSchema);