import "reflect-metadata";
import { ROLE_REQUIREMENTS_KEY, Rbac } from "./rbac.decorator";
import { RoleRequirement } from "../rbac/rbac-policy";

describe("Rbac decorator", () => {
  it("ROLE_REQUIREMENTS_KEY has correct value", () => {
    expect(ROLE_REQUIREMENTS_KEY).toBe("session_auth:roleRequirements");
  });

  it("sets requirements metadata on a class", () => {
    const req: RoleRequirement = { resource: "posts", action: "read" };

    @Rbac(req)
    class TestHandler {}

    const meta = Reflect.getMetadata(ROLE_REQUIREMENTS_KEY, TestHandler);
    expect(meta).toEqual([req]);
  });

  it("sets multiple requirements as an array", () => {
    const r1: RoleRequirement = { resource: "posts", action: "read" };
    const r2: RoleRequirement = { resource: "posts", action: "delete" };

    @Rbac(r1, r2)
    class TestHandler {}

    const meta = Reflect.getMetadata(ROLE_REQUIREMENTS_KEY, TestHandler);
    expect(meta).toEqual([r1, r2]);
  });
});
