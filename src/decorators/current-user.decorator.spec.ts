import "reflect-metadata";
import { ExecutionContext } from "@nestjs/common";

const makeCtx = (user: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  }) as unknown as ExecutionContext;

describe("CurrentUser decorator factory", () => {
  const loadFactory = () => {
    jest.resetModules();
    const captured: { fn?: (key: string | undefined, ctx: ExecutionContext) => unknown } = {};

    jest.doMock("@nestjs/common", () => {
      const actual = jest.requireActual("@nestjs/common");
      return {
        ...actual,
        createParamDecorator: (fn: (key: string | undefined, ctx: ExecutionContext) => unknown) => {
          captured.fn = fn;
          return jest.fn();
        },
      };
    });

    jest.isolateModules(() => {
      require("./current-user.decorator");
    });

    jest.dontMock("@nestjs/common");
    return captured.fn!;
  };

  it("returns full user when no key", () => {
    const factory = loadFactory();
    const user = { id: 1, email: "a@b.com" };
    expect(factory(undefined, makeCtx(user))).toEqual(user);
  });

  it("returns specific property when key provided", () => {
    const factory = loadFactory();
    const user = { id: 1, email: "a@b.com" };
    expect(factory("email", makeCtx(user))).toBe("a@b.com");
  });

  it("returns undefined when user is undefined", () => {
    const factory = loadFactory();
    expect(factory(undefined, makeCtx(undefined))).toBeUndefined();
  });

  it("returns undefined when key is missing from user", () => {
    const factory = loadFactory();
    expect(factory("name", makeCtx({ id: 1 }))).toBeUndefined();
  });
});
