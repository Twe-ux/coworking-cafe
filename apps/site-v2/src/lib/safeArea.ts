/**
 * Updates iOS PWA safe-area bars to match the given hex color.
 *
 *  - meta[theme-color]     → status bar top (iOS ≤ 25)
 *  - body/html backgroundColor → status bar top (iOS 26+) + nav bar bottom (all)
 *
 * The alpha `fe` → opaque rAF trick forces iOS to repaint bars even when the
 * color is the same as the previous value (iOS caches the meta tag value).
 * Source: https://medium.com/@evkirkiles/coloring-the-webkit-browser-bars-28d75cd8cf7f
 */
export function applySafeAreaColor(color: string): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute("content", color + "fe") // trigger repaint
    requestAnimationFrame(() => meta.setAttribute("content", color))
  }
  document.body.style.backgroundColor = color
  document.documentElement.style.backgroundColor = color
}
