/**
 * Process uploaded files from multer diskStorage and return their URLs
 * @param {Object} file - File object from multer (with filename and path)
 * @param {string} key - Field name used to upload (e.g., 'purchaseProof', 'followProof')
 * @returns {Promise<{ key: string, url: string }>}
 */
export const processLocalFile = async (file, key) => {
    // Return the local file URL path
    const fileUrl = `/uploads/${file.filename}`;
    return { key, url: fileUrl };
};

/**
 * Process one or more files from multer (any/fields) and return local URLs
 * @param {Array|Object} files - req.files from multer.any() or multer.fields()
 * @returns {Promise<Array<{ key: string, url: string }>>}
 */
export const uploadFilesToFirebase = async (files) => {
    const uploadPromises = [];

    if (Array.isArray(files)) {
        // Case: multer.any() - Process all files
        for (const file of files) {
            uploadPromises.push(processLocalFile(file, file.fieldname));
        }
    } else if (typeof files === "object" && files !== null) {
        // Case: multer.fields() - Process all files
        for (const key in files) {
            const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];
            for (const file of fileArray) {
                uploadPromises.push(processLocalFile(file, key));
            }
        }
    }

    // Return all file URLs
    const uploads = await Promise.all(uploadPromises);
    return uploads;
};











