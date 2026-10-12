const API_URL = "http://localhost:3000/api/products";
const CART_KEY = "itemToCart";

// --- Panier (localStorage) -----------------------------------------------

const getCart = () => JSON.parse(localStorage.getItem(CART_KEY)) || [];
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

// --- Fetch produits ------------------------------------------------------

const fetchProductById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error(`Produit ${id} introuvable`);
  return response.json();
};

// Fetch EN PARALLÈLE au lieu de séquentiel : Promise.all
const fetchAllCartProducts = async (cart) =>
  Promise.all(cart.map((item) => fetchProductById(item.id)));

// --- Rendu ---------------------------------------------------------------

const renderEmptyCart = () => {
  document.getElementById("cart__items").innerHTML =
    `<h2 style="text-align:center; margin-bottom:80px;">Vous n'avez aucun article dans votre panier</h2>`;
  document.getElementById("totalQuantity").textContent = "0";
  document.getElementById("totalPrice").textContent = "0";
};

const createCartItemElement = (cartItem, product) => {
  const article = document.createElement("article");
  article.className = "cart__item";
  article.dataset.id = cartItem.id;
  article.dataset.color = cartItem.color;

  article.innerHTML = `
    <div class="cart__item__img">
      <img src="${product.imageUrl}" alt="${product.altTxt || product.name}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__description">
        <h2>${product.name}</h2>
        <p>${cartItem.color}</p>
        <p>${product.price} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté :</p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${cartItem.quantity}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
  `;
  return article;
};

const updateTotals = (cart, products) => {
  let totalQty = 0;
  let totalPrice = 0;
  for (const item of cart) {
    const product = products.find((p) => p._id === item.id);
    if (product) {
      totalQty += item.quantity;
      totalPrice += product.price * item.quantity;
    }
  }
  document.getElementById("totalQuantity").textContent = totalQty;
  document.getElementById("totalPrice").textContent = totalPrice;
};

// --- Interactions sur les items ------------------------------------------

const setupItemListeners = (cart, products) => {
  // Changement de quantité
  document.querySelectorAll(".itemQuantity").forEach((input) => {
    input.addEventListener("change", (event) => {
      const article = event.target.closest("article");
      const { id, color } = article.dataset;
      const newQty = parseInt(event.target.value, 10);

      if (!newQty || newQty < 1 || newQty > 100) {
        alert("La quantité doit être entre 1 et 100.");
        const existing = cart.find((i) => i.id === id && i.color === color);
        event.target.value = existing.quantity;
        return;
      }

      const item = cart.find((i) => i.id === id && i.color === color);
      if (item) {
        item.quantity = newQty;
        saveCart(cart);
        updateTotals(cart, products);
      }
    });
  });

  // Suppression (pas de reload : on retire du DOM et on met à jour)
  document.querySelectorAll(".deleteItem").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const article = event.target.closest("article");
      const { id, color } = article.dataset;

      const index = cart.findIndex((i) => i.id === id && i.color === color);
      if (index !== -1) cart.splice(index, 1);

      saveCart(cart);
      article.remove();

      if (cart.length === 0) {
        renderEmptyCart();
      } else {
        updateTotals(cart, products);
      }
    });
  });
};

// --- Validation du formulaire --------------------------------------------

const validators = {
  firstName: {
    regex: /^[A-Za-zÀ-ÿ\s-']{2,}$/,
    emptyMsg: "Votre prénom n'est pas renseigné.",
    invalidMsg: "Veuillez entrer un prénom valide.",
  },
  lastName: {
    regex: /^[A-Za-zÀ-ÿ\s-']{2,}$/,
    emptyMsg: "Votre nom n'est pas renseigné.",
    invalidMsg: "Veuillez entrer un nom valide.",
  },
  address: {
    regex: /^[0-9A-Za-zÀ-ÿ\s,.-]{5,}$/,
    emptyMsg: "L'adresse n'est pas renseignée.",
    invalidMsg: "Veuillez entrer une adresse valide.",
  },
  city: {
    regex: /^[A-Za-zÀ-ÿ\s-]{2,}$/,
    emptyMsg: "La ville n'est pas renseignée.",
    invalidMsg: "Veuillez entrer un nom de ville valide.",
  },
  email: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/,
    emptyMsg: "L'email n'est pas renseigné.",
    invalidMsg: "Veuillez entrer une adresse email valide.",
  },
};

const validateField = (fieldName) => {
  const input = document.getElementById(fieldName);
  const errorEl = document.getElementById(`${fieldName}ErrorMsg`);
  const value = input.value.trim();
  const { regex, emptyMsg, invalidMsg } = validators[fieldName];

  if (!value) {
    errorEl.textContent = emptyMsg;
    errorEl.style.color = "red";
    return null;
  }
  if (!regex.test(value)) {
    errorEl.textContent = invalidMsg;
    errorEl.style.color = "red";
    return null;
  }
  errorEl.textContent = "";
  return value;
};

const setupFormValidation = () => {
  Object.keys(validators).forEach((fieldName) => {
    const input = document.getElementById(fieldName);
    input.addEventListener("change", () => validateField(fieldName));
  });
};

// --- Soumission de la commande -------------------------------------------

const submitOrder = async (cart) => {
  const contact = {
    firstName: validateField("firstName"),
    lastName: validateField("lastName"),
    address: validateField("address"),
    city: validateField("city"),
    email: validateField("email"),
  };

  if (Object.values(contact).some((v) => v === null)) {
    alert("Veuillez remplir correctement tous les champs du formulaire.");
    return;
  }

  const orderData = {
    contact,
    products: cart.map((item) => item.id),
  };

  try {
    const response = await fetch(`${API_URL}/order`, {
      method: "POST",
      body: JSON.stringify(orderData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status} lors de la commande`);
    }

    const data = await response.json();
    window.location.href = `confirmation.html?id=${data.orderId}`;
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'envoi de la commande. Veuillez réessayer.");
  }
};

// --- Point d'entrée ------------------------------------------------------

const init = async () => {
  const cart = getCart();
  const container = document.getElementById("cart__items");

  if (cart.length === 0) {
    renderEmptyCart();
    return;
  }

  try {
    const products = await fetchAllCartProducts(cart);

    const fragment = document.createDocumentFragment();
    cart.forEach((item) => {
      const product = products.find((p) => p._id === item.id);
      if (product) fragment.appendChild(createCartItemElement(item, product));
    });
    container.innerHTML = "";
    container.appendChild(fragment);

    updateTotals(cart, products);
    setupItemListeners(cart, products);
    setupFormValidation();

    document.getElementById("order").addEventListener("click", (event) => {
      event.preventDefault();
      submitOrder(cart);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="error">Impossible de charger votre panier. Veuillez réessayer plus tard.</p>';
  }
};

init();
