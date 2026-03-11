import "reflect-metadata";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SessionAuthGuard } from "./session-auth.guard";

const makeCtx = (isAuthenticated: boolean): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ isAuthenticated: () => isAuthenticated }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
  }) as unknown as ExecutionContext;

describe("SessionAuthGuard", () => {
  let guard: SessionAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new SessionAuthGuard(reflector);
  });

  it("returns true for public routes", () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(guard.canActivate(makeCtx(false))).toBe(true);
  });

  it("returns true for authenticated users on protected routes", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    expect(guard.canActivate(makeCtx(true))).toBe(true);
  });

  it("throws UnauthorizedException for unauthenticated requests", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    expect(() => guard.canActivate(makeCtx(false))).toThrow(UnauthorizedException);
  });

  it("defaults to protected when reflector returns undefined", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(() => guard.canActivate(makeCtx(false))).toThrow(UnauthorizedException);
  });
});
