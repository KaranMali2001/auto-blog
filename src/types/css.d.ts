// Type declarations for CSS imports
declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.scss" {
  const content: string;
  export default content;
}

declare module "*.sass" {
  const content: string;
  export default content;
}

declare module "*.less" {
  const content: string;
  export default content;
}

// Specific declaration for MDX Editor styles
declare module "@mdxeditor/editor/style.css" {
  const content: string;
  export default content;
}
