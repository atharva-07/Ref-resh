import multer from "multer";

const ALLOWED_MIME_TYPES: Map<string, string> = new Map([
  ["image/jpg", "jpg"],
  ["image/jpeg", "jpeg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_FILE_SIZE_IN_BYTES = 5 * 10124 * 1024;

const imageUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 4,
    fileSize: MAX_FILE_SIZE_IN_BYTES,
  },
  fileFilter(req, file, callback) {
    const validMimeType = ALLOWED_MIME_TYPES.get(file.mimetype);
    if (!validMimeType) {
      callback(new Error("Invalid Mime Type."));
    } else {
      callback(null, true);
    }
  },
});

export default imageUploadMiddleware;
