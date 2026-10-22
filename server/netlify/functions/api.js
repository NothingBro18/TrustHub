import serverless from 'serverless-http';
import app from '../../server.js';
import connectDB from '../../config/db.js';

const expressHandler = serverless(app);
let connectionPromise;

const normalizePath = (requestPath = '/') => {
  const functionPrefix = '/.netlify/functions/api';
  if (requestPath.startsWith(functionPrefix)) {
    return requestPath.slice(functionPrefix.length) || '/';
  }

  if (requestPath === '/api' || requestPath.startsWith('/api/')) {
    return requestPath;
  }

  return `/api${requestPath.startsWith('/') ? requestPath : `/${requestPath}`}`;
};

export const handler = async (event, context) => {
  try {
    connectionPromise ??= connectDB().catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
    await connectionPromise;

    const originalPath = event.rawPath || event.path || '/';
    const path = normalizePath(originalPath);
    const normalizedEvent = { ...event, path, rawPath: path };
    if (event.rawUrl) {
      const url = new URL(event.rawUrl);
      url.pathname = path;
      normalizedEvent.rawUrl = url.toString();
    }

    return await expressHandler(normalizedEvent, context);
  } catch (error) {
    console.error('Netlify API request failed:', error);
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};