import "reflect-metadata";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RbacGuard } from "./rbac.guard";
import { RbacRegistryService } from "../rbac/rbac-registry.service";
import { ModuleRbacPolicy } from "../rbac/rbac-policy";

const policy: ModuleRbacPolicy = {
  module: "posts",
  grants: [{ roles: ["admin"], action: "read", resources: ["posts"] }],
};

const makeCtx = (user: unknown): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
  }) as unknown as ExecutionContext;

describe("RbacGuard", () => {
  let guard: RbacGuard;
  let reflector: jest.Mocked<Reflector>;
  let registry: RbacRegistryService;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    registry = new RbacRegistryService();
    registry.register(policy);
    guard = new RbacGuard(reflector, registry);
  });

  it("allows when no RBAC requirements on route", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(makeCtx({ roles: [] }))).toBe(true);
  });

  it("allows when empty requirements array", () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    expect(guard.canActivate(makeCtx({ roles: [] }))).toBe(true);
  });

  it("allows user with correct string role", () => {
    reflector.getAllAndOverride.mockReturnValue([{ resource: "posts", action: "read" }]);
    expect(guard.canActivate(makeCtx({ roles: ["admin"] }))).toBe(true);
  });

  it("allows user with role as object with name property", () => {
    reflector.getAllAndOverride.mockReturnValue([{ resource: "posts", action: "read" }]);
    expect(guard.canActivate(makeCtx({ roles: [{ name: "admin" }] }))).toBe(true);
  });

  it("throws ForbiddenException when user lacks permission", () => {
    reflector.getAllAndOverride.mockReturnValue([{ resource: "posts", action: "delete" }]);
    expect(() => guard.canActivate(makeCtx({ roles: ["admin"] }))).toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when user has no roles", () => {
    reflector.getAllAndOverride.mockReturnValue([{ resource: "posts", action: "read" }]);
    expect(() => guard.canActivate(makeCtx({ roles: [] }))).toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when no user on request", () => {
    reflector.getAllAndOverride.mockReturnValue([{ resource: "posts", action: "read" }]);
    expect(() => guard.canActivate(makeCtx(null))).toThrow(ForbiddenException);
  });
});
