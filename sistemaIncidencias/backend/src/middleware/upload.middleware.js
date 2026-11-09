import multer from 'multer';

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];

        if (!tiposPermitidos.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido'));
        }

        cb(null, true);
    }
});
