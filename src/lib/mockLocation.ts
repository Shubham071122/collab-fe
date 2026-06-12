if (typeof window !== "undefined") {
  try {
    const originalLocation = window.location;
    const locationMock = new Proxy(originalLocation, {
      get(target, prop) {
        if (prop === "hostname") {
          return "localhost";
        }
        const value = Reflect.get(target, prop);
        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
    Object.defineProperty(window, "location", {
      value: locationMock,
      configurable: true,
    });
  } catch (e) {
    console.error("Failed to mock location:", e);
  }
}
export {};
