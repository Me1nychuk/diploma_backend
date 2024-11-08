module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json', // Вказуємо шлях до tsconfig.json
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'], // Додаємо Prettier як плагін
  extends: [
    'eslint:recommended', // Базові правила ESLint
    'plugin:@typescript-eslint/recommended', // Рекомендації для TypeScript
    'plugin:prettier/recommended', // Інтеграція Prettier з ESLint
  ],
  root: true, // Визначаємо, що цей конфіг файл є кореневим
  env: {
    node: true, // Встановлюємо середовище для Node.js
    jest: true, // Підтримка тестів Jest
    es2021: true, // Підтримка ECMAScript 2021
  },
  ignorePatterns: ['.eslintrc.js'], // Ігноруємо конфігураційний файл ESLint
  rules: {
    // Вмикаємо деякі власні правила для покращення коду
    '@typescript-eslint/interface-name-prefix': 'off', // Вимкнути вимогу префікса "I" для інтерфейсів
    '@typescript-eslint/explicit-function-return-type': 'off', // Вимкнути вимогу явно вказувати типи для функцій
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Вимкнути вимогу явно вказувати типи для меж модулів
    '@typescript-eslint/no-explicit-any': 'off', // Вимкнути заборону на використання `any` типу
    'prettier/prettier': 'error', // Потрібно, щоб Prettier працював разом з ESLint і виправляв форматування
    'no-console': 'warn', // Попередження про використання `console.log`
    'no-unused-vars': 'warn', // Попередження про невикористані змінні
    'specific-rule-name': 'off',
  },
};
