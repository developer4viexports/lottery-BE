// src/middleware/upload.js
import multer from 'multer';
import path from 'path';

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|mp4|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, gif), PDFs, and videos (mp4, mov) are allowed!'));
    }
};

const upload = multer({
    storage: multer.memoryStorage(), // ⬅️ Storing in memory for Firebase direct upload
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit ✅
    }
});

export default upload;
