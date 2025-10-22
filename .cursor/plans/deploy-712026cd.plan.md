<!-- 712026cd-711f-4954-9f75-6bfd47bf0c8e de5727ea-aef6-4072-a67b-917e0bdb98d8 -->
# Implement dynamic CORS echo on API

## Changes
- Update `src/app/api/generate/route.ts` to dynamically echo preflight headers and origin.
  - In OPTIONS:
    - Read from request:
      - `origin = req.headers.get('origin') || '*'`
      - `reqMethod = req.headers.get('access-control-request-method') || 'POST'`
      - `reqHeaders = req.headers.get('access-control-request-headers') || 'content-type'`
    - Return 204 with headers:
      - `Access-Control-Allow-Origin: origin`
      - `Access-Control-Allow-Methods: reqMethod`
      - `Access-Control-Allow-Headers: reqHeaders`
      - `Access-Control-Max-Age: 86400`
  - In POST:
    - Set `Access-Control-Allow-Origin: req.headers.get('origin') || '*'`
    - Add `Vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers`
- Keep existing `generateMail` as-is (extension now uses `/api/generate`).
- No changes to middleware; preflight is fully handled per-route.

## Verification
- Stop localhost
- In Gmail, open DevTools → Network
- Trigger sidebar → verify OPTIONS 204 with echoed headers, then POST 200 with `Access-Control-Allow-Origin`.
- Confirm no CORS errors in Console.

### To-dos

- [ ] Implement dynamic CORS echo in /api/generate OPTIONS + POST
- [ ] Push changes, wait for Vercel, test Gmail preflight/POST