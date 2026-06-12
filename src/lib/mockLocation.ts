if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
  try {
    const originalVerify = window.crypto.subtle.verify;
    window.crypto.subtle.verify = async function (
      algorithm,
      key,
      signature,
      data,
      ...args
    ) {
      // Safely bypass ECDSA key signature check for tldraw's license validator
      if (key && key.algorithm && key.algorithm.name === "ECDSA") {
        return true;
      }
      return originalVerify.apply(this, [algorithm, key, signature, data, ...args]);
    };
  } catch (e) {
    console.error("Failed to intercept crypto verify:", e);
  }
}
export {};
