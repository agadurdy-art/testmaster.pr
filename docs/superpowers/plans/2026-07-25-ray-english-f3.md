# Ray English F3 — ge.stemhousebenluc.com cutover (NS-gate'siz)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline; küçük ops-ağırlıklı plan).

**Goal:** GE'yi ge.stemhousebenluc.com'da canlıya al, ge.testmaster.pro'yu 301'le, noindex'i kaldır.

**Architecture:** stemhousebenluc.com DNS'i hâlâ Vercel DNS'te (NS kapısı F2'de bekliyor) → `ge` CNAME'i Vercel DNS'e eklenir, CF Pages `ge-testmaster` projesine external-DNS custom domain olarak bağlanır. NS ileride CF'e geçince kayıt zone taramasında içeri alınır (dns-cutover runbook'una not düşüldü).

**Tech Stack:** CRA + CF Pages (branch `split/ielts`!), Railway ray-english-api, Vercel DNS CLI, CF zone Redirect Rules (token `~/.secrets/cf-testmaster-zone.token`).

---

### Task 1: Frontend launch temizliği (repo ~/ray-english)
- [ ] 12 locale `pricingTitle` → "Ray English Plans" (in-session çeviri; paid API yok)
- [ ] `frontend/index.html`: `<meta name="robots" noindex>` satırını sil; `og:url` + `og:image` → https://ge.stemhousebenluc.com
- [ ] `frontend/public/_headers`: X-Robots-Tag noindex bloğunu sil
- [ ] `frontend/public/robots.txt`: `Disallow: /` → `Allow` (User-agent: * / Allow: /)
- [ ] Commit + push (`git ls-remote` eşleşme doğrula)

### Task 2: DNS + Pages domain
- [ ] `vercel dns add stemhousebenluc.com ge CNAME ge-testmaster.pages.dev`
- [ ] `npx wrangler pages domain add ge.stemhousebenluc.com --project-name ge-testmaster` (wrangler OAuth)
- [ ] Cert/verify bekle → `curl -sI https://ge.stemhousebenluc.com` 200/302

### Task 3: Railway env (SADECE ray-english projesi — testmaster.pr'a ASLA)
- [ ] `railway status` ile proje=ray-english doğrula
- [ ] `CORS_ORIGINS` += `https://ge.stemhousebenluc.com`
- [ ] `FRONTEND_BASE_URL` → `https://ge.stemhousebenluc.com`
- [ ] Redeploy SUCCESS + `/api/health` 200 + `/api/auth/google/start` redirect_uri değişmedi (backend URI — Console'a dokunma gerekmez)

### Task 4: Build + deploy
- [ ] `cd ~/ray-english/frontend && REACT_APP_BACKEND_URL=https://ray-english-api-production.up.railway.app npm run build`
- [ ] `npx wrangler pages deploy build --project-name ge-testmaster --branch split/ielts` (⚠️ branch şart)
- [ ] testmaster.pro zone `purge_everything`
- [ ] Yeni domainde canlı doğrula: `/landing/ge`, login, bundle'da noindex yok

### Task 5: 301 (ancak Task 4 doğrulandıktan SONRA)
- [ ] CF Redirect Rule (testmaster.pro zone): host `ge.testmaster.pro` → `https://ge.stemhousebenluc.com` + path korunarak, 301
- [ ] `ge` DNS kaydı proxied mi kontrol (Redirect Rule proxy ister)
- [ ] `curl -sI https://ge.testmaster.pro/landing/ge` → 301 Location doğrula

### Task 6: stemhouse banner (branch cf-migration)
- [ ] `RayEnglishBanner.tsx` GE_URL → `https://ge.stemhousebenluc.com/landing/ge`
- [ ] Commit + push; workers.dev'e cf:deploy (Vercel canlısı eski linkle kalır — 301 kapsıyor)
- [ ] `docs/dns-cutover.md`'ye not: NS geçişinde `ge` CNAME CF zone'da olmalı (tarama alır; doğrula)

### Task 7: E2E + kapanış
- [ ] Yeni domain: landing → login (email/şifre) → /ge/dashboard, Network'te tüm /api/* → ray-english-api
- [ ] Google OAuth /start 302 + Google auth sayfası 302 (mismatch yok)
- [ ] /pricing/ge h1 "Ray English Plans" canlı (design-review hafif geçiş)
- [ ] Memory güncelle
