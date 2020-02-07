var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var StorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    comment: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});
var Story = mongoose.model("Story", StorySchema);
module.exports = Story; 