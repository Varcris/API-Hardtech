import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import fse from "fs-extra";

/*

req.files =  {
  images: [
    {
      name: '691120-MLA71288148000_082023-F.jpg',
      data: <Buffer >,
      size: 296451,
      encoding: '7bit',
      tempFilePath: 'uploads\\tmp-2-1701773698000',
      truncated: false,
      mimetype: 'image/jpeg',
      md5: 'b7b01d50520ed9cf7ff543c156a07364',
      mv: [Function: mv]
    },{...},{...}
  ]
}

req.body = {
  title: 'Notebook Argon',
  description: 'laptop gamer',
  price: '3200',
  discountPorcentage: '10',
  rating: '4.8',
  stock: '85',
  brand: 'Asus',
  category: 'laptops'
}

upLoadImage return = {
  asset_id: 'af9cba723497360a4edcb1697e262805',
  public_id: 'hard-tech/cijqvhjvx3easp7dmim2',
  version: 1701777923,
  version_id: '449d48a84a13d8c4c614e1db6d2125e6',
  signature: 'e7086170b9ebcb759f82f92d1ba3c378e081fa38',
  width: 800,
  height: 800,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2023-12-05T12:05:23Z',
  tags: [],
  bytes: 49319,
  type: 'upload',
  etag: 'ca0ac7825beaddf2c5add341b16e4a82',
  placeholder: false,
  url: 'http://res.cloudinary.com/varcris/image/upload/v1701777923/hard-tech/cijqvhjvx3easp7dmim2.jpg',
  secure_url: 'https://res.cloudinary.com/varcris/image/upload/v1701777923/hard-tech/cijqvhjvx3easp7dmim2.jpg',
  folder: 'hard-tech',
  original_filename: 'tmp-1-1701777921346',
  api_key: '974644213337541'
}
*/

export const uploadCloudinary = async (req, res, next) => {
  console.log("Middleware uploadCloudinary");
  console.log(req.body ? "Body received" : "No body");
  try {
    if (req.files?.images) {
      console.log("Images received");
      const images = !Array.isArray(req.files.images)
        ? [req.files.images]
        : req.files.images;
      let imagesCloudinary = [];
      console.log("Uploading images to Cloudinary");
      for (const image of images) {
        const { secure_url, public_id } = await uploadImage(image.tempFilePath);
        imagesCloudinary.push({ public_id: public_id, image_url: secure_url });
      }
      console.log("Deleting images from server");
      for (const image of images) {
        await fse.unlink(image.tempFilePath);
      }
      req.body.images = imagesCloudinary;
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
