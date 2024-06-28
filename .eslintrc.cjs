/**
 * 这是一个兜底的`eslint`配置，在`precommit`阶段如果有符合`nano-staged`规则的文件，而对应的文件的包下没有配置文件，`eslint`会往上查找配置文件
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ['@huyk-utils/eslint-config-vue'],
  ignorePatterns: ['dist', 'lib', 'libs', 'temp', 'public', 'build', 'build-zips', 'template-*'],
};
