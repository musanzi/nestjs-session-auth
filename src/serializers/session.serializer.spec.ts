import "reflect-metadata";
import { DefaultSessionSerializer } from "./session.serializer";

describe("DefaultSessionSerializer", () => {
  let serializer: DefaultSessionSerializer;

  beforeEach(() => {
    serializer = new DefaultSessionSerializer();
  });

  it("serializeUser calls done with null error and user", () => {
    const done = jest.fn();
    const user = { id: 1 };
    serializer.serializeUser(user, done);
    expect(done).toHaveBeenCalledWith(null, user);
  });

  it("deserializeUser calls done with null error and payload", () => {
    const done = jest.fn();
    const payload = { id: 1 };
    serializer.deserializeUser(payload, done);
    expect(done).toHaveBeenCalledWith(null, payload);
  });
});
