import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { AppDataSource, connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";
import cors from "cors";
import { createDefaultUsers } from "./config/defaultUsers.js";
import path from "path";
import { fileURLToPath } from "url";


const app = express();
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Ruta principal de bienvenida
app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});
// Inicializa la conexión a la base de datos
connectDB()
  .then(async () => {
    console.log("Conexión a la base de datos establecida");
    //Crear admin y guardia por defecto
    await createDefaultUsers();
    // Carga todas las rutas de la aplicación
    routerApi(app);

    // Levanta el servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });
