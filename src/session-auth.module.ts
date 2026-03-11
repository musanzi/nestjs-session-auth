import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RbacRegistryService } from './rbac/rbac-registry.service';
import { ModuleRbacPolicy } from './rbac/rbac-policy';
import { DefaultSessionSerializer } from './serializers/session.serializer';

export interface SessionAuthModuleOptions {
  /**
   * An initial set of RBAC policies to register at boot time (e.g. a
   * system-wide "admin has manage:*" rule).
   */
  policies?: ModuleRbacPolicy[];
}

const createPolicyProvider = (policy: ModuleRbacPolicy): Provider => ({
  provide: `SESSION_AUTH_RBAC_POLICY:${policy.module}`,
  inject: [RbacRegistryService],
  useFactory: (registry: RbacRegistryService): boolean => {
    registry.register(policy);
    return true;
  },
});

/**
 * The root module for `@musanzi/nestjs-session-auth`.
 *
 * ## Quick start
 *
 * ```ts
 * // app.module.ts
 * @Module({
 *   imports: [
 *     SessionAuthModule.forRoot({
 *       policies: [ADMIN_POLICY],
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
   * Import once in your root `AppModule`. Registers the shared registry,
   * Passport session support, and any system-level RBAC policies.
   *
   * NOTE: Guards (`SessionAuthGuard`, `RbacGuard`) are NOT registered here —
   * wire them yourself via `APP_GUARD` in your `AppModule` so NestJS can
   * inject `Reflector` correctly.
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
        ...policyProviders,
      ],
      exports: [RbacRegistryService, DefaultSessionSerializer],
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
