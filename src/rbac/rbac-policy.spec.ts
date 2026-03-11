import { canAccessAllRequirements, ModuleRbacPolicy } from "./rbac-policy";

describe("canAccessAllRequirements", () => {
  const policy: ModuleRbacPolicy = {
    module: "posts",
    grants: [
      { roles: ["admin"], actions: ["create", "read", "update", "delete"], resources: ["posts"] },
      { roles: ["admin"], action: "manage", resources: ["*"] },
      { roles: ["editor"], actions: ["create", "update"], resources: ["posts"] },
      { roles: ["viewer"], action: "read", resources: ["posts"] },
    ],
  };

  it("returns true when no requirements", () => {
    expect(canAccessAllRequirements(["user"], [], [policy])).toBe(true);
  });

  it("returns false when no user roles", () => {
    expect(canAccessAllRequirements([], [{ resource: "posts", action: "read" }], [policy])).toBe(false);
  });

  it("allows exact action on resource", () => {
    expect(canAccessAllRequirements(["viewer"], [{ resource: "posts", action: "read" }], [policy])).toBe(true);
  });

  it("denies wrong action", () => {
    expect(canAccessAllRequirements(["viewer"], [{ resource: "posts", action: "delete" }], [policy])).toBe(false);
  });

  it("denies wrong resource", () => {
    expect(canAccessAllRequirements(["viewer"], [{ resource: "comments", action: "read" }], [policy])).toBe(false);
  });

  it("allows manage wildcard", () => {
    expect(canAccessAllRequirements(["admin"], [{ resource: "anything", action: "delete" }], [policy])).toBe(true);
  });

  it("enforces AND logic for multiple requirements", () => {
    expect(
      canAccessAllRequirements(
        ["editor"],
        [
          { resource: "posts", action: "create" },
          { resource: "posts", action: "delete" },
        ],
        [policy],
      ),
    ).toBe(false);
  });

  it("passes all requirements for admin", () => {
    expect(
      canAccessAllRequirements(
        ["admin"],
        [
          { resource: "posts", action: "create" },
          { resource: "posts", action: "delete" },
        ],
        [policy],
      ),
    ).toBe(true);
  });

  it("role not in policy is denied", () => {
    expect(canAccessAllRequirements(["ghost"], [{ resource: "posts", action: "read" }], [policy])).toBe(false);
  });
});
