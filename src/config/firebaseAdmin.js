import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };
initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "tender-eaucation.appspot.com",
});
const bucket = getStorage().bucket();
export { bucket };



