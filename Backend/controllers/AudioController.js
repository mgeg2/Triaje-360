const AudioService = require('../services/AudioServices');
var jwt = require('../middlewares/validar-jwt');

const uploadAudio = async (req, res) => {
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

            const result = await AudioService.uploadAudio(req.file);

            res.status(result.status).json({
                success: true,
                message: result.message,
                data: {
                    id: result.id,
                    nombre_original: result.originalName,
                    nombre_archivo: result.fileName,
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

const listAudios = async (req, res) => {
    try {
        const result = await AudioService.listAudios();

        res.status(result.status).json({
            success: true,
            audios: result.audios,
            count: result.count
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            error: error.message 
        });
    }
};

const getAudio = async (req, res) => {
    try {
        const { fileName } = req.params;
        const result = await AudioService.getAudio(fileName);

        res.sendFile(result.filePath);
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            error: error.message 
        });
    }
};

const getAllAudios = async (req, res) => {
    try {
        const result = await AudioService.getAllAudios();

        res.status(result.status).json({
            success: true,
            data: result.audios,
            count: result.count
        });
    } catch (error) {
        res.status(error.status || 500).json({ 
            success: false,
            error: error.message 
        });
    }
};

const deleteAudio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const { audioId } = req.params;
            const result = await AudioService.deleteAudio(audioId);

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

module.exports = {
    uploadAudio,
    listAudios,
    getAudio,
    getAllAudios,
    deleteAudio
};
