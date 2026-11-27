
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    clothCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    price: {
      type: Number,
      required: true
    },

    offerPrice: {
      type: Number,
      default: null
    },

    sizes: {
      type: [{
        type: String,
        enum: ['M', 'L', 'XL', '2XL', '3XL']
      }],
      required: true
    },

    fabric: {
      type: String,
      required: true
    },

    photos: {
      type: [String],
      required: true,
      validate: {
        validator: function (photos) {
          return photos.length >= 2 && photos.length <= 4;
        },
        message: 'Upload 2 to 4 product photos.'
      }
    },

    mainPhotoIndex: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
