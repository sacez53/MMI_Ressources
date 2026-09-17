document.addEventListener("DOMContentLoaded", () => {
  // --- GESTION DU VOLET LATÉRAL (DRAWER) DES CATÉGORIES ---
  const drawer = document.getElementById("category-drawer");
  const drawerOverlay = document.getElementById("category-drawer-overlay");
  const closeDrawerBtn = document.getElementById("close-drawer-btn");
  const openDrawerBtn = document.getElementById("open-drawer-btn");
  const categorySearch = document.getElementById("category-search");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    if (drawerOverlay) {
      drawerOverlay.classList.add("active");
      drawerOverlay.setAttribute("aria-hidden", "false");
    }
    if (openDrawerBtn) openDrawerBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");

    // Donner le focus à la recherche de catégories
    if (categorySearch) {
      setTimeout(() => categorySearch.focus(), 150);
    }
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (drawerOverlay) {
      drawerOverlay.classList.remove("active");
      drawerOverlay.setAttribute("aria-hidden", "true");
    }
    if (openDrawerBtn) openDrawerBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");

    // Réinitialiser la recherche de catégories
    if (categorySearch) {
      categorySearch.value = "";
      const categoryBar = document.getElementById("category-bar");
      if (categoryBar) {
        const buttons = categoryBar.querySelectorAll(".filter-btn");
        buttons.forEach((btn) => (btn.style.display = ""));
        const emptyNotice = categoryBar.querySelector(".no-category-match");
        if (emptyNotice) emptyNotice.remove();
      }
    }
  }

  if (openDrawerBtn) openDrawerBtn.addEventListener("click", openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer && drawer.classList.contains("open")) {
      closeDrawer();
    }
  });

  // --- GESTION DES PARAMÈTRES ---
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");
  const toggleDescriptions = document.getElementById("toggle-descriptions");

  if (settingsBtn && settingsModal && closeSettings) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("show");
    });

    closeSettings.addEventListener("click", () => {
      settingsModal.classList.remove("show");
    });

    window.addEventListener("click", (event) => {
      if (event.target === settingsModal) {
        settingsModal.classList.remove("show");
      }
    });
  }

  // --- GESTION DE LA MODALE DE CONFIRMATION ---
  const confirmModal = document.getElementById("confirm-modal");
  const closeConfirm = document.getElementById("close-confirm");
  const btnCancelLink = document.getElementById("btn-cancel-link");
  const btnConfirmLink = document.getElementById("btn-confirm-link");
  let currentUrlToOpen = "";

  if (confirmModal && closeConfirm && btnCancelLink && btnConfirmLink) {
    const hideConfirmModal = () => confirmModal.classList.remove("show");

    closeConfirm.addEventListener("click", hideConfirmModal);
    btnCancelLink.addEventListener("click", hideConfirmModal);

    btnConfirmLink.addEventListener("click", () => {
      if (currentUrlToOpen) {
        window.open(currentUrlToOpen, "_blank");
        hideConfirmModal();
      }
    });

    window.addEventListener("click", (event) => {
      if (event.target === confirmModal) {
        hideConfirmModal();
      }
    });
  }

  // Charger les préférences enregistrées
  if (localStorage.getItem("hideDescriptions") === "true") {
    document.body.classList.add("hide-descriptions");
    if (toggleDescriptions) toggleDescriptions.checked = true;
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

  // Charger les ressources depuis le fichier data.json
  fetch("./data/data.json")
    .then((response) => {
      if (!response.ok) throw new Error("Impossible de charger le fichier JSON");
      return response.json();
    })
    .then((data) => {
      initialiserSite(data, closeDrawer);
    })
    .catch((error) => {
      console.error(error);
      const grid = document.getElementById("resource-grid");
      if (grid) {
        grid.innerHTML =
          "<p style='color:red; font-weight: bold;'>Erreur : Impossible de charger les liens.</p>";
      }
    });
});

// Formatage soigné des labels de catégories pour l'affichage
function formatCategoryLabel(slug) {
  if (!slug || slug === "tous") return "Toutes les ressources";
  const customMap = {
    icon: "Icônes",
    Tandences: "Tendances",
    Image_libre_de_droit: "Images libres de droits",
    tuto_masterclass_workshop: "Tutos & Masterclasses",
    Charte_graphique: "Chartes graphiques",
    Histoire_du_design: "Histoire du design",
    Portfolio_etudiant: "Portfolios étudiants",
    Photographe: "Photographes",
  };
  return customMap[slug] || slug.replace(/_/g, " ");
}

function initialiserSite(liens, closeDrawerCallback) {
  const grid = document.getElementById("resource-grid");
  const categoryBar = document.getElementById("category-bar");
  const currentFilterName = document.getElementById("current-filter-name");
  const resetFilterBtn = document.getElementById("reset-filter-btn");
  const drawerResetBtn = document.getElementById("drawer-reset-btn");
  const resourceCount = document.getElementById("resource-count");
  const categorySearch = document.getElementById("category-search");

  // Calcul du nombre de ressources par catégorie
  const counts = {};
  liens.forEach((lien) => {
    const cat = lien.Categorie;
    counts[cat] = (counts[cat] || 0) + 1;
  });
  counts["tous"] = liens.length;

  // Extraction et tri alphabétique selon le nom affiché
  const categoriesExistantes = [
    ...new Set(liens.map((lien) => lien.Categorie)),
  ].sort((a, b) =>
    formatCategoryLabel(a).localeCompare(formatCategoryLabel(b), "fr")
  );

  // Mélange aléatoire des liens (Fisher-Yates)
  for (let i = liens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liens[i], liens[j]] = [liens[j], liens[i]];
  }

  // Construction de la liste des catégories dans le drawer
  if (categoryBar) {
    categoryBar.innerHTML = "";
    const toutesCategories = ["tous", ...categoriesExistantes];

    toutesCategories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (cat === "tous" ? " active" : "");
      btn.setAttribute("data-filter", cat);

      const nameSpan = document.createElement("span");
      nameSpan.className = "category-name";
      nameSpan.textContent = formatCategoryLabel(cat);

      const countSpan = document.createElement("span");
      countSpan.className = "category-count";
      countSpan.textContent = counts[cat] || 0;

      btn.appendChild(nameSpan);
      btn.appendChild(countSpan);
      categoryBar.appendChild(btn);
    });

    // Écouteur pour la recherche rapide dans les catégories
    if (categorySearch) {
      categorySearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const buttons = categoryBar.querySelectorAll(".filter-btn");
        let hasMatch = false;

        buttons.forEach((btn) => {
          const label =
            btn.querySelector(".category-name")?.textContent.toLowerCase() || "";
          if (!query || label.includes(query)) {
            btn.style.display = "";
            hasMatch = true;
          } else {
            btn.style.display = "none";
          }
        });

        let emptyNotice = categoryBar.querySelector(".no-category-match");
        if (!hasMatch) {
          if (!emptyNotice) {
            emptyNotice = document.createElement("p");
            emptyNotice.className = "no-category-match";
            emptyNotice.textContent = "Aucune catégorie trouvée.";
            categoryBar.appendChild(emptyNotice);
          }
        } else if (emptyNotice) {
          emptyNotice.remove();
        }
      });
    }

    // Gestion du clic sur une catégorie (Sélection unique)
    categoryBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      const selectedCategory = btn.getAttribute("data-filter");
      appliquerFiltre(selectedCategory);
      if (typeof closeDrawerCallback === "function") {
        closeDrawerCallback();
      }
    });
  }

  // --- FONCTION D'AFFICHAGE DES CARTES ---
  function afficherCartes(categorieFiltre) {
    if (!grid) return 0;
    grid.innerHTML = "";

    const cartesFiltrees = liens.filter(
      (lien) => categorieFiltre === "tous" || lien.Categorie === categorieFiltre
    );

    if (cartesFiltrees.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-title">Aucune ressource trouvée</p>
          <p class="empty-state-desc">Aucune ressource ne correspond à cette catégorie pour le moment.</p>
        </div>
      `;
      return 0;
    }

    cartesFiltrees.forEach((lien) => {
      const a = document.createElement("a");
      a.href = lien.Lien;
      a.className = "resource-card";
      a.target = "_blank";
      a.title = lien.Descripton || "Aucune description fournie.";

      a.addEventListener("click", (e) => {
        e.preventDefault();
        const confirmSiteName = document.getElementById("confirm-site-name");
        if (confirmSiteName) {
          confirmSiteName.textContent = lien.Nom;
        }
        const confirmModal = document.getElementById("confirm-modal");
        if (confirmModal) {
          confirmModal.classList.add("show");
        }
        const btnConfirmLink = document.getElementById("btn-confirm-link");
        if (btnConfirmLink) {
          btnConfirmLink.onclick = () => {
            window.open(lien.Lien, "_blank");
            confirmModal.classList.remove("show");
          };
        }
      });

      // Bulle de Catégorie
      const badge = document.createElement("span");
      badge.className = "card-category";
      badge.textContent = formatCategoryLabel(lien.Categorie);

      // En-tête de la carte (titre + icône flèche)
      const headerContainer = document.createElement("div");
      headerContainer.className = "card-header";

      const h2 = document.createElement("h2");
      h2.className = "card-title";
      h2.textContent = lien.Nom;
      headerContainer.appendChild(h2);

      const svgIconStr = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" class="card-arrow-icon"><path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z"/></svg>`;
      headerContainer.insertAdjacentHTML("beforeend", svgIconStr);

      // Description
      const p = document.createElement("p");
      p.className = "card-description";
      p.textContent = lien.Descripton || "Aucune description fournie.";

      // Conteneur de Tags
      const tagsContainer = document.createElement("div");
      tagsContainer.className = "card-tags";
      if (lien.Tags && lien.Tags.length > 0) {
        lien.Tags.forEach((tagText) => {
          const tag = document.createElement("span");
          tag.className = "card-tag";
          tag.textContent = "#" + tagText;
          tagsContainer.appendChild(tag);
        });
      }

      a.appendChild(headerContainer);
      if (lien.Tags && lien.Tags.length > 0) {
        a.appendChild(tagsContainer);
      }
      a.appendChild(p);
      a.appendChild(badge);

      grid.appendChild(a);
    });

    return cartesFiltrees.length;
  }

  // --- APPLICATION D'UN FILTRE ---
  function appliquerFiltre(cat) {
    if (categoryBar) {
      const buttons = categoryBar.querySelectorAll(".filter-btn");
      buttons.forEach((btn) => {
        if (btn.getAttribute("data-filter") === cat) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    const label = formatCategoryLabel(cat);
    if (currentFilterName) {
      currentFilterName.textContent = label;
    }

    if (resetFilterBtn) {
      resetFilterBtn.hidden = cat === "tous";
    }

    const totalAffiche = afficherCartes(cat);
    if (resourceCount) {
      resourceCount.textContent = `${totalAffiche} ${
        totalAffiche > 1 ? "ressources" : "ressource"
      }`;
    }
  }

  // Boutons de réinitialisation
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener("click", () => {
      appliquerFiltre("tous");
    });
  }

  if (drawerResetBtn) {
    drawerResetBtn.addEventListener("click", () => {
      appliquerFiltre("tous");
      if (typeof closeDrawerCallback === "function") {
        closeDrawerCallback();
      }
    });
  }

  // Initialisation avec toutes les ressources
  appliquerFiltre("tous");
}
