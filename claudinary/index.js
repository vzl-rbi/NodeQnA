// claudinary/index.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv"; // yo app.js ma matra import garda error aai rako thiyo

// Load environment variables FIRST
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary configured successfully");

export { cloudinary };

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "NodejsNamaskar",
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});
