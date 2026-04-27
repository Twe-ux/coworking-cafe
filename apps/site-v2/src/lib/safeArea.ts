/**
 * Updates iOS PWA safe-area bars to match the given hex color.
 *
 *  - meta[theme-color]     → status bar top (iOS ≤ 25)
 *  - body/html backgroundColor → status bar top (iOS 26+) + nav bar bottom (all)
 *
 * @param color      Bottom safe-area color (body/html background — home indicator zone)
 * @param topColor   Optional override for meta[theme-color] only (status bar top in browser
 *                   mode). Useful when the hero gradient top differs from the body bg, e.g.
 *                   home section: topColor=#417972 (hero green) while color=#1A1A1A (body dark).
 *                   In PWA black-translucent mode the status bar is transparent so topColor
 *                   has no visual effect — it only matters in browser mode.
 *
 * The alpha `fe` → opaque rAF trick forces iOS to repaint bars even when the
 * color is the same as the previous value (iOS caches the meta tag value).
 * Source: https://medium.com/@evkirkiles/coloring-the-webkit-browser-bars-28d75cd8cf7f
 */
export function applySafeAreaColor(color: string, topColor?: string): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const themeColor = topColor ?? color
  if (meta) {
    meta.setAttribute("content", themeColor + "fe") // trigger repaint
    requestAnimationFrame(() => meta.setAttribute("content", themeColor))
  }
  document.body.style.backgroundColor = color
  document.documentElement.style.backgroundColor = color
}
