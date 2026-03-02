/**
 * Generates the package.json for the scaffolded worker project.
 * Minimal — just wrangler and workers-types as devDeps.
 */
export function generatePackageJson(workerName: string): string {
  const pkg = {
    name: workerName,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'wrangler dev',
      deploy: 'wrangler deploy',
      tail: 'wrangler tail',
    },
    devDependencies: {
      wrangler: '^3.99.0',
      '@cloudflare/workers-types': '^4.20241230.0',
      typescript: '^5.7.0',
    },
  };

  return JSON.stringify(pkg, null, 2) + '\n';
}
