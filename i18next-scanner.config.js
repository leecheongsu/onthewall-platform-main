const path = require('path');
const typescriptTransform = require('i18next-scanner-typescript');
const COMMON_EXTENSIONS = '/**/*.{js,jsx,ts,tsx,html}';

module.exports = {
  input: [`app/${COMMON_EXTENSIONS}`, `components/${COMMON_EXTENSIONS}`],
  options: {
    defaultLng: 'en-US',
    debug: false,
    lngs: ['ko-KR', 'en-US', 'ja-JP'],
    func: {
      list: ['i18next.t', 'i18n.t', '$i18n.t', 'i18nextScanKey', 't'],
      extensions: ['.ts', '.tsx', '.html'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      fallbackKey: function (ns, value) {
        return value;
      },
    },
    resource: {
      loadPath: path.join(__dirname, './locales/{{lng}}/{{ns}}.json'),
      savePath: path.join(__dirname, './locales/{{lng}}/{{ns}}.json'),
    },
    defaultValue(lng, ns, key) {
      const keyAsDefaultValue = ['en-US'];
      const separator = 'html';
      const value = key.includes(separator) ? '' : key;
      return keyAsDefaultValue.includes(lng) ? value : '';
    },
    keySeparator: false,
    nsSeparator: false,
  },
  transform: typescriptTransform({
    tsOptions: {
      target: 'es2018',
    },
    extensions: ['.tsx', '.ts'],
  }),
  error: (error, file) => {
    console.warn(`i18next-scanner: Unable to parse code in ${file.relative}. Error: ${error.message}`);
  },
};
