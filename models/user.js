const mongoose= require('mongoose');
const Schema= mongoose.Schema;

const userSchema= mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' //there is a connection with this event
        }


    ]
});

module.exports= mongoose.model('User', userSchema);