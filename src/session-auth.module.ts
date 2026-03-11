import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RbacRegistryService } from './rbac/rbac-registry.service';
import { ModuleRbacPolicy } from './rbac/rbac-policy';
import { DefaultSessionSerializer } from './serializers/session.serializer';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { RbacGuard } from './guards/rbac.guard';

// ─────────────────────────────────────────────────────────────────────────────
// forRoot options
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionAuthModuleOptions {
  /**
   * An initial set of RBAC policies to register at boot time (e.g. a
   * system-wide "admin has manage:*" rule).
   */
  policies?: ModuleRbacPolicy[];
}

// ─────────────────────────────────────────────────────────────────────────────
// forFeature helper — registers module-level RBAC policies
// ─────────────────────────────────────────────────────────────────────────────

const createPolicyProvider = (policy: ModuleRbacPolicy): Provider => ({
  provide: `SESSION_AUTH_RBAC_POLICY:${policy.module}`,
  inject: [RbacRegistryService],
  useFactory: (registry: RbacRegistryService): boolean => {
    registry.register(policy);
    return true;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Module
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The root module for `nestjs-session-auth`.
 *
 * ## Quick start
 *
 * ```ts
 * // app.module.ts
 * @Module({
 *   imports: [
 *     SessionAuthModule.forRoot({
 *       policies: [ADMIN_POLICY], // optional system-wide policies
 *     }),
 *   ],
 *   providers: [
 *     { provide: APP_GUARD, useClass: SessionAuthGuard },
 *     { provide: APP_GUARD, useClass: RbacGuard },
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Register feature policies from other modules:
 * ```ts
 * // posts.module.ts
 * @Module({
 *   imports: [SessionAuthModule.forFeature([POSTS_RBAC_POLICY])],
 * })
 * export class PostsModule {}
 * ```
 */
@Module({})
export class SessionAuthModule {
  /**
   * Import once in your root `AppModule`. Registers the shared registry and
   * any system-level RBAC policies.
   */
  static forRoot(options: SessionAuthModuleOptions = {}): DynamicModule {
    const policyProviders = (options.policies ?? []).map(createPolicyProvider);

    return {
      global: true,
      module: SessionAuthModule,
      imports: [PassportModule.register({ session: true })],
      providers: [
        RbacRegistryService,
        DefaultSessionSerializer,
        SessionAuthGuard,
        RbacGuard,
        ...policyProviders,
      ],
      exports: [RbacRegistryService, DefaultSessionSerializer, SessionAuthGuard, RbacGuard],
    };
  }

  /**
   * Import in any feature module to register its RBAC policy with the global
   * registry.
   */
  static forFeature(policies: ModuleRbacPolicy[]): DynamicModule {
    const policyProviders = policies.map(createPolicyProvider);
    return {
      module: SessionAuthModule,
      providers: policyProviders,
    };
  }
}
