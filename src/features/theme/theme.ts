const THEME_STORAGE_KEY = "coallia_theme";

export function toggleThemeAnimated(): void {
  const icon = document.getElementById("theme-icon");
  const text = document.getElementById("theme-text");

  // 1. Petite vibration et animation de disparition (ça tourne et ça rétrécit)
  if (navigator.vibrate) navigator.vibrate(50);
  if (icon) icon.style.transform = "rotate(-160deg) scale(0.15)";

  // 2. On attend la moitié de l'animation pour changer les couleurs et le texte
  setTimeout(() => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");

    if (icon && text) {
      icon.innerText = isDark ? "☀️" : "🌙";
      text.innerText = isDark ? "Passer au Mode Clair" : "Passer au Mode Sombre";

      // 3. Animation d'apparition (ça tourne dans l'autre sens et reprend sa taille)
      icon.style.transform = "rotate(200deg) scale(1)";
      setTimeout(() => {
        icon.style.transform = "rotate(0deg) scale(1)";
      }, 380);
    }
  }, 150); // Le timing correspond à la moitié de la transition (0.3s) du CSS
}

export function initTheme(): void {
  const isDark = localStorage.getItem(THEME_STORAGE_KEY) === "dark";
  if (isDark) {
    document.body.classList.add("dark-mode");
  }

  // Mise à jour de l'icône et du texte du menu au lancement de l'appli
  const icon = document.getElementById("theme-icon");
  const text = document.getElementById("theme-text");
  if (icon && text) {
    icon.innerText = isDark ? "☀️" : "🌙";
    text.innerText = isDark ? "Passer au Mode Clair" : "Passer au Mode Sombre";
  }
}
