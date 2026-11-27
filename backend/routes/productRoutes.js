
const express = require('express');
const Product = require('../models/product');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

const router = express.Router();

// Handle photo upload errors and return JSON
const uploadProductPhotos = (req, res, next) => {
  upload.array('photos', 4)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || 'Photo upload failed.'
      });
    }

    next();
  });
};

// GET: View all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);

    return res.status(500).json({
      message: 'Failed to fetch products.'
    });
  }
});

// GET: View one product (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({
      message: 'Invalid product ID.'
    });
  }
});

// POST: Add product (Owner only)
router.post(
  '/',
  (req, res, next) => {
    console.log('POST /api/products request received');
    next();
  },
  authMiddleware,
  uploadProductPhotos,
  async (req, res) => {
    try {
      if (!req.files || req.files.length < 2 || req.files.length > 4) {
        return res.status(400).json({
          message: 'Please upload 2 to 4 product photos.'
        });
      }

      let sizes = req.body.sizes;

      if (typeof sizes === 'string') {
        sizes = [sizes];
      }

      const mainPhotoIndex = Number(req.body.mainPhotoIndex ?? 0);

      if (
        !Number.isInteger(mainPhotoIndex) ||
        mainPhotoIndex < 0 ||
        mainPhotoIndex >= req.files.length
      ) {
        return res.status(400).json({
          message: 'Invalid main photo selection.'
        });
      }

      const photoUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
      );

      const product = await Product.create({
        name: req.body.name,
        clothCode: req.body.clothCode,
        price: req.body.price,
        offerPrice: req.body.offerPrice || null,
        sizes,
        fabric: req.body.fabric,
        photos: photoUrls,
        mainPhotoIndex
      });

      return res.status(201).json({
        message: 'Product added successfully.',
        product
      });
    } catch (error) {
      console.error('Add product error:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: 'This cloth code already exists.'
        });
      }

      return res.status(400).json({
        message: error.message || 'Failed to add product.'
      });
    }
  }
);

// PUT: Edit product (Owner only)
router.put(
  '/:id',
  authMiddleware,
  uploadProductPhotos,
  async (req, res) => {
    try {
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) {
        return res.status(404).json({
          message: 'Product not found.'
        });
      }

      let photoUrls = existingProduct.photos;
      let mainPhotoIndex = existingProduct.mainPhotoIndex || 0;

      // Upload new photos only when selected
      if (req.files && req.files.length > 0) {
        if (req.files.length < 2 || req.files.length > 4) {
          return res.status(400).json({
            message: 'Please upload 2 to 4 product photos.'
          });
        }

        photoUrls = await Promise.all(
          req.files.map(file => uploadToCloudinary(file.buffer))
        );

        mainPhotoIndex = Number(req.body.mainPhotoIndex ?? 0);
      } else if (req.body.mainPhotoIndex !== undefined) {
        mainPhotoIndex = Number(req.body.mainPhotoIndex);
      }

      if (
        !Number.isInteger(mainPhotoIndex) ||
        mainPhotoIndex < 0 ||
        mainPhotoIndex >= photoUrls.length
      ) {
        return res.status(400).json({
          message: 'Invalid main photo selection.'
        });
      }

      let sizes = req.body.sizes;

      if (typeof sizes === 'string') {
        sizes = [sizes];
      }

      const updatedData = {
        name: req.body.name ?? existingProduct.name,
        clothCode: req.body.clothCode ?? existingProduct.clothCode,
        price: req.body.price ?? existingProduct.price,
        offerPrice: req.body.offerPrice !== undefined
          ? (req.body.offerPrice || null)
          : existingProduct.offerPrice,
        sizes: sizes ?? existingProduct.sizes,
        fabric: req.body.fabric ?? existingProduct.fabric,
        photos: photoUrls,
        mainPhotoIndex
      };

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true
        }
      );

      return res.status(200).json({
        message: 'Product updated successfully.',
        product
      });
    } catch (error) {
      console.error('Update product error:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: 'This cloth code already exists.'
        });
      }

      return res.status(400).json({
        message: error.message || 'Failed to update product.'
      });
    }
  }
);

// DELETE: Delete product (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Delete product error:', error);

    return res.status(400).json({
      message: 'Invalid product ID.'
    });
  }
});

module.exports = router;
