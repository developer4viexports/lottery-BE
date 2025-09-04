import { bucket } from "../config/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a single file (from multer memoryStorage) to Firebase and return its public URL.
 * @param {Object} file - File object from multer (with buffer)
 * @param {string} key - Field name used to upload (e.g., 'aadhar', 'pan')
 * @returns {Promise<{ key: string, url: string }>}
 */
export const uploadToFirebase = async (file, key) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    const destination = `uploads/${uniqueName}`;

    // Upload the file buffer directly to Firebase Storage
    const fileUpload = bucket.file(destination).createWriteStream({
        metadata: {
            contentType: file.mimetype,
            metadata: {
                firebaseStorageDownloadTokens: uuidv4(),
            },
        },
    });

    // Pipe the buffer into the upload stream
    fileUpload.end(file.buffer);

    // Wait for the upload to finish with timeout
    await new Promise((resolve, reject) => {
        // Set timeout for uploads (30 seconds)
        const timeout = setTimeout(() => {
            reject(new Error(`Upload timeout for file: ${file.originalname}`));
        }, 30000);

        fileUpload.on("finish", () => {
            clearTimeout(timeout);
            resolve();
        });
        
        fileUpload.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });

    // Generate the public URL after the file is uploaded
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name
        }/o/${encodeURIComponent(destination)}?alt=media`;

    return { key, url: fileUrl };
};

/**
 * Reusable service to upload one or more files from multer (any/fields) to Firebase
 * @param {Array|Object} files - req.files from multer.any() or multer.fields()
 * @returns {Promise<Array<{ key: string, url: string }>>}
 */
export const uploadFilesToFirebase = async (files) => {
    const uploadPromises = [];

    if (Array.isArray(files)) {
        // Case: multer.any() - Upload all files in parallel
        for (const file of files) {
            uploadPromises.push(uploadToFirebase(file, file.fieldname));
        }
    } else if (typeof files === "object" && files !== null) {
        // Case: multer.fields() - Upload all files in parallel
        for (const key in files) {
            const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];
            for (const file of fileArray) {
                uploadPromises.push(uploadToFirebase(file, key));
            }
        }
    }

    // Wait for all uploads to complete in parallel
    const uploads = await Promise.all(uploadPromises);
    return uploads;
};











