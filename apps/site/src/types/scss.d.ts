// Type declarations for SCSS module imports
// Required for dynamic import() of .scss files in DeferredStyles component
declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
