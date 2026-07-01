# Flow API

Cloudflare Worker endpoints for launch and marketing operations.

## Local development

```bash
pnpm api db:migrate:local
pnpm api dev
```

The Worker runs at `http://localhost:8787`. The website dev build uses
`http://localhost:8787/waitlist` by default.

## Waitlist endpoint

```bash
curl -X POST http://localhost:8787/waitlist \
  -H 'content-type: application/json' \
  --data '{"email":"you@example.com","platform":"ios","source":"website"}'
```

Valid `platform` values are `ios`, `android`, and `both`.

## Deploy

1. Log in to Cloudflare:

```bash
pnpm --filter @flow/api exec wrangler login
```

2. Create the D1 database:

```bash
pnpm --filter @flow/api exec wrangler d1 create flow-waitlist
```

3. Copy the returned `database_id` into `wrangler.jsonc`.

4. Regenerate binding types:

```bash
pnpm api cf-typegen
```

5. Apply remote migrations:

```bash
pnpm api db:migrate:remote
```

6. Deploy the Worker:

```bash
pnpm api deploy
```

If the Worker is deployed on a separate host, set `PUBLIC_WAITLIST_API_URL`
for `apps/www` to the full endpoint, for example
`https://api.example.com/waitlist`. If Cloudflare routes `/waitlist` on the
same domain to this Worker, the website can use the default `/waitlist`.
