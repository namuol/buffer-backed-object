function B(t) {
  return typeof t == "symbol" ? !1 : !isNaN(t);
}
function a(t, e) {
  let n = t - t % e;
  return t % e != 0 && (n += e), n;
}
function U(t) {
  let e = 0;
  for (const { align: n = 1, size: i } of Object.values(t))
    e = a(e, n) + i;
  return e = a(e, b(t)), e;
}
function b(t) {
  return Math.max(...Object.values(t).map((e) => e.align ?? 1));
}
function y(t, e, { byteOffset: n = 0, length: i = 0, align: r = b(e) } = {}) {
  const l = new DataView(t, n);
  let u = 0;
  const g = {
    ...e
  };
  for (const [f, o] of Object.entries(g))
    g[f] = {
      ...o,
      offset: a(u, o.align ?? 1)
    }, u = g[f].offset + o.size;
  return u = a(u, r), i || (i = Math.floor((t.byteLength - n) / u)), new Proxy(new Array(i), {
    has(f, o) {
      return B(o) ? o < i : o === "buffer" ? !0 : o in f;
    },
    get(f, o, O) {
      if (o === "buffer")
        return t;
      if (!B(o)) {
        let E = f[o];
        return typeof E == "function" && (E = E.bind(O)), E;
      }
      const s = parseInt(o), d = s * u;
      if (!(s >= f.length)) {
        if (!f[s]) {
          f[s] = {};
          for (const [E, c] of Object.entries(g))
            "get" in c && Object.defineProperty(f[s], E, {
              enumerable: !0,
              get() {
                return c.get(l, d + c.offset);
              },
              set(h) {
                return c.set(
                  l,
                  d + c.offset,
                  h
                );
              }
            });
          Object.freeze(f[s]);
        }
        return f[s];
      }
    }
  });
}
function I(t, e, { byteOffset: n = 0, align: i = 1 } = {}) {
  return y(t, e, {
    byteOffset: n,
    align: i
  })[0];
}
function T({
  endianness: t = "little",
  align: e = 2
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "Uint16",
    align: e,
    size: Uint16Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getUint16(r, n),
    set: (i, r, l) => i.setUint16(r, l, n)
  };
}
function w({
  endianness: t = "little",
  align: e = 4
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "Uint32",
    align: e,
    size: Uint32Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getUint32(r, n),
    set: (i, r, l) => i.setUint32(r, l, n)
  };
}
function z({
  endianness: t = "little",
  align: e = 2
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "Int16",
    align: e,
    size: Int16Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getInt16(r, n),
    set: (i, r, l) => i.setInt16(r, l, n)
  };
}
function A({
  endianness: t = "little",
  align: e = 4
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "Int32",
    align: e,
    size: Int32Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getInt32(r, n),
    set: (i, r, l) => i.setInt32(r, l, n)
  };
}
function _({
  endianness: t = "little",
  align: e = 4
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "Float32",
    align: e,
    size: Float32Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getFloat32(r, n),
    set: (i, r, l) => i.setFloat32(r, l, n)
  };
}
function j({
  endianness: t = "little",
  align: e = 8
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "Float64",
    align: e,
    size: Float64Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getFloat64(r, n),
    set: (i, r, l) => i.setFloat64(r, l, n)
  };
}
function F({
  endianness: t = "little",
  align: e = 8
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "BigInt64",
    align: e,
    size: BigInt64Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getBigInt64(r, n),
    set: (i, r, l) => i.setBigInt64(r, l, n)
  };
}
function S({
  endianness: t = "little",
  align: e = 8
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const n = t === "little";
  return {
    type: "BigUint64",
    align: e,
    size: BigUint64Array.BYTES_PER_ELEMENT,
    get: (i, r) => i.getBigUint64(r, n),
    set: (i, r, l) => i.setBigUint64(r, l, n)
  };
}
function M() {
  return {
    type: "Uint8",
    align: 1,
    size: 1,
    get: (t, e) => t.getUint8(e),
    set: (t, e, n) => t.setUint8(e, n)
  };
}
function P() {
  return {
    type: "Int8",
    align: 1,
    size: 1,
    get: (t, e) => t.getInt8(e),
    set: (t, e, n) => t.setInt8(e, n)
  };
}
function L(t) {
  const e = U(t);
  return {
    type: "NestedBufferBackedObject",
    align: b(t),
    size: e,
    innerDescriptors: t,
    get: (n, i) => y(n.buffer, t, {
      byteOffset: n.byteOffset + i,
      length: 1
    })[0],
    set: (n, i, r) => {
      throw Error("Can’t set an entire struct");
    }
  };
}
function N(t, e) {
  const n = U(e) * t;
  return {
    type: "NestedArrayOfBufferBackedObjects",
    align: Object.values(e)[0].align ?? 1,
    size: n,
    innerDescriptors: e,
    get: (i, r) => y(i.buffer, e, {
      byteOffset: r + i.byteOffset,
      length: t
    }),
    set: (i, r, l) => {
      throw Error("Can’t set an entire array");
    }
  };
}
function p(t) {
  return {
    type: "UTF8String",
    align: 1,
    size: t,
    get: (e, n) => new TextDecoder().decode(new Uint8Array(e.buffer, n, t)).replace(/\u0000+$/, ""),
    set: (e, n, i) => {
      const r = new TextEncoder().encode(i), l = new Uint8Array(e.buffer, n, t);
      l.fill(0), l.set(r.subarray(0, t));
    }
  };
}
function v(t) {
  return { type: "reserved", align: 1, size: t, get() {
  }, set() {
  } };
}
export {
  y as ArrayOfBufferBackedObjects,
  F as BigInt64,
  S as BigUint64,
  I as BufferBackedObject,
  _ as Float32,
  j as Float64,
  z as Int16,
  A as Int32,
  P as Int8,
  N as NestedArrayOfBufferBackedObjects,
  L as NestedBufferBackedObject,
  p as UTF8String,
  T as Uint16,
  w as Uint32,
  M as Uint8,
  a as nextAlign,
  v as reserved,
  b as structAlign,
  U as structSize
};
