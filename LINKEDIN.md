# LinkedIn Post — @musanzi/nestjs-session-auth Launch

---

After months of copy-pasting the same auth boilerplate across every NestJS project, I finally did the thing — I extracted it into a proper open-source library.

Introducing **`@musanzi/nestjs-session-auth`** 🚀

A clean, typed, plug-and-play authentication library for NestJS — built from real production code at **CINOLU**, the innovation hub I work at in Lubumbashi, DRC.

---

**What it gives you out of the box:**

🔐 Session-based authentication (Passport.js) — every route protected by default
🏷️ `@Public()` — opt-out decorator for routes that don't need auth
👤 `@CurrentUser()` — inject the authenticated user with one decorator
🛡️ Role-Based Access Control (RBAC) — define policies per feature module
🔑 `@Rbac()` — attach resource/action requirements directly on your routes
🌐 Google OAuth2 — abstract strategy ready to extend in 10 lines
🔒 Local strategy — email + password, same pattern
📦 `forRoot()` / `forFeature()` — idiomatic NestJS dynamic module API

---

**The idea is simple:**

Stop writing the same guards, decorators and strategy boilerplate every time you spin up a new API. Install one package, wire two guards, define your policies — done.

```bash
npm install @musanzi/nestjs-session-auth
```

```ts
// app.module.ts
SessionAuthModule.forRoot({ policies: [ADMIN_POLICY] })

// any feature module
SessionAuthModule.forFeature([POSTS_RBAC])

// any controller
@Rbac({ resource: 'posts', action: 'create' })
@Post()
create(@CurrentUser() user: User) { ... }
```

---

This is my first published npm package. Built it from scratch, tested it against a real production API, cleaned it up, and shipped it.

More to come — I'm building in public and this is just the start.

📦 npm: npmjs.com/package/@musanzi/nestjs-session-auth
💻 GitHub: github.com/wmusanzi/nestjs-session-auth

---

*Always building. 🛠️*
*— Wilfried Musanzi, Web Dev Lead @ CINOLU*

---

**Hashtags:**
`#NestJS` `#TypeScript` `#OpenSource` `#NodeJS` `#BackendDevelopment` `#NPM` `#CINOLU` `#BuildingInPublic` `#Africa` `#TechAfrica`
