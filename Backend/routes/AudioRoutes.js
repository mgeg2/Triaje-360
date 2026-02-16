const express = require('express');
const multer = require('multer');
const AudioController = require('../controllers/AudioController');
const router = express.Router();

// Configurar multer para recibir archivo en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'video/mp4'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos WAV, MP3 o MP4'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // Máximo 50MB para audios
    }
});

router.post('/upload', upload.single('audio'), AudioController.uploadAudio);
router.get('/lista', AudioController.listAudios);
router.get('/bbdd', AudioController.getAllAudios);
router.delete('/delete/:audioId', AudioController.deleteAudio);
router.get('/:fileName', AudioController.getAudio);

module.exports = router;
