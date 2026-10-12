const products = require("../data/products.json");

// structuredClone (natif Node 17+) remplace le hack JSON.parse(JSON.stringify(...))
// → clone profond propre pour éviter toute mutation des données en mémoire
exports.find = async () => structuredClone(products);

exports.findById = async (id) =>
  structuredClone(products).find((product) => product._id === id);
