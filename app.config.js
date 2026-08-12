module.exports = ({ config }) => {
  const isDevelopment = process.env.APP_VARIANT === 'development';

  return {
    ...config,
    name: isDevelopment ? 'KhanovMath Dev' : config.name,
    ios: {
      ...config.ios,
      bundleIdentifier: isDevelopment
        ? 'uz.khanovmath.academy.dev'
        : config.ios.bundleIdentifier,
    },
    android: {
      ...config.android,
      package: isDevelopment
        ? 'uz.khanovmath.academy.dev'
        : config.android.package,
    },
  };
};
