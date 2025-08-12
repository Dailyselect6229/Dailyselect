// model/user.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: false, index: true },
  googleId: { type: String, index: true }, // payload.sub
  mobile: { type: String, required: true, unique: true },
  street: String,
  ward: String,

  // Updated location schema (GeoJSON + human readable)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    readable: { type: String } // e.g., "MG Road, Indore"
  },

  lastSeen: { type: Date },
  accuracy: { type: Number },
}, { timestamps: true });

// Geo index for location
userSchema.index({ location: '2dsphere' });

// Duplicate key error handler
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
