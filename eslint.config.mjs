import antfu from '@antfu/eslint-config'

export default antfu(
  {
    react: true,
    typescript: true,
  },
  {
    rules: {
      'ts/no-require-imports': 'off',
      'style/semi': ['error', 'never'],
      'react-hooks/exhaustive-deps': 'off',
      'ts/no-use-before-define': 'off',
    },
  },
)
