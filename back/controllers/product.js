const { v4: uuidv4 } = require("uuid");
const Product = require("../models/Product");

// Petite utilité : construit l'URL complète de l'image à partir du nom de fichier
const buildImageUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/images/${filename}`;

// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const mapped = products.map((product) => ({
      ...product,
      imageUrl: buildImageUrl(req, product.imageUrl),
    }));
    res.status(200).json(mapped);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des produits" });
  }
};

// GET /api/products/:id
exports.getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    product.imageUrl = buildImageUrl(req, product.imageUrl);
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération du produit" });
  }
};

// POST /api/products/order
exports.orderProducts = async (req, res) => {
  try {
    const { contact, products: productIds } = req.body;

    // Validation : contact complet + liste de produits non vide
    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "email",
    ];
    const contactValid = contact && requiredFields.every((f) => contact[f]);
    const productsValid = Array.isArray(productIds) && productIds.length > 0;

    if (!contactValid || !productsValid) {
      return res
        .status(400)
        .json({ error: "Requête invalide : contact ou produits manquants" });
    }

    // Récupération parallèle de tous les produits
    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await Product.findById(id);
        if (!product) {
          throw new Error(`Produit non trouvé : ${id}`);
        }
        return { ...product, imageUrl: buildImageUrl(req, product.imageUrl) };
      }),
    );

    res.status(201).json({
      contact,
      products,
      orderId: uuidv4(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Erreur serveur lors de la commande" });
  }
};
