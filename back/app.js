const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");

const productRoutes = require("./routes/product");

const app = express();

// Sécurité : headers HTTP par défaut
app.use(
  helmet({
    crossOriginResourcePolicy: false, // laisse passer les images servies depuis /images
  }),
);

// CORS (plus propre que setHeader à la main)
app.use(cors());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (images)
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes API
app.use("/api/products", productRoutes);

// 404 pour toute route non trouvée
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Error handler global (en dernier)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

module.exports = app;
