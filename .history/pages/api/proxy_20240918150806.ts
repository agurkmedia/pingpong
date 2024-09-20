import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return httpProxyMiddleware(req, res, {
    target: 'http://localhost:8000',
    pathRewrite: [
      {
        patternStr: '^/api/',
        replaceStr: '/api/',
      },
    ],
  });
}