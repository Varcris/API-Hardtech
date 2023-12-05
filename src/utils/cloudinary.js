import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLODDINARY_API_KEY,
  api_secret: process.env.CLODDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "hard-tech",
  });
};

export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};
