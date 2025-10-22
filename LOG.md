MailSprint AI — Change Log

2025-09-26

- Scaffolded Next.js 14 app with Tailwind and TypeScript
- Installed deps: Supabase, Stripe, OpenAI, Zod
- Added env template `.env.example`
- Implemented Supabase libs: server, client, admin
- Implemented OpenAI and Stripe libs
- Created marketing landing at `/` with CTA
- Implemented `/auth` (initial) and protected `/dashboard`
- Added tone-of-voice setting, save route, signout route
- Implemented `/api/generateMail` (OpenAI)
- Implemented Stripe checkout/portal and webhook routes

Auth enhancement (this request)

- Created `/signup` with magic link and email/password flows
- Created `/login` with magic link and email/password flows
- Added `/auth/callback` to exchange code for session and upsert profile
- Added `/api/profile/upsert` to upsert `{ id, email, created_at }`
- Updated landing CTA to `/signup`

Dev server

- Started local dev server with `npm run dev` to preview frontend at `http://localhost:3000`

Gmail sidebar extension

- Added `extension/` with MV3 manifest, content script, styles, and sidebar UI
- Injects fixed right panel in Gmail; shifts main content left by 360px
- Sidebar calls `/api/generateMail` and can paste result into Gmail compose
- Fixed manifest JSON (removed duplicate blocks)
- Added background service worker and command `toggle-sidebar` mapped to Cmd+M

2025-10-10 - Major Sidebar Redesign (Apollo.io-inspired)

**Problem:** Sidebar was not loading (tried to use iframe from /panel endpoint that didn't work properly)

**Solution:** Complete sidebar rewrite with native HTML/JS

**Changes:**
- ✨ Implemented new 3-panel sidebar layout inspired by Apollo.io
  1. **Input Panel**: Textarea voor user instructies
  2. **Thread Analyse Panel**: Automatische context extractie (subject, sender, last message, message count)
  3. **Output Panel**: Generated email display
  
- 🎨 Modern, clean UI with:
  - Context cards met labels en values
  - Empty states met icons en hints
  - Professional color scheme (Tailwind-inspired)
  - Smooth animations and transitions
  - Proper spacing and typography
  
- 🔧 Technical improvements:
  - Removed iframe dependency - sidebar renders directly in DOM
  - Improved Gmail selectors for better context extraction:
    * Subject: `h2.hP` selector
    * Messages: `[data-message-id]` elements
    * Body: `.a3s` with quote removal
    * Sender: `.gD` and `[email]` attributes
  - Added refresh button to re-scan thread context
  - Better error handling and loading states
  - "Plak in Gmail" button appears only after generation
  
- ⌨️ Keyboard shortcuts:
  - `Cmd+Shift+M` (was Cmd+M): Toggle sidebar
  - `Cmd+M`: Quick compose overlay (unchanged - werkt al goed!)
  
- 📦 Updated:
  - `manifest.json`: Version 0.3.0, updated description
  - `content.js`: Completely rewrote sidebar mounting and context extraction
  - `content.css`: New styling system with all sidebar components
  - `README.md`: Comprehensive documentation with features, usage, troubleshooting

**Lessons Learned:**
- Chrome extensions work better with direct DOM manipulation vs iframes for cross-origin issues
- Gmail DOM structure is stable enough - selectors like `.a3s`, `[data-message-id]` are reliable
- Apollo.io's design pattern works well: Clear sections with icons, context cards, empty states
- Always provide visual feedback (loading states, success confirmations)
- Test sidebar in actual Gmail thread (not just inbox) for proper context extraction

**Next Steps:**
- Consider adding tone selector (formal/casual/friendly)
- Add template library for common email types
- Multi-language support
- Better handling of different Gmail layouts (classic vs new UI)

2025-10-10 - Authentication Temporarily Disabled for Development

**Problem:** Chrome extension was getting "Failed to fetch" and "Unauthorized" errors

**Solution:** Temporarily disabled authentication for faster development/testing

**Changes:**
- ✅ Disabled auth check in `/api/generateMail` route (commented out Supabase auth)
- ✅ Disabled profile fetch from database (using default tone)
- ✅ Added CORS headers to allow Chrome extension requests:
  * `Access-Control-Allow-Origin: *`
  * `Access-Control-Allow-Methods: POST, OPTIONS`
  * `Access-Control-Allow-Headers: Content-Type, Authorization`
- ✅ Added OPTIONS handler for CORS preflight requests
- ✅ Added try-catch error handling with detailed error messages
- ✅ Removed `credentials: 'include'` from extension fetch calls (not needed without auth)
- ✅ Updated error messages to be more helpful (no more auth prompts)

**⚠️ IMPORTANT - TODO:**
Once the extension is fully working and tested, we need to:
1. Re-enable authentication in `/api/generateMail`
2. Implement proper API key or JWT token system for Chrome extension
3. Restrict CORS to specific origins (not `*`)
4. Add rate limiting to prevent abuse
5. Re-enable profile fetching for personalized tone of voice

**Testing:**
Now you can test the extension without needing to log in first!
1. Make sure dev server is running: `npm run dev`
2. Reload extension in Chrome: `chrome://extensions/`
3. Open Gmail and press `Cmd+Shift+M`
4. Should work without authentication errors! ✨

2025-10-10 - Fixed User Perspective Issue (AI was replying as wrong person)

**Problem:** AI generated emails from wrong perspective - it thought the user was the sender of the last message in the thread, not the person replying.

Example: When Guido wanted to reply to Anja's email, the AI wrote as if it was Anja replying to Guido.

**Root Cause:** The extension wasn't detecting WHO the Gmail user is. It only extracted "from" field from the last message, which was the person the user was replying TO, not the user themselves.

**Solution:** Complete context awareness implementation

**Changes in extension/content.js:**
- ✅ Added `userEmail` extraction - gets the logged-in Gmail user's email
  * Tries profile button: `a[aria-label*="Google"][href*="SignOutOptions"]`
  * Fallback: compose field `[name="from"]` or `.wO[email]`
- ✅ Added `isReply` flag to distinguish between new emails and replies
- ✅ Updated sidebar UI to show "✍️ Jij (afzender)" and "👤 Van (ontvangen van)" for clarity
- ✅ Pass `userEmail` and `isReply` to API in context object

**Changes in API route (src/app/api/generateMail/route.ts):**
- ✅ Completely rewrote prompt structure to be explicit about WHO is writing
- ✅ Added clear sections:
  * "Je schrijft een reply email NAMENS: {userEmail}"
  * "Deze email is een REPLY op een bericht VAN: {from}"
  * "Het laatste bericht in de thread (ontvangen van {from})"
  * "INSTRUCTIE VAN DE GEBRUIKER ({userEmail})"
- ✅ Updated system prompt to emphasize perspective:
  * "Je schrijft ALTIJD namens de gebruiker die jou instructies geeft"
  * "Je neemt NOOIT het perspectief van andere mensen in de email thread over"
- ✅ Added explicit instruction: "De gebruiker is degene die de email VERSTUURT, niet degene van wie het laatste bericht kwam"

**Result:**
Now the AI correctly understands:
- WHO is writing (the Gmail user)
- WHO they're replying to (the sender of the last message)
- The context of what was said
- How to write from the correct perspective

**Testing:**
Use the Anja → Guido email thread example:
- User (Guido) opens Anja's email
- Opens sidebar, enters instruction like "Bevestig de afspraak"
- AI now correctly writes as Guido replying to Anja (not as Anja!)


