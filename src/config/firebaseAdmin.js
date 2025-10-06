import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, '../../tender-eaucation-firebase-adminsdk-x2ops-af0615bcf2.json'), 'utf-8')
);

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "tender-eaucation.appspot.com",
});

const bucket = getStorage().bucket();
export { bucket };



