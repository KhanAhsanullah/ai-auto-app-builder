'use strict';

/**
 * Minimal crypto shim for Metro — ConfigProvider / modules may import `crypto`.
 * Demo host uses in-memory ids; this is not a secure crypto implementation.
 */
function randomUUID() {
  return `uuid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function randomBytes(size) {
  const out = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) {
    out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

module.exports = {
  randomUUID,
  randomBytes,
  createHash() {
    return {
      update() {
        return this;
      },
      digest() {
        return 'shim-digest';
      },
    };
  },
};
