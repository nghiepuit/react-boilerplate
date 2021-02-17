export default () => {
  return {
    modulesAlias: {
      '@app': './src',
    },
    jestConfig: {
      moduleNameMapper: {},
      sassModuleNameMapper: {},
    },
    importAlias: [
      {
        libraryName: 'lodash-es',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      {
        libraryName: 'recompose',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
    ],
  };
};
