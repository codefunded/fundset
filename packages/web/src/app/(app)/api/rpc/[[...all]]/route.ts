import { router } from '@/_fundset/settlement-layer/pg/orpc/router';
import { RPCHandler } from '@orpc/server/fetch';

const handler = new RPCHandler(router);

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  'access-control-allow-headers': '*',
};

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {
      headers: request.headers,
    },
  });

  if (response) {
    Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  return new Response('Not found', {
    status: 404,
    headers: corsHeaders,
  });
}

async function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export const OPTIONS = handleOptions;
export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
