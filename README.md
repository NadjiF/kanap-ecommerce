# Kanap — Site e-commerce de canapés

Site e-commerce fictif permettant de consulter un catalogue de canapés,
d'en ajouter au panier, et de passer commande via un formulaire.

Base pédagogique issue du **Projet 5 — Développeur Web OpenClassrooms**,
entièrement refactorée et modernisée pour servir de projet vitrine.

---

## 🚀 Démo locale rapide

```bash
# Backend
cd back
npm install
npm start
# → API disponible sur http://localhost:3000

# Frontend (dans un autre terminal)
# Ouvrir index.html à la racine du projet avec Live Server
# → Site disponible sur http://127.0.0.1:5500 (ou port Live Server)
```

---

## ✨ Fonctionnalités

- **Catalogue** : affichage dynamique de 8 produits via API REST
- **Fiche produit** : sélection de couleur et quantité, ajout au panier
- **Panier** : stockage persistant (localStorage), modification des quantités, suppression d'items, calcul du total
- **Commande** : validation du formulaire (prénom, nom, adresse, ville, email) avec regex, envoi au backend, redirection vers page de confirmation
- **Accessibilité** : labels, aria-attributes, autocomplete sur les champs du formulaire
- **Gestion d'erreur** : états de chargement et d'erreur affichés à l'utilisateur, pas de crash silencieux

---

## 🛠️ Stack technique

**Front-end**

- HTML5 / CSS3
- JavaScript ES2022 (vanilla, pas de framework)
- Fetch API
- LocalStorage API

**Back-end**

- Node.js
- Express 4
- Helmet (sécurité HTTP)
- CORS
- UUID v11

**Outils**

- Git / GitHub

---

## 📁 Architecture
