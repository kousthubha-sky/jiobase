/**
 * Generates the tsconfig.json for the scaffolded worker project.
 */
export function generateTsconfigJson(): string {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ES2022',
      moduleResolution: 'bundler',
      lib: ['ES2022'],
      types: ['@cloudflare/workers-types'],
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
    },
    include: ['src'],
  };

  return JSON.stringify(config, null, 2) + '\n';
}
