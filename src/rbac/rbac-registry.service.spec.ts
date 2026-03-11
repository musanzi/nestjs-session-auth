import { RbacRegistryService } from "./rbac-registry.service";
import { ModuleRbacPolicy } from "./rbac-policy";

describe("RbacRegistryService", () => {
  let service: RbacRegistryService;

  beforeEach(() => {
    service = new RbacRegistryService();
  });

  it("starts with empty policies", () => {
    expect(service.getPolicies()).toEqual([]);
  });

  it("registers and retrieves a policy", () => {
    const p: ModuleRbacPolicy = { module: "test", grants: [] };
    service.register(p);
    expect(service.getPolicies()).toContain(p);
  });

  it("stores multiple policies", () => {
    const p1: ModuleRbacPolicy = { module: "a", grants: [] };
    const p2: ModuleRbacPolicy = { module: "b", grants: [] };
    service.register(p1);
    service.register(p2);
    expect(service.getPolicies()).toHaveLength(2);
  });

  it("overwrites duplicate module key", () => {
    const p1: ModuleRbacPolicy = { module: "x", grants: [] };
    const p2: ModuleRbacPolicy = {
      module: "x",
      grants: [{ roles: ["admin"], action: "read", resources: ["x"] }],
    };
    service.register(p1);
    service.register(p2);
    const all = service.getPolicies();
    expect(all).toHaveLength(1);
    expect(all[0].grants).toHaveLength(1);
  });
});
