export type SkeletonType = "card" | "timeline";

/** Skeleton screens (effet Google/YouTube) : squelettes de chargement animés. */
export function injecterSkeleton(containerId: string, type: SkeletonType = "card", count = 3): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '<div class="skeleton-wrapper">';
  for (let i = 0; i < count; i++) {
    if (type === "card") {
      // Fausse carte Matériel / Frigo
      html += `
            <div class="skeleton-card">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-text short"></div>
            </div>`;
    } else if (type === "timeline") {
      // Fausse carte Timeline (avec le trait sur le côté)
      html += `
            <div class="skeleton-card" style="border-radius: 18px; margin-left: 15px; padding: 15px;">
                <div class="skeleton-block skeleton-text short" style="margin-bottom: 15px; height: 12px; width: 30%;"></div>
                <div class="skeleton-block skeleton-title" style="width: 70%;"></div>
                <div class="skeleton-block skeleton-text"></div>
            </div>`;
    }
  }
  html += "</div>";
  container.innerHTML = html;
}
