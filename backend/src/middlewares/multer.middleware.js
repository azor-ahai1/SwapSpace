import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

export const upload = multer({storage})

// export const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname).toLowerCase();
//         if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.webp') {
//             return cb(new Error('Only images are allowed'), false);
//         }
//         cb(null, true);
//     },
//     limits: {
//         fileSize: 5 * 1024 * 1024 // 5MB file size limit
//     }
// });