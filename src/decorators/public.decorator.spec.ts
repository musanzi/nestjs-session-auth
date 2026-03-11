import { IS_PUBLIC_KEY, Public } from "./public.decorator";
import { Reflector } from "@nestjs/core";

describe("Public decorator", () => {
  it("IS_PUBLIC_KEY has the correct value", () => {
    expect(IS_PUBLIC_KEY).toBe("session_auth:isPublic");
  });

  it("sets IS_PUBLIC_KEY = true metadata on a class", () => {
    @Public()
    class TestHandler {}

    const value = Reflector.createDecorator<boolean>();
    const meta = Reflect.getMetadata(IS_PUBLIC_KEY, TestHandler);
    expect(meta).toBe(true);
  });
});
