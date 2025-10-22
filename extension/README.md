# MailSprint AI Chrome Extension

Een intelligente Gmail Chrome extensie die mail threads analyseert en contextuele replies genereert met AI.

## ✨ Features

- **3-Panel Sidebar** - Geïnspireerd op Apollo.io's design
  1. **Input Panel** - Geef aan wat je wil schrijven
  2. **Thread Analyse** - Ziet automatisch onderwerp, afzender en laatste bericht
  3. **Gegenereerde Email** - AI-gegenereerde reply op basis van context

- **Sneltoetsen**
  - `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows) - Open/sluit sidebar
  - `Cmd+M` (Mac) / `Ctrl+M` (Windows) - Quick compose overlay

- **Context-Aware** - Leest automatisch:
  - Email onderwerp
  - Afzender informatie
  - Laatste bericht in thread
  - Aantal berichten in conversatie

## 🚀 Installatie

### 1. Backend starten

Zorg dat de Next.js app draait op `localhost:3001`:

```bash
cd /Users/guidocroon/EmailAI
npm run dev
```

De app draait op poort 3001 (3000 was al in gebruik).

### 2. Extensie laden in Chrome

1. Open Chrome en ga naar `chrome://extensions/`
2. Schakel **Developer mode** in (rechtsboven)
3. Klik op **Load unpacked**
4. Selecteer de `/Users/guidocroon/EmailAI/extension/` folder
5. De extensie is nu geïnstalleerd! ✅

### 3. Gebruik in Gmail

1. Open [Gmail](https://mail.google.com)
2. Open een email thread
3. Druk op `Cmd+Shift+M` (Mac) of `Ctrl+Shift+M` (Windows)
4. De sidebar opent aan de rechterkant

## 🎯 Gebruik

### Via Sidebar (Aanbevolen)

1. **Open sidebar**: `Cmd+Shift+M`
2. **Bekijk analyse**: Thread context wordt automatisch geladen
3. **Typ instructie**: Bijvoorbeeld "Stuur een vriendelijke follow-up"
4. **Klik 'Genereer Email'**: AI genereert de email
5. **Klik 'Plak in Gmail'**: Email wordt direct in compose box geplakt

### Via Quick Overlay

1. **Open compose window** in Gmail
2. **Druk** `Cmd+M` (sneltoets werkt al goed!)
3. **Typ instructie** in overlay
4. **Enter/Click 'Genereer'**: Direct in compose window geplakt

## 🔧 Technische Details

### Hoe het werkt

De extensie gebruikt:
- **Content Script** (`content.js`) - Draait op Gmail pagina's
- **Background Script** (`background.js`) - Luistert naar sneltoetsen
- **Gmail DOM Selectors** - Extraheert thread informatie
- **Next.js API** - Genereert emails via `/api/generateMail`

### Context Extractie

De extensie leest automatisch:
```javascript
- Onderwerp: h2.hP selector
- Berichten: [data-message-id] elements
- Email body: .a3s selector (zonder quoted text)
- Afzender: .gD of [email] attributes
```

### API Communicatie

```javascript
POST http://localhost:3001/api/generateMail
{
  "context": {
    "userInput": "...",
    "subject": "...",
    "from": "...",
    "threadContext": "...",
    "messageCount": 3
  }
}
```

## 🎨 Design

Geïnspireerd op Apollo.io:
- **Schone UI** met duidelijke secties
- **Context Cards** voor thread analyse
- **Empty States** met hints
- **Smooth animaties** en transitions
- **Responsive** design

## 🐛 Troubleshooting

**Sidebar laadt niet?**
- Check of backend draait op `localhost:3001`
- Ververs Gmail pagina
- Check Chrome DevTools console voor errors

**Context wordt niet gelezen?**
- Open een email thread (niet alleen inbox)
- Klik op "Refresh" knop in de analyse sectie
- Sommige Gmail layouts kunnen andere selectors gebruiken

**API errors?**
- Login bij dashboard: `http://localhost:3001/login`
- Check of je een account hebt aangemaakt
- Controleer of Supabase en OpenAI keys correct zijn

## 📝 Changelog

### v0.3.0 (Current)
- ✨ Nieuwe 3-panel sidebar zoals Apollo.io
- 🔍 Automatische thread analyse
- 🎨 Moderne, schone UI
- ⚡ Snellere context extractie
- 🔄 Refresh knop voor context

### v0.2.0
- Quick overlay met Cmd+M werkt
- Basis thread extractie

## 🔐 Privacy

- **Geen data opslag** in extensie
- **Lokale API calls** naar eigen backend
- **Gmail data** wordt alleen tijdelijk gebruikt voor generatie
- **Geen tracking** of analytics

## 📞 Support

Problemen? Check:
1. Backend status: `http://localhost:3001`
2. Chrome console: `F12` → Console tab
3. Extensie status: `chrome://extensions/`

## 🚀 Volgende Stappen

Mogelijke features:
- [ ] Tone selector (formeel/casual/vriendelijk)
- [ ] Template library
- [ ] Multi-language support
- [ ] Attachment context
- [ ] Meeting scheduler integration
- [ ] Custom prompts/instructions

---

Made with ❤️ for better email communication
