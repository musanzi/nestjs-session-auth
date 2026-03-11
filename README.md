# nestjs-session-auth

> Plug-and-play NestJS **session-based authentication** with **RBAC**, **Google OAuth2** and **JWT password-reset** — clean, typed and ready to use.

Built by [Wilfried Musanzi](https://github.com/musanzi).

---

## Features

| Feature                     | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| 🔐 Session auth             | Passport.js session guard — protect every route by default    |
| 🏷️ `@Public()`              | Opt-out decorator for public routes                           |
| 👤 `@CurrentUser()`         | Param decorator to inject the authenticated user              |
| 🛡️ RBAC                     | Role-Based Access Control with per-module policy registration |
| 🔑 `@Rbac()`                | Decorator to declare resource/action requirements             |
| 🌐 Google OAuth2            | Abstract strategy ready to extend                             |
| 🔒 Local strategy           | Abstract email+password strategy ready to extend              |
| 📦 `forRoot` / `forFeature` | NestJS-idiomatic dynamic module API                           |

---

## Installation

```bash
npm install nestjs-session-auth
# or
pnpm add nestjs-session-auth
```

### Required peer dependencies

```bash
npm install @nestjs/passport passport passport-local express-session
npm install -D @types/passport @types/passport-local @types/express-session
```

### Optional — Google OAuth2

```bash
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

---

## Quick Start

### 1. Bootstrap (`main.ts`)

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import session from "express-session";
import passport from "passport";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(
    session({
      secret: config.get("SESSION_SECRET"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: config.get("NODE_ENV") === "production",
        maxAge: 86_400_000, // 1 day
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(config.get("PORT", 3000));
}
bootstrap();
```

### 2. App Module

```ts
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import {
  SessionAuthModule,
  SessionAuthGuard,
  RbacGuard,
} from "nestjs-session-auth";
import { ADMIN_POLICY } from "./rbac/admin.policy";

@Module({
  imports: [
    // Register once — global: true, shares registry across all modules
    SessionAuthModule.forRoot({
      policies: [ADMIN_POLICY], // system-wide policies (e.g. admin has manage:*)
    }),
    // ... other modules
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionAuthGuard }, // blocks unauthenticated requests
    { provide: APP_GUARD, useClass: RbacGuard }, // enforces @Rbac() annotations
  ],
})
export class AppModule {}
```

---

## RBAC

### Define a policy

```ts
// posts/posts-rbac.policy.ts
import { ModuleRbacPolicy } from "nestjs-session-auth";

export const POSTS_RBAC: ModuleRbacPolicy = {
  module: "posts",
  grants: [
    {
      roles: ["admin", "editor"],
      actions: ["create", "update", "delete"],
      resources: ["posts"],
    },
    {
      roles: ["user"],
      action: "read",
      resources: ["posts"],
    },
  ],
};
```

### Register in your feature module

```ts
// posts/posts.module.ts
import { Module } from "@nestjs/common";
import { SessionAuthModule } from "nestjs-session-auth";
import { POSTS_RBAC } from "./posts-rbac.policy";

@Module({
  imports: [SessionAuthModule.forFeature([POSTS_RBAC])],
  // ...
})
export class PostsModule {}
```

### Protect routes

```ts
// posts/posts.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Rbac, Public, CurrentUser } from 'nestjs-session-auth';

@Controller('posts')
export class PostsController {
  @Get()
  @Public() // ← everyone can read
  findAll() { ... }

  @Post()
  @Rbac({ resource: 'posts', action: 'create' }) // ← only admin / editor
  create(@Body() dto: CreatePostDto, @CurrentUser() user: User) { ... }
}
```

### System-wide admin policy (example)

```ts
// rbac/admin.policy.ts
import { ModuleRbacPolicy } from "nestjs-session-auth";

export const ADMIN_POLICY: ModuleRbacPolicy = {
  module: "system",
  grants: [{ roles: ["admin"], actions: ["manage"], resources: ["*"] }],
};
```

---

## Local (email + password) Strategy

```ts
// auth/local.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LocalAuthStrategy } from "nestjs-session-auth";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends LocalAuthStrategy {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    return user;
  }
}
```

```ts
// auth/auth.controller.ts
import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { LocalAuthGuard, Public } from "nestjs-session-auth";

@Controller("auth")
export class AuthController {
  @Post("signin")
  @Public()
  @UseGuards(LocalAuthGuard) // ← triggers LocalStrategy.validate()
  signIn(@Req() req: Request) {
    return req.user;
  }
}
```

---

## Google OAuth2 Strategy

```ts
// auth/google.strategy.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GoogleAuthStrategy,
  GoogleProfile,
  GoogleVerifyCallback,
} from "nestjs-session-auth";
import { AuthService } from "./auth.service";

@Injectable()
export class GoogleStrategy extends GoogleAuthStrategy {
  constructor(
    private authService: AuthService,
    config: ConfigService,
  ) {
    super({
      clientID: config.get("GOOGLE_CLIENT_ID"),
      clientSecret: config.get("GOOGLE_SECRET"),
      callbackURL: config.get("GOOGLE_REDIRECT_URI"),
    });
  }

  async validate(
    _at: string,
    _rt: string,
    profile: GoogleProfile,
    done: GoogleVerifyCallback,
  ) {
    const user = await this.authService.findOrCreateFromGoogle(profile);
    done(null, user);
  }
}
```

```ts
// auth/auth.controller.ts (Google endpoints)
import { Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GoogleAuthGuard, Public } from 'nestjs-session-auth';

@Get('google')
@Public()
@UseGuards(GoogleAuthGuard)
googleAuth() {}

@Get('google/callback')
@Public()
@UseGuards(GoogleAuthGuard)
googleCallback(@Res() res: Response) {
  res.redirect(process.env.FRONTEND_URI);
}
```

---

## Session Serializer

The library ships a `DefaultSessionSerializer` that stores the full user object in the session. If you prefer to serialize only the user ID and reload from the database on each request:

```ts
// auth/my-session.serializer.ts
import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UsersService } from "../users/users.service";

@Injectable()
export class MySessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    done(null, user.id); // store only the ID
  }

  async deserializeUser(id: string, done: Function) {
    const user = await this.usersService.findOne(id);
    done(null, user);
  }
}
```

Provide it in your `AuthModule`:

```ts
providers: [MySessionSerializer];
```

Passport will automatically pick it up.

---

## API Reference

### Module

| Method                                   | Description                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `SessionAuthModule.forRoot(options?)`    | Import once in `AppModule`. Registers the global registry + optional system policies. |
| `SessionAuthModule.forFeature(policies)` | Import in any feature module to register its RBAC policies.                           |

### Guards

| Guard              | Purpose                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| `SessionAuthGuard` | Global auth gate — checks `req.isAuthenticated()`. Skips `@Public()` routes. |
| `RbacGuard`        | Evaluates `@Rbac()` annotations against user roles.                          |
| `LocalAuthGuard`   | Triggers Passport local strategy + establishes session.                      |
| `GoogleAuthGuard`  | Triggers Passport Google strategy + establishes session.                     |

### Decorators

| Decorator        | Signature                                                 | Description                               |
| ---------------- | --------------------------------------------------------- | ----------------------------------------- |
| `@Public()`      | `() => MethodDecorator`                                   | Mark a route as public (skip auth).       |
| `@CurrentUser()` | `(key?: string) => ParameterDecorator`                    | Inject `req.user` or a specific property. |
| `@Rbac()`        | `(...requirements: RoleRequirement[]) => MethodDecorator` | Attach RBAC requirements.                 |

### Strategies (abstract base classes)

| Class                | Base Passport strategy                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| `LocalAuthStrategy`  | `passport-local` — override `validate(email, password)`                |
| `GoogleAuthStrategy` | `passport-google-oauth20` — override `validate(at, rt, profile, done)` |

### RBAC types

| Type               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `ModuleRbacPolicy` | A named group of `RbacGrant` entries                     |
| `RbacGrant`        | Maps roles → actions → resources                         |
| `RoleRequirement`  | The requirement placed on a route via `@Rbac()`          |
| `RbacAction`       | `'create' \| 'read' \| 'update' \| 'delete' \| 'manage'` |

---

## License

MIT© [Wilfried Musanzi](https://github.com/musanzi)
