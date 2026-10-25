/// <reference path="./worker-configuration.d.ts" />

enum WaitlistPlatform {
  IOS = 'ios',
  Android = 'android',
  Both = 'both',
}

const MAX_BODY_BYTES = 8192
const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'http://localhost:4321',
  'http://localhost:8787',
])

interface WaitlistPayload {
  email: string
  platform: WaitlistPlatform
  source: string
}

type JsonRecord = Record<string, unknown>

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS')
      return corsResponse(request, env)

    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse(request, env, { ok: true })
    }

    if (url.pathname === '/waitlist' && request.method === 'POST') {
      return handleWaitlistRequest(request, env)
    }

    return jsonResponse(
      request,
      env,
      { ok: false, error: 'not_found' },
      { status: 404 },
    )
  },
} satisfies ExportedHandler<Env>

async function handleWaitlistRequest(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await readWaitlistPayload(request)
    const id = crypto.randomUUID()
    const userAgent = request.headers.get('user-agent')
    const country = request.cf?.country ?? null

    await env.DB.prepare(`
      INSERT INTO waitlist_entries (id, email, platform, source, user_agent, country)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        platform = excluded.platform,
        source = excluded.source,
        user_agent = excluded.user_agent,
        country = excluded.country,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id,
      payload.email,
      payload.platform,
      payload.source,
      userAgent,
      country,
    ).run()

    return jsonResponse(
      request,
      env,
      {
        ok: true,
        email: payload.email,
        platform: payload.platform,
      },
      { status: 202 },
    )
  }
  catch (error) {
    if (error instanceof WaitlistRequestError) {
      return jsonResponse(
        request,
        env,
        { ok: false, error: error.code },
        { status: error.status },
      )
    }

    console.error(JSON.stringify({
      event: 'waitlist_submit_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }))

    return jsonResponse(
      request,
      env,
      { ok: false, error: 'server_error' },
      { status: 500 },
    )
  }
}

async function readWaitlistPayload(request: Request): Promise<WaitlistPayload> {
  const contentLength = Number(request.headers.get('content-length') ?? '0')

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES)
    throw new WaitlistRequestError('payload_too_large', 413)

  const contentType = request.headers.get('content-type') ?? ''
  let rawPayload: JsonRecord

  if (contentType.includes('application/json')) {
    rawPayload = await readJsonPayload(request)
  }
  else if (
    contentType.includes('application/x-www-form-urlencoded')
    || contentType.includes('multipart/form-data')
  ) {
    rawPayload = await readFormPayload(request)
  }
  else {
    throw new WaitlistRequestError('unsupported_media_type', 415)
  }

  return normalizeWaitlistPayload(rawPayload)
}

async function readJsonPayload(request: Request): Promise<JsonRecord> {
  try {
    const payload: unknown = await request.json()

    if (!isRecord(payload))
      throw new WaitlistRequestError('invalid_payload', 400)

    return payload
  }
  catch (error) {
    if (error instanceof WaitlistRequestError)
      throw error

    throw new WaitlistRequestError('invalid_json', 400)
  }
}

async function readFormPayload(request: Request): Promise<JsonRecord> {
  const formData = await request.formData()
  const payload: JsonRecord = {}

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string')
      payload[key] = value
  }

  return payload
}

function normalizeWaitlistPayload(payload: JsonRecord): WaitlistPayload {
  const email = normalizeEmail(payload.email)
  const platform = normalizePlatform(payload.platform)
  const source = normalizeSource(payload.source)

  return {
    email,
    platform,
    source,
  }
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string')
    throw new WaitlistRequestError('email_required', 400)

  const email = value.trim().toLowerCase()

  if (email.length < 3 || email.length > 254 || !EMAIL_PATTERN.test(email))
    throw new WaitlistRequestError('email_invalid', 400)

  return email
}

function normalizePlatform(value: unknown): WaitlistPlatform {
  if (typeof value !== 'string')
    return WaitlistPlatform.Both

  const platform = value.trim().toLowerCase()

  if (platform === WaitlistPlatform.IOS)
    return WaitlistPlatform.IOS

  if (platform === WaitlistPlatform.Android)
    return WaitlistPlatform.Android

  if (platform === WaitlistPlatform.Both)
    return WaitlistPlatform.Both

  throw new WaitlistRequestError('platform_invalid', 400)
}

function normalizeSource(value: unknown): string {
  if (typeof value !== 'string')
    return 'website'

  const source = value.trim().toLowerCase()

  if (!source)
    return 'website'

  return source.replace(/[^a-z0-9_-]/g, '').slice(0, 48) || 'website'
}

function corsResponse(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  })
}

function jsonResponse(
  request: Request,
  env: Env,
  body: JsonRecord,
  init: ResponseInit = {},
): Response {
  return Response.json(body, {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(request, env),
      ...init.headers,
    },
  })
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const requestOrigin = request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins(env)
  const origin = requestOrigin && allowedOrigins.has(requestOrigin)
    ? requestOrigin
    : ''

  return {
    ...(origin ? { 'access-control-allow-origin': origin } : {}),
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  }
}

function getAllowedOrigins(env: Env): Set<string> {
  if (!env.ALLOWED_ORIGINS)
    return DEFAULT_ALLOWED_ORIGINS

  return new Set(
    env.ALLOWED_ORIGINS
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
  )
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

class WaitlistRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code)
  }
}
