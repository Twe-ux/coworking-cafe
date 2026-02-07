/**
 * Global type declarations
 */

declare global {
  interface Navigator {
    /**
     * iOS standalone mode detection
     * Available on iOS Safari when app is installed on home screen
     */
    standalone?: boolean
  }
}

export {}
