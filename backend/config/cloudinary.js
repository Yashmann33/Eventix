const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile image storage
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eventura/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    },
});

// Event image storage
const eventStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eventura/events',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
        transformation: [{ width: 1200, height: 630, crop: 'fill' }],
    },
});

const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadEvent = multer({
    storage: eventStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadProfile, uploadEvent };
