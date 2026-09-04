document.addEventListener("DOMContentLoaded", () => {
  // Gestion du menu latéral
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const categoryBar = document.getElementById("category-bar");

  if (sidebarToggle && categoryBar) {
    sidebarToggle.addEventListener("click", () => {
      categoryBar.classList.toggle("closed");
    });
  }

  // --- GESTION DES PARAMÈTRES ---
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");

  const toggleDarkMode = document.getElementById("toggle-dark-mode");
  const toggleDescriptions = document.getElementById("toggle-descriptions");

  // Ouvrir/Fermer la modale
  if (settingsBtn && settingsModal && closeSettings) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("show");
    });

    closeSettings.addEventListener("click", () => {
      settingsModal.classList.remove("show");
    });

    // Fermer en cliquant en dehors
    window.addEventListener("click", (event) => {
      if (event.target === settingsModal) {
        settingsModal.classList.remove("show");
      }
    });
  }

  // Charger les paramètres enregistrés
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    if (toggleDarkMode) toggleDarkMode.checked = true;
  }

  if (localStorage.getItem("hideDescriptions") === "true") {
    document.body.classList.add("hide-descriptions");
    if (toggleDescriptions) toggleDescriptions.checked = true;
  }

  // Écouteurs pour les toggles
  if (toggleDarkMode) {
    toggleDarkMode.addEventListener("change", (e) => {
      if (e.target.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "true");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "false");
      }
    });
  }

  if (toggleDescriptions) {
    toggleDescriptions.addEventListener("change", (e) => {
      if (e.target.checked) {
        document.body.classList.add("hide-descriptions");
        localStorage.setItem("hideDescriptions", "true");
      } else {
        document.body.classList.remove("hide-descriptions");
        localStorage.setItem("hideDescriptions", "false");
      }
    });
  }

  // 1. On va chercher le fichier liens.json
  fetch("./data/data.json")
    .then((response) => {
      if (!response.ok)
        throw new Error("Impossible de charger le fichier JSON");
      return response.json();
    })
    .then((data) => {
      initialiserSite(data);
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("resource-grid").innerHTML =
        "<p style='color:red;'>Erreur : Impossible de charger les liens.</p>";
    });
});

function initialiserSite(liens) {
  const grid = document.getElementById("resource-grid");
  const nav = document.getElementById("category-bar");

  // --- CRÉATION DES CATÉGORIES DYNAMIQUES ---
  // On extrait toutes les catégories existantes et on supprime les doublons
  const categoriesExistantes = [
    ...new Set(liens.map((lien) => lien.Categorie)),
  ];

  // On ajoute toujours le bouton "Tous" en premier
  const toutesCategories = ["tous", ...categoriesExistantes];

  toutesCategories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.classList.add("filter-btn");
    if (cat === "tous") btn.classList.add("active"); // "Tous" est actif par défaut
    btn.setAttribute("data-filter", cat);
    btn.textContent = cat;
    nav.appendChild(btn);
  });

  // --- FONCTION POUR AFFICHER LES CARTES ---
  function afficherCartes(categorieFiltre) {
    const grid = document.getElementById("resource-grid");
    grid.innerHTML = ""; // On vide la grille avant de la reremplir

    liens.forEach((lien) => {
      // Si on demande "tous" ou si la catégorie correspond au filtre
      if (categorieFiltre === "tous" || lien.Categorie === categorieFiltre) {
        // Création du lien (<a>)
        const a = document.createElement("a");
        a.href = lien.Lien;
        a.className = "resource-card";
        a.target = "_blank";

        // Création de la bulle de Catégorie (<span>)
        const badge = document.createElement("span");
        badge.className = "card-category";
        badge.textContent = lien.Categorie;

        // Création du Titre (<h2>)
        const h2 = document.createElement("h2");
        h2.className = "card-title";
        h2.textContent = lien.Nom;

        // Création de la Description (<p>)
        const p = document.createElement("p");
        p.className = "card-description";
        p.textContent = lien.Descripton || "Aucune description fournie.";

        // On assemble le tout : Titre -> Description -> Badge
        a.appendChild(h2);
        a.appendChild(p);
        a.appendChild(badge);

        grid.appendChild(a);
      }
    });
  }

  // On affiche toutes les cartes au premier chargement
  afficherCartes("tous");

  // --- GESTION DU CLIC SUR LES FILTRES ---
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Met à jour les couleurs des boutons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Récupère la catégorie cliquée et met à jour l'affichage
      const selectedCategory = button.getAttribute("data-filter");
      afficherCartes(selectedCategory);
    });
  });
}
