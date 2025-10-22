<!-- 712026cd-711f-4954-9f75-6bfd47bf0c8e 2f51bd64-d55e-4941-bf2c-667dea8436c4 -->
# Deploy to Vercel and add Gmail sidebar button

## Scope

- Push repo to GitHub, provide Vercel setup steps (you connect GitHub↔Vercel)
- Add a Gmail sidebar button that opens the webapp page `/dashboard/reference-emails`

## 1) Prepare for GitHub → Vercel

- Create a GitHub repo and add as `origin`
- Commit current changes and push `main`
- You’ll connect the repo in Vercel and set env vars

Commands (run locally):

```bash
# from /Users/guidocroon/EmailAI
git add -A
git commit -m "Deploy: prepare Vercel + Gmail sidebar link to reference emails"
git remote add origin git@github.com:<your-user>/<your-repo>.git
git push -u origin main
```

## 2) Vercel project and env vars

Set these in Vercel Project → Settings → Environment Variables (Production + Preview):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_PRICE_ID_PRO
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL (e.g., `https://<your-vercel-domain>`)

Stripe settings:

- Product/Price: put price id in `STRIPE_PRICE_ID_PRO`
- Webhook endpoint: `POST https://<your-vercel-domain>/api/stripe/webhook`

## 3) Gmail extension: add button linking to reference emails

File: `extension/content.js`

- Add a single source of truth for your deployed app URL at top-level:
```javascript
// Set to your deployed URL (no trailing slash)
const APP_URL = 'https://<your-vercel-domain>';
```

- (Optional) Replace the existing `API_URL` usages to use `APP_URL` if you want the extension to call your deployed API instead of localhost. If CORS causes issues, we can later switch to the `/panel` iframe approach.

- Add a third action button to open the webapp reference emails page. In the `panel.innerHTML` actions block, add after the existing two buttons:
```html
<button id="open-reference-emails" class="mailsprint-btn">Referentie e-mails</button>
```

- In `setupSidebarEventListeners(panel)` wire it up:
```javascript
const openRefBtn = panel.querySelector('#open-reference-emails');
openRefBtn.addEventListener('click', () => {
  window.open(`${APP_URL}/dashboard/reference-emails`, '_blank');
});
```


Styling: reuse existing `mailsprint-btn` class; no new CSS required.

## 4) Commit and push changes

```bash
git add extension/content.js
git commit -m "feat(extension): add sidebar button to Reference Emails"
git push
```

## 5) Post-deploy checks

- Visit your Vercel domain → sign in → `/dashboard/reference-emails` works
- Stripe checkout/portal redirect URLs use `NEXT_PUBLIC_APP_URL`
- In Gmail, open a compose window, press Cmd+Shift+M to open the sidebar, click “Referentie e-mails” → opens the page on your Vercel domain

## Notes/Risks

- The extension currently calls `http://localhost:3001` for generation; in production this won’t work. We can point it to `APP_URL` or switch to loading `/panel` in an iframe to avoid CORS and cookie issues. This can be a follow-up if needed.

### To-dos

- [ ] Push current project to new GitHub repo (origin main)
- [ ] Configure Vercel env vars and Stripe webhook URL
- [ ] Add Gmail sidebar button linking to /dashboard/reference-emails
- [ ] Commit extension changes and push to GitHub
- [ ] Smoke test on Vercel and Gmail extension button