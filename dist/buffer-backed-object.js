function O(t) {
  return typeof t == "symbol" ? !1 : !isNaN(t);
}
function z(t, e) {
  let i = t - t % e;
  return t % e != 0 && (i += e), i;
}
function h(t) {
  let e = 0;
  for (const { align: i = 1, size: r } of Object.values(t))
    e = z(e, i) + r;
  return e = z(e, B(t)), e;
}
function B(t) {
  return Math.max(...Object.values(t).map((e) => e.align ?? 1));
}
function U(t, e, { byteOffset: i = 0, length: r = 0, align: n = B(e) } = {}) {
  const o = new DataView(t, i);
  let c = 0;
  const u = {
    ...e
  };
  for (const [f, l] of Object.entries(u))
    u[f] = {
      ...l,
      offset: z(c, l.align ?? 1)
    }, c = u[f].offset + l.size;
  return c = z(c, n), r || (r = Math.floor((t.byteLength - i) / c)), new Proxy(new Array(r), {
    has(f, l) {
      return O(l) ? l < r : l === "buffer" ? !0 : l in f;
    },
    get(f, l, T) {
      if (l === "buffer")
        return t;
      if (!O(l)) {
        let x = f[l];
        return typeof x == "function" && (x = x.bind(T)), x;
      }
      const g = parseInt(l), I = g * c;
      if (!(g >= f.length)) {
        if (!f[g]) {
          f[g] = {};
          for (const [x, w] of Object.entries(u))
            "get" in w && Object.defineProperty(f[g], x, {
              enumerable: !0,
              get() {
                return w.get(o, I + w.offset);
              },
              set(j) {
                return w.set(
                  o,
                  I + w.offset,
                  j
                );
              }
            });
          Object.freeze(f[g]);
        }
        return f[g];
      }
    }
  });
}
function A(t, e, { byteOffset: i = 0, align: r = 1 } = {}) {
  return U(t, e, {
    byteOffset: i,
    align: r
  })[0];
}
function _({
  endianness: t = "little",
  align: e = 2
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "Uint16",
    align: e,
    size: Uint16Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getUint16(n, i),
    set: (r, n, o) => r.setUint16(n, o, i)
  };
}
function E({
  endianness: t = "little",
  align: e = 4
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "Uint32",
    align: e,
    size: Uint32Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getUint32(n, i),
    set: (r, n, o) => r.setUint32(n, o, i)
  };
}
function d({
  endianness: t = "little",
  align: e = 2
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "Int16",
    align: e,
    size: Int16Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getInt16(n, i),
    set: (r, n, o) => r.setInt16(n, o, i)
  };
}
function b({
  endianness: t = "little",
  align: e = 4
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "Int32",
    align: e,
    size: Int32Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getInt32(n, i),
    set: (r, n, o) => r.setInt32(n, o, i)
  };
}
function s({
  endianness: t = "little",
  align: e = 4
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "Float32",
    align: e,
    size: Float32Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getFloat32(n, i),
    set: (r, n, o) => r.setFloat32(n, o, i)
  };
}
function F({
  endianness: t = "little",
  align: e = 8
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "Float64",
    align: e,
    size: Float64Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getFloat64(n, i),
    set: (r, n, o) => r.setFloat64(n, o, i)
  };
}
function P({
  endianness: t = "little",
  align: e = 8
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "BigInt64",
    align: e,
    size: BigInt64Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getBigInt64(n, i),
    set: (r, n, o) => r.setBigInt64(n, o, i)
  };
}
function S({
  endianness: t = "little",
  align: e = 8
} = {}) {
  if (t !== "big" && t !== "little")
    throw Error("Endianness needs to be either 'big' or 'little'");
  const i = t === "little";
  return {
    type: "BigUint64",
    align: e,
    size: BigUint64Array.BYTES_PER_ELEMENT,
    get: (r, n) => r.getBigUint64(n, i),
    set: (r, n, o) => r.setBigUint64(n, o, i)
  };
}
function M() {
  return {
    type: "Uint8",
    align: 1,
    size: 1,
    get: (t, e) => t.getUint8(e),
    set: (t, e, i) => t.setUint8(e, i)
  };
}
function L() {
  return {
    type: "Int8",
    align: 1,
    size: 1,
    get: (t, e) => t.getInt8(e),
    set: (t, e, i) => t.setInt8(e, i)
  };
}
function y(t) {
  const e = h(t);
  return {
    type: "NestedBufferBackedObject",
    align: B(t),
    size: e,
    innerDescriptors: t,
    get: (i, r) => U(i.buffer, t, {
      byteOffset: i.byteOffset + r,
      length: 1
    })[0],
    set: (i, r, n) => {
      throw Error("Cannot set an entire struct");
    }
  };
}
function N(t, e) {
  const i = h(e) * t;
  return {
    type: "NestedArrayOfBufferBackedObjects",
    align: Object.values(e)[0].align ?? 1,
    size: i,
    innerDescriptors: e,
    get: (r, n) => U(r.buffer, e, {
      byteOffset: n + r.byteOffset,
      length: t
    }),
    set: (r, n, o) => {
      throw Error("Cannot set an entire array");
    }
  };
}
function R(t) {
  return {
    type: "UTF8String",
    align: 1,
    size: t,
    get: (e, i) => new TextDecoder().decode(new Uint8Array(e.buffer, i, t)).replace(/\u0000+$/, ""),
    set: (e, i, r) => {
      const n = new TextEncoder().encode(r), o = new Uint8Array(e.buffer, i, t);
      o.fill(0), o.set(n.subarray(0, t));
    }
  };
}
function Y(t) {
  return { type: "reserved", align: 1, size: t, get() {
  }, set() {
  } };
}
function k({
  endianness: t = "little",
  align: e = 4
} = {}) {
  const i = {
    x: s({ endianness: t, align: e }),
    y: s({ endianness: t, align: e })
  }, r = y(i);
  return {
    ...r,
    get: (n, o) => {
      const c = r.get(n, o);
      return new Proxy(c, {
        get(u, f) {
          return f === "r" ? u.x : f === "g" ? u.y : u[f];
        },
        set(u, f, l) {
          return f === "r" ? (u.x = l, !0) : f === "g" ? (u.y = l, !0) : (u[f] = l, !0);
        }
      });
    }
  };
}
function D({
  endianness: t = "little",
  align: e = 4
} = {}) {
  const i = {
    x: s({ endianness: t, align: e }),
    y: s({ endianness: t, align: e }),
    z: s({ endianness: t, align: e })
  }, r = y(i);
  return {
    ...r,
    get: (n, o) => {
      const c = r.get(n, o);
      return new Proxy(c, {
        get(u, f) {
          return f === "r" ? u.x : f === "g" ? u.y : f === "b" ? u.z : u[f];
        },
        set(u, f, l) {
          return f === "r" ? (u.x = l, !0) : f === "g" ? (u.y = l, !0) : f === "b" ? (u.z = l, !0) : (u[f] = l, !0);
        }
      });
    }
  };
}
function C({
  endianness: t = "little",
  align: e = 4
} = {}) {
  const i = {
    x: s({ endianness: t, align: e }),
    y: s({ endianness: t, align: e }),
    z: s({ endianness: t, align: e }),
    w: s({ endianness: t, align: e })
  }, r = y(i);
  return {
    ...r,
    get: (n, o) => {
      const c = r.get(n, o);
      return new Proxy(c, {
        get(u, f) {
          return f === "r" ? u.x : f === "g" ? u.y : f === "b" ? u.z : f === "a" ? u.w : u[f];
        },
        set(u, f, l) {
          return f === "r" ? (u.x = l, !0) : f === "g" ? (u.y = l, !0) : f === "b" ? (u.z = l, !0) : f === "a" ? (u.w = l, !0) : (u[f] = l, !0);
        }
      });
    }
  };
}
function V({
  endianness: t = "little",
  align: e = 4
} = {}) {
  return y({
    x: E({ endianness: t, align: e }),
    y: E({ endianness: t, align: e })
  });
}
function $({
  endianness: t = "little",
  align: e = 4
} = {}) {
  return y({
    x: E({ endianness: t, align: e }),
    y: E({ endianness: t, align: e }),
    z: E({ endianness: t, align: e })
  });
}
function q({
  endianness: t = "little",
  align: e = 4
} = {}) {
  return y({
    x: E({ endianness: t, align: e }),
    y: E({ endianness: t, align: e }),
    z: E({ endianness: t, align: e }),
    w: E({ endianness: t, align: e })
  });
}
function G({
  endianness: t = "little",
  align: e = 4
} = {}) {
  return y({
    x: b({ endianness: t, align: e }),
    y: b({ endianness: t, align: e })
  });
}
function H({
  endianness: t = "little",
  align: e = 4
} = {}) {
  return y({
    x: b({ endianness: t, align: e }),
    y: b({ endianness: t, align: e }),
    z: b({ endianness: t, align: e })
  });
}
function J({
  endianness: t = "little",
  align: e = 4
} = {}) {
  return y({
    x: b({ endianness: t, align: e }),
    y: b({ endianness: t, align: e }),
    z: b({ endianness: t, align: e }),
    w: b({ endianness: t, align: e })
  });
}
export {
  U as ArrayOfBufferBackedObjects,
  P as BigInt64,
  S as BigUint64,
  A as BufferBackedObject,
  s as Float32,
  k as Float32x2,
  D as Float32x3,
  C as Float32x4,
  F as Float64,
  d as Int16,
  b as Int32,
  G as Int32x2,
  H as Int32x3,
  J as Int32x4,
  L as Int8,
  N as NestedArrayOfBufferBackedObjects,
  y as NestedBufferBackedObject,
  R as UTF8String,
  _ as Uint16,
  E as Uint32,
  V as Uint32x2,
  $ as Uint32x3,
  q as Uint32x4,
  M as Uint8,
  z as nextAlign,
  Y as reserved,
  B as structAlign,
  h as structSize
};
