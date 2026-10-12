// URL de l'API (à centraliser dans un config.js plus tard si on en ajoute)
const API_URL = "http://localhost:3000/api/products";

// Récupère les produits depuis l'API
const fetchProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(
      `Erreur ${response.status} lors de la récupération des produits`,
    );
  }
  return response.json();
};

// Construit la card HTML d'un seul produit
// On passe par createElement pour éviter tout risque XSS si un contenu
// de l'API venait un jour à contenir du HTML
const buildProductCard = (product) => {
  const link = document.createElement("a");
  link.href = `front/html/product.html?id=${product._id}`;

  const article = document.createElement("article");
  article.classList.add("card");

  const img = document.createElement("img");
  img.src = product.imageUrl;
  img.alt = product.altTxt || product.name;

  const h3 = document.createElement("h3");
  h3.classList.add("productName");
  h3.textContent = product.name;

  const p = document.createElement("p");
  p.classList.add("productDescription");
  p.textContent = product.description;

  article.append(img, h3, p);
  link.appendChild(article);
  return link;
};

// Point d'entrée : fetch + affichage, avec gestion d'erreur
const displayProducts = async () => {
  const container = document.getElementById("items");
  if (!container) {
    console.error("Section #items introuvable dans le DOM");
    return;
  }

  // État de chargement
  container.innerHTML = '<p class="loading">Chargement des produits…</p>';

  try {
    const products = await fetchProducts();
    container.innerHTML = ""; // vide le "Chargement…"
    const cards = products.map(buildProductCard);
    container.append(...cards);
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <p class="error">
        Impossible de charger les produits pour le moment.
        Veuillez réessayer plus tard.
      </p>
    `;
  }
};

displayProducts();
