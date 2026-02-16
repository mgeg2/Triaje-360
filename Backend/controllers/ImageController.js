const ImageService = require('../services/ImageServices');
var jwt = require('../middlewares/validar-jwt');

const uploadImage = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false,
                    error: 'No se seleccionó ningún archivo' 
                });
            }

            const imageType = req.body.imageType || 'paciente';
            const result = await ImageService.uploadImage(req.file, imageType);

            res.status(result.status).json({
                success: true,
                message: result.message,
                data: {
                    id: result.id,
                    nombre_original: result.originalName,
                    nombre_archivo: result.fileName,
                    imageType: result.imageType,
                    path: result.path,
                    fullPath: result.fullPath
                }
            });
        } catch (error) {
            res.status(error.status || 500).json({ 
                success: false,
                error: error.message 
            });
        }
    });
};

const listImages = async (req, res) => {
    try {
        const { type } = req.params;
        const result = await ImageService.listImages(type);

        res.status(result.status).json({
            success: true,
            type: result.type,
            images: result.images,
            count: result.count
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            error: error.message 
        });
    }
};

const getImage = async (req, res) => {
    try {
        const { type, fileName } = req.params;
        const result = await ImageService.getImage(type, fileName);

        res.sendFile(result.filePath);
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            error: error.message 
        });
    }
};

const getImagesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const result = await ImageService.getImagesByType(type);

        res.status(result.status).json({
            success: true,
            type: result.type,
            data: result.images,
            count: result.count
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            error: error.message 
        });
    }
};

const deleteImage = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const { imageId } = req.params;
            const result = await ImageService.deleteImage(imageId);

            res.status(result.status).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(error.status || 500).json({ 
                success: false,
                error: error.message 
            });
        }
    });
};

const uploadCubemapTiles = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            if (!req.files || !req.files.image || !req.files.tiles || req.files.tiles.length !== 6) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Se requiere la imagen original y exactamente 6 tiles' 
                });
            }

            const originalFile = req.files.image[0];
            const tileFiles = req.files.tiles;

            const result = await ImageService.uploadCubemapTiles(originalFile, tileFiles);

            res.status(result.status).json({
                success: true,
                message: result.message,
                data: {
                    id: result.id,
                    nombre_original: result.originalName,
                    nombre_archivo: result.fileName,
                    imageType: 'escenario',
                    path: result.path
                }
            });
        } catch (error) {
            res.status(error.status || 500).json({ 
                success: false,
                error: error.message 
            });
        }
    });
};

module.exports = {
    uploadImage,
    listImages,
    getImage,
    getImagesByType,
    deleteImage,
    uploadCubemapTiles
};
