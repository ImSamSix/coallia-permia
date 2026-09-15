export function ouvrirCGU(): void {
  document.getElementById("login-screen")?.classList.add("hidden");
  document.getElementById("cgu-view")?.classList.remove("hidden");
}

export function fermerCGU(): void {
  document.getElementById("cgu-view")?.classList.add("hidden");
  document.getElementById("login-screen")?.classList.remove("hidden");
}
