const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        email: {type:String, unique: true},
        password: String,
        school: {type:mongoose.Schema.Types.ObjectId, ref:'school'},
        role: {type:String, enum:['admin', 'teacher', 'student']},
        resetPasswordOtp: String,
        resetPasswordExpires: Date
    }
)
const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
