/**
 * Generates a .gitignore for the scaffolded worker project.
 */
export function generateGitignore(): string {
  return `node_modules/
dist/
.dev.vars
.wrangler/
`;
}
