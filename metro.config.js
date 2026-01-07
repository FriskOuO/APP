const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Add any additional asset extensions
  'mp3',
  'mp4',
  'gif'
);

// Increase timeout for slower connections
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Fix for URI malformed errors - catch decoding errors
      try {
        req.url = decodeURIComponent(req.url);
      } catch (e) {
        // If decoding fails, use the original URL
        console.warn('Failed to decode URL:', req.url);
      }
      return middleware(req, res, next);
    };
  }
};

module.exports = config;
