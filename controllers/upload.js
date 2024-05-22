const cloudinary = require("cloudinary").v2; // Use v2 directly
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

exports.uploadImages = async (req, res) => {
  try {
    const { path } = req.body;
    let files = Object.values(req.files).flat();
    let images = [];

    for (const file of files) {
      const url = await uploadToCloudinary(file, path);
      images.push(url);
      removeTmp(file.tempFilePath);
    }

    res.json(images);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listImages = async (req, res) => {
  const { path, sort, max } = req.body;

  cloudinary.search
    .expression(`${path}`)
    .sort_by("created_at", `${sort}`)
    .max_results(max)
    .execute()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err.error.message);
      res.status(500).json({ message: err.error.message });
    });
};

const uploadToCloudinary = async (file, folderPath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.tempFilePath,
      { folder: folderPath },
      (err, result) => {
        if (err) {
          removeTmp(file.tempFilePath);
          return resolve({ error: "Upload image failed." });
        }
        resolve({ url: result.secure_url });
      }
    );
  });
};

const removeTmp = (filePath) => {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${filePath}, ${err.message}`);
      }
    });
  });
};
