import multer from "multer";

// 1. setup multer

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
