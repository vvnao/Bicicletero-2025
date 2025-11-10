import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración del almacenamiento con carpetas separadas
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Convertimos el nombre a minúsculas por seguridad
        const field = file.fieldname.toLowerCase();
        let folder = "others";

        if (field === "tnephoto") folder = "tne";
        else if (field === "photo" || field === "bicyclephoto") folder = "bicycle";

        const uploadPath = path.join("./src/uploads", folder);

        // Crear carpeta si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    },
});

// Filtro de tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos PDF, JPG o PNG"), false);
    }
};

// Configuración principal de multer
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});

// Middleware para subir ambos archivos
export const uploadDocuments = upload.fields([
    { name: "tnePhoto", maxCount: 1 },
    { name: "photo", maxCount: 1 }, // foto de la bicicleta
]);

// Middleware de manejo de errores
export const handleFileSizeLimit = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "El archivo excede el límite de 5MB" });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};
