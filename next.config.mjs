// @ts-check

import path from 'path';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'standalone',
  // redirects() {
  //   return Promise.resolve([
  //     {
  //       source: '/:projectUrl',
  //       destination: '/:projectUrl/main',
  //       permanent: true,
  //       has: [
  //         {
  //           type: 'host',
  //           value: '^(?!home$)',
  //         },
  //       ],
  //     },
  //   ]);
  // },
  rewrites() {
    return Promise.resolve([
      {
        source: '/',
        destination: '/main'
      },
      {
        source: '/:projectUrl',
        destination: '/:projectUrl/main',
      }
    ]);
  },
  images: {
    domains: ['firebasestorage.googleapis.com']
  },
  webpack(config, options) {
    // Set up alias
    config.resolve.alias['@'] = path.resolve(process.cwd(), './src');

    // Exclude the `functions` directory from being processed
    config.externals = config.externals || [];
    config.externals.push((context, request, callback) => {
      if (request.startsWith(path.resolve(process.cwd(), 'functions'))) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    });

    return config;
  }
};

export default nextConfig;
