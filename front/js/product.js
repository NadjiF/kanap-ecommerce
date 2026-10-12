const API_URL = "http://localhost:3000/api/products";
const CART_KEY = "itemToCart";

// --- Récupération du produit ---------------------------------------------

const getProductIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const fetchProduct = async (productId) => {
  const response = await fetch(`${API_URL}/${productId}`);
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} lors du chargement du produit`);
  }
  return response.json();
};

// --- Affichage du produit ------------------------------------------------

const renderProduct = (product) => {
  // Titre de la page
  document.title = `${product.name} — Kanap`;

  // Image
  const imageContainer = document.querySelector(".item__img");
  const img = document.createElement("img");
  img.src = product.imageUrl;
  img.alt = product.altTxt || product.name;
  imageContainer.innerHTML = "";
  imageContainer.appendChild(img);

  // Infos texte
  document.getElementById("title").textContent = product.name;
  document.getElementById("price").textContent = product.price;
  document.getElementById("description").textContent = product.description;

  // Options de couleur
  const colorSelect = document.getElementById("colors");
  product.colors.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorSelect.appendChild(option);
  });
};

// --- Ajout au panier -----------------------------------------------------

const addToCart = (product) => {
  const color = document.getElementById("colors").value;
  const quantity = parseInt(document.getElementById("quantity").value, 10);

  // Validation côté client
  if (!color) {
    alert("Veuillez choisir une couleur.");
    return;
  }
  if (!quantity || quantity < 1 || quantity > 100) {
    alert("Veuillez choisir une quantité entre 1 et 100.");
    return;
  }

  const newItem = {
    id: product._id,
    name: product.name,
    img: product.imageUrl,
    alt: product.altTxt,
    price: product.price, // ✅ Fix : le prix est stocké pour pouvoir calculer le total
    color,
    quantity,
  };

  // Récupération du panier existant
  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  // Si un item avec même id+couleur existe déjà, on cumule les quantités
  const existingItem = cart.find(
    (item) => item.id === newItem.id && item.color === newItem.color,
  );
  if (existingItem) {
    existingItem.quantity = Math.min(
      existingItem.quantity + newItem.quantity,
      100,
    );
  } else {
    cart.push(newItem);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  alert("Produit ajouté au panier !");
};

// --- Initialisation ------------------------------------------------------

const init = async () => {
  const productId = getProductIdFromUrl();

  if (!productId) {
    document.querySelector(".item__content").innerHTML =
      '<p class="error">Produit introuvable (identifiant manquant dans l\'URL).</p>';
    return;
  }

  try {
    const product = await fetchProduct(productId);
    renderProduct(product);

    // Le listener n'est posé qu'APRÈS le chargement du produit : plus de race condition
    document
      .getElementById("addToCart")
      .addEventListener("click", () => addToCart(product));
  } catch (error) {
    console.error(error);
    document.querySelector(".item__content").innerHTML =
      '<p class="error">Impossible de charger ce produit. Veuillez réessayer plus tard.</p>';
  }
};

init();
