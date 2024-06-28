import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  outDir: 'lib',
  declaration: 'compatible',
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
});
