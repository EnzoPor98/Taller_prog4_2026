import multer from 'multer';

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        const nombre = file.originalname
        cb(null, nombre);
    }
});

export const upload = multer({
    storage
});