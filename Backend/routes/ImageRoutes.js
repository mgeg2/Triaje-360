const express = require('express');
const multer = require('multer');
const ImageController = require('../controllers/ImageController');
const router = express.Router();

// Configurar multer para recibir archivo en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/png', 'image/jpeg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PNG o JPG'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // Máximo 5MB
    }
});

router.post('/upload', upload.single('image'), ImageController.uploadImage);
router.delete('/delete/:imageId', ImageController.deleteImage);
router.get('/lista/:type', ImageController.listImages);
router.get('/bbdd/:type', ImageController.getImagesByType);
router.get('/:type/:fileName', ImageController.getImage);

module.exports = router;
