const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,
  email: { type: String, required: true, index: true },
  googleId: { type: String, index: true },     // payload.sub
  mobile: String,
  street: String,
  ward: String,
  location: String, // human readable (eg: "MG Road, Indore") or "lat,lng"
}, { timestamps: true });

userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      next(new Error('There was a duplicate key error'));
    } else {
      next();
    }
  });

module.exports = mongoose.model('UserModel', userSchema);
