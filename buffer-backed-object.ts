export type Descriptor<T = any> = {
  type: string;
  size: number;
  align?: number;
  get(dataview: DataView, byteOffset: number): T;
  set(dataview: DataView, byteOffset: number, value: T): void;
  innerDescriptors?: Descriptors<any>;
};

export type ExtendedDescriptor<T = any> = Descriptor<T> & { offset: number };

export type Descriptors<T = Descriptor<any>> = {
  [key: string]: T;
};

export type DecodedBuffer<E extends Descriptors> = {
  [K in keyof E]: ReturnType<E[K]["get"]>;
};

/**
 * Returns `true` if `s` can be successfully coerced to a number.
 */
function isNumber(s: any): s is number {
  if (typeof s === "symbol") {
    return false;
  }
  return !isNaN(s);
}

/**
 * Returns the next integer bigger than `current` that has the desirged alignment.
 */
export function nextAlign(current: number, align: number): number {
  let aligned = current - (current % align);
  if (current % align != 0) {
    aligned += align;
  }
  return aligned;
}

export function structSize(descriptors: Descriptors): number {
  let stride = 0;
  for (const { align = 1, size } of Object.values(descriptors)) {
    stride = nextAlign(stride, align) + size;
  }
  stride = nextAlign(stride, structAlign(descriptors));
  return stride;
}

export function structAlign(descriptors: Descriptors): number {
  return Math.max(...Object.values(descriptors).map((d) => d.align ?? 1));
}

export function ArrayOfBufferBackedObjects<T extends Descriptors>(
  buffer: ArrayBuffer,
  descriptors: T,
  { byteOffset = 0, length = 0, align = structAlign(descriptors) } = {}
): Array<DecodedBuffer<T>> {
  const dataView = new DataView(buffer, byteOffset);
  let stride = 0;
  // Copy the descriptors.
  //
  // @ts-ignore We will fix up the missing `offset` below
  const extendedDescriptors: Descriptors<ExtendedDescriptor<any>> = {
    ...descriptors,
  };
  for (const [name, descriptor] of Object.entries(extendedDescriptors)) {
    extendedDescriptors[name] = {
      ...descriptor,
      offset: nextAlign(stride, descriptor.align ?? 1),
    };
    stride = extendedDescriptors[name].offset + descriptor.size;
  }
  stride = nextAlign(stride, align);
  if (!length) {
    length = Math.floor((buffer.byteLength - byteOffset) / stride);
  }

  return new Proxy(new Array(length), {
    has(target, propName) {
      // The underlying array is hole-y, but we want to pretend that it is not.
      // So we need to return `true` for all indices so that `map` et al. work
      // as expected.
      if (isNumber(propName)) {
        return propName < length;
      }
      if (propName === "buffer") {
        return true;
      }
      return propName in target;
    },
    get(target, propName, proxy) {
      if (propName === "buffer") {
        return buffer;
      }
      if (!isNumber(propName)) {
        let prop = target[propName];
        if (typeof prop === "function") {
          prop = prop.bind(proxy);
        }
        return prop;
      }
      const idx = parseInt(propName);
      const itemOffset = idx * stride;
      // Just like real arrays, we return `undefined`
      // outside the boundaries.
      if (idx >= target.length) {
        return undefined;
      }
      // If there is a hole at the given index, we need to create a new value
      // there that has the correct getter and setter functions.
      if (!target[idx]) {
        target[idx] = {};
        for (const [name, descriptor] of Object.entries(extendedDescriptors)) {
          if (!("get" in descriptor)) {
            continue;
          }
          Object.defineProperty(target[idx], name, {
            enumerable: true,
            get() {
              return descriptor.get(dataView, itemOffset + descriptor.offset);
            },
            set(value) {
              return descriptor.set(
                dataView,
                itemOffset + descriptor.offset,
                value
              );
            },
          });
        }
        Object.freeze(target[idx]);
      }
      return target[idx];
    },
  });
}

export function BufferBackedObject<T extends Descriptors>(
  buffer: ArrayBuffer,
  descriptors: T,
  { byteOffset = 0, align = 1 } = {}
): DecodedBuffer<T> {
  return ArrayOfBufferBackedObjects(buffer, descriptors, {
    byteOffset,
    align,
  })[0];
}

export interface EndiannessOption {
  endianness: "little" | "big";
}

export interface AlignOption {
  align: number;
}

export function Uint16({
  endianness = "little",
  align = 2,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "Uint16",
    align,
    size: Uint16Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) => dataView.getUint16(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setUint16(byteOffset, value, littleEndian),
  };
}

export function Uint32({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "Uint32",
    align,
    size: Uint32Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) => dataView.getUint32(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setUint32(byteOffset, value, littleEndian),
  };
}

export function Int16({
  endianness = "little",
  align = 2,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "Int16",
    align,
    size: Int16Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) => dataView.getInt16(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setInt16(byteOffset, value, littleEndian),
  };
}

export function Int32({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "Int32",
    align,
    size: Int32Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) => dataView.getInt32(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setInt32(byteOffset, value, littleEndian),
  };
}

export function Float32({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "Float32",
    align,
    size: Float32Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) =>
      dataView.getFloat32(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setFloat32(byteOffset, value, littleEndian),
  };
}

export function Float64({
  endianness = "little",
  align = 8,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<number> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "Float64",
    align,
    size: Float64Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) =>
      dataView.getFloat64(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setFloat64(byteOffset, value, littleEndian),
  };
}

export function BigInt64({
  endianness = "little",
  align = 8,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<bigint> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "BigInt64",
    align,
    size: BigInt64Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) =>
      dataView.getBigInt64(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setBigInt64(byteOffset, value, littleEndian),
  };
}

export function BigUint64({
  endianness = "little",
  align = 8,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<bigint> {
  if (endianness !== "big" && endianness !== "little") {
    throw Error("Endianness needs to be either 'big' or 'little'");
  }
  const littleEndian = endianness === "little";
  return {
    type: "BigUint64",
    align,
    size: BigUint64Array.BYTES_PER_ELEMENT,
    get: (dataView, byteOffset) =>
      dataView.getBigUint64(byteOffset, littleEndian),
    set: (dataView, byteOffset, value) =>
      dataView.setBigUint64(byteOffset, value, littleEndian),
  };
}

export function Uint8(): Descriptor<number> {
  return {
    type: "Uint8",
    align: 1,
    size: 1,
    get: (dataView, byteOffset) => dataView.getUint8(byteOffset),
    set: (dataView, byteOffset, value) => dataView.setUint8(byteOffset, value),
  };
}

export function Int8(): Descriptor<number> {
  return {
    type: "Int8",
    align: 1,
    size: 1,
    get: (dataView, byteOffset) => dataView.getInt8(byteOffset),
    set: (dataView, byteOffset, value) => dataView.setInt8(byteOffset, value),
  };
}

export function NestedBufferBackedObject<T extends Descriptors>(
  descriptors: T
): Descriptor<DecodedBuffer<T>> {
  const size = structSize(descriptors);
  return {
    type: "NestedBufferBackedObject",
    align: structAlign(descriptors),
    size,
    innerDescriptors: descriptors,
    get: (dataView, byteOffset) =>
      ArrayOfBufferBackedObjects(dataView.buffer, descriptors, {
        byteOffset: dataView.byteOffset + byteOffset,
        length: 1,
      })[0],
    set: (dataView, byteOffset, value) => {
      throw Error("Cannot set an entire struct");
    },
  };
}

export function NestedArrayOfBufferBackedObjects<T extends Descriptors>(
  length: number,
  descriptors: T
): Descriptor<Array<DecodedBuffer<T>>> {
  const size = structSize(descriptors) * length;
  return {
    type: "NestedArrayOfBufferBackedObjects",
    align: Object.values(descriptors)[0].align ?? 1,
    size,
    innerDescriptors: descriptors,
    get: (dataView, byteOffset) =>
      ArrayOfBufferBackedObjects(dataView.buffer, descriptors, {
        byteOffset: byteOffset + dataView.byteOffset,
        length,
      }),
    set: (dataView, byteOffset, value) => {
      throw Error("Cannot set an entire array");
    },
  };
}

export function UTF8String(maxBytes: number): Descriptor<string> {
  return {
    type: "UTF8String",
    align: 1,
    size: maxBytes,
    get: (dataView, byteOffset) =>
      new TextDecoder()
        .decode(new Uint8Array(dataView.buffer, byteOffset, maxBytes))
        .replace(/\u0000+$/, ""),
    set: (dataView, byteOffset, value) => {
      const encoding = new TextEncoder().encode(value);
      const target = new Uint8Array(dataView.buffer, byteOffset, maxBytes);
      target.fill(0);
      target.set(encoding.subarray(0, maxBytes));
    },
  };
}

export function reserved(size: number): Descriptor<void> {
  return { type: "reserved", align: 1, size, get() {}, set() {} };
}

export function Float32x2({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  r: number;
  g: number;
}> {
  const base = {
    x: Float32({ endianness, align }),
    y: Float32({ endianness, align }),
  };
  const descriptor = NestedBufferBackedObject(base);
  return {
    ...descriptor,
    get: (dataView, byteOffset) => {
      const obj = descriptor.get(dataView, byteOffset) as {
        x: number;
        y: number;
      };
      return new Proxy(obj, {
        get(target: { x: number; y: number }, prop: string | symbol) {
          if (prop === "r") return target.x;
          if (prop === "g") return target.y;
          return target[prop as keyof typeof target];
        },
        set(
          target: { x: number; y: number },
          prop: string | symbol,
          value: number
        ) {
          if (prop === "r") {
            target.x = value;
            return true;
          }
          if (prop === "g") {
            target.y = value;
            return true;
          }
          (target as any)[prop] = value;
          return true;
        },
      }) as { x: number; y: number; r: number; g: number };
    },
  };
}

export function Float32x3({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
}> {
  const base = {
    x: Float32({ endianness, align }),
    y: Float32({ endianness, align }),
    z: Float32({ endianness, align }),
  };
  const descriptor = NestedBufferBackedObject(base);
  return {
    ...descriptor,
    get: (dataView, byteOffset) => {
      const obj = descriptor.get(dataView, byteOffset) as {
        x: number;
        y: number;
        z: number;
      };
      return new Proxy(obj, {
        get(
          target: { x: number; y: number; z: number },
          prop: string | symbol
        ) {
          if (prop === "r") return target.x;
          if (prop === "g") return target.y;
          if (prop === "b") return target.z;
          return target[prop as keyof typeof target];
        },
        set(
          target: { x: number; y: number; z: number },
          prop: string | symbol,
          value: number
        ) {
          if (prop === "r") {
            target.x = value;
            return true;
          }
          if (prop === "g") {
            target.y = value;
            return true;
          }
          if (prop === "b") {
            target.z = value;
            return true;
          }
          (target as any)[prop] = value;
          return true;
        },
      }) as {
        x: number;
        y: number;
        z: number;
        r: number;
        g: number;
        b: number;
      };
    },
  };
}

export function Float32x4({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  z: number;
  w: number;
  r: number;
  g: number;
  b: number;
  a: number;
}> {
  const base = {
    x: Float32({ endianness, align }),
    y: Float32({ endianness, align }),
    z: Float32({ endianness, align }),
    w: Float32({ endianness, align }),
  };
  const descriptor = NestedBufferBackedObject(base);
  return {
    ...descriptor,
    get: (dataView, byteOffset) => {
      const obj = descriptor.get(dataView, byteOffset) as {
        x: number;
        y: number;
        z: number;
        w: number;
      };
      return new Proxy(obj, {
        get(
          target: { x: number; y: number; z: number; w: number },
          prop: string | symbol
        ) {
          if (prop === "r") return target.x;
          if (prop === "g") return target.y;
          if (prop === "b") return target.z;
          if (prop === "a") return target.w;
          return target[prop as keyof typeof target];
        },
        set(
          target: { x: number; y: number; z: number; w: number },
          prop: string | symbol,
          value: number
        ) {
          if (prop === "r") {
            target.x = value;
            return true;
          }
          if (prop === "g") {
            target.y = value;
            return true;
          }
          if (prop === "b") {
            target.z = value;
            return true;
          }
          if (prop === "a") {
            target.w = value;
            return true;
          }
          (target as any)[prop] = value;
          return true;
        },
      }) as {
        x: number;
        y: number;
        z: number;
        w: number;
        r: number;
        g: number;
        b: number;
        a: number;
      };
    },
  };
}

export function Uint32x2({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
}> {
  return NestedBufferBackedObject({
    x: Uint32({ endianness, align }),
    y: Uint32({ endianness, align }),
  });
}

export function Uint32x3({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  z: number;
}> {
  return NestedBufferBackedObject({
    x: Uint32({ endianness, align }),
    y: Uint32({ endianness, align }),
    z: Uint32({ endianness, align }),
  });
}

export function Uint32x4({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  z: number;
  w: number;
}> {
  return NestedBufferBackedObject({
    x: Uint32({ endianness, align }),
    y: Uint32({ endianness, align }),
    z: Uint32({ endianness, align }),
    w: Uint32({ endianness, align }),
  });
}

export function Int32x2({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
}> {
  return NestedBufferBackedObject({
    x: Int32({ endianness, align }),
    y: Int32({ endianness, align }),
  });
}

export function Int32x3({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  z: number;
}> {
  return NestedBufferBackedObject({
    x: Int32({ endianness, align }),
    y: Int32({ endianness, align }),
    z: Int32({ endianness, align }),
  });
}

export function Int32x4({
  endianness = "little",
  align = 4,
}: Partial<EndiannessOption & AlignOption> = {}): Descriptor<{
  x: number;
  y: number;
  z: number;
  w: number;
}> {
  return NestedBufferBackedObject({
    x: Int32({ endianness, align }),
    y: Int32({ endianness, align }),
    z: Int32({ endianness, align }),
    w: Int32({ endianness, align }),
  });
}
