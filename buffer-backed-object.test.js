import { expect, test } from "vitest";

import * as BBO from "./buffer-backed-object.ts";

test("structSize calculates the size of a struct correctly", function () {
  {
    const size = BBO.structSize({
      id: BBO.Uint8(),
    });
    expect(size).toBe(1);
  }

  {
    const size = BBO.structSize({
      id: BBO.Uint16(),
    });
    expect(size).toBe(2);
  }

  {
    const size = BBO.structSize({
      id: BBO.Uint16(),
      id2: BBO.Uint8(),
    });
    expect(size).toBe(4);
  }

  {
    const size = BBO.structSize({
      id: BBO.Uint8(),
      id2: BBO.Uint16(),
    });
    expect(size).toBe(4);
  }

  {
    const size = BBO.structSize({
      id: BBO.Uint8(),
      id2: BBO.Uint32(),
      id3: BBO.Uint32(),
    });
    expect(size).toBe(12);
  }

  {
    const size = BBO.structSize({
      id: BBO.Uint8(), // 0...7
      x: BBO.Float64({ endianness: "big" }), // 8...15
      y: BBO.Float64({ endianness: "little" }), // 16...23
      texture: BBO.Int32(), // 24...28
      _: BBO.reserved(1), // 28...29
    });
    expect(size).toBe(32);
  }
});

test("ArrayOfBufferBackedObjects calculates length correctly", function () {
  {
    const buffer = new ArrayBuffer(7);
    const aosv = BBO.ArrayOfBufferBackedObjects(buffer, {
      id: BBO.Uint8(),
      _: BBO.reserved(1),
    });
    expect(aosv.length).toBe(3);
  }

  {
    const buffer = new ArrayBuffer(47);
    const aosv = BBO.ArrayOfBufferBackedObjects(buffer, {
      id: BBO.Uint8(),
      i2: BBO.BigInt64(),
    });
    expect(aosv.length).toBe(2);
  }
});

test("ArrayOfBufferBackedObjects decodes items correctly", function () {
  const descriptor = {
    id: BBO.Uint8(), // 0...7
    x: BBO.Float64({ endianness: "big" }), // 8...15
    y: BBO.Float64({ endianness: "little" }), // 16...23
    texture: BBO.Int32(), // 24...27
    _: BBO.reserved(1), // 28...29
  };

  console.log(BBO.structSize(descriptor), BBO.structAlign(descriptor));
  const buffer = new ArrayBuffer(BBO.structSize(descriptor) * 2);
  const dataView = new DataView(buffer);
  dataView.setUint8(0 + 0, 1);
  dataView.setUint8(32 + 0, 2);
  dataView.setFloat64(0 + 8, 20, false);
  dataView.setFloat64(0 + 16, 30, true);
  dataView.setFloat64(32 + 8, 40, false);
  dataView.setFloat64(32 + 16, 50, true);
  dataView.setInt32(0 + 24, 9, true);
  dataView.setInt32(32 + 24, 10, true);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptor);
  expect(aosv[0].id).toBe(1);
  expect(aosv[1].id).toBe(2);
  expect(aosv[0].x).toBe(20);
  expect(aosv[1].x).toBe(40);
  expect(aosv[0].y).toBe(30);
  expect(aosv[1].y).toBe(50);
  expect(aosv[0].texture).toBe(9);
  expect(aosv[1].texture).toBe(10);
});

test("ArrayOfBufferBackedObjects can have an offset", function () {
  const descriptor = {
    id: BBO.Uint8(),
    _: BBO.reserved(1),
  };
  const buffer = new ArrayBuffer(BBO.structSize(descriptor) * 4 + 1);
  const dataView = new DataView(buffer);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptor, {
    byteOffset: 1,
    length: 2,
  });
  expect(aosv.length).toBe(2);
  aosv[0].id = 1;
  aosv[1].id = 1;
  expect(dataView.getUint8(1)).toBe(1);
});

test("ArrayOfBufferBackedObjects handles nested Array of BBOs", function () {
  const descriptors = {
    id: BBO.Uint8(),
    vertices: BBO.NestedArrayOfBufferBackedObjects(3, {
      x: BBO.Float64(),
      y: BBO.Float64(),
    }),
  };
  const buffer = new ArrayBuffer(BBO.structSize(descriptors) * 3);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptors);
  expect(aosv.length).toBe(3);
  aosv[2].id = 1;
  aosv[2].vertices[0].x = 0;
  aosv[2].vertices[0].y = 1;
  aosv[2].vertices[1].x = 2;
  aosv[2].vertices[1].y = 3;
  aosv[2].vertices[2].x = 4;
  aosv[2].vertices[2].y = 5;
  expect(aosv.length).toBe(3);
  expect(JSON.stringify(aosv[2])).toBe(
    JSON.stringify({
      id: 1,
      vertices: [
        { x: 0, y: 1 },
        { x: 2, y: 3 },
        { x: 4, y: 5 },
      ],
    })
  );
});

test("ArrayOfBufferBackedObjects handles nested BBO", function () {
  const descriptors = {
    id: BBO.Uint8(),
    pos: BBO.NestedBufferBackedObject({
      x: BBO.Float64(),
      y: BBO.Float64(),
    }),
  };
  const buffer = new ArrayBuffer(BBO.structSize(descriptors) * 3);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptors);
  expect(aosv.length).toBe(3);
  aosv[2].id = 1;
  aosv[2].pos.x = 3;
  aosv[2].pos.y = 2;
  expect(aosv.length).toBe(3);
  expect(JSON.stringify(aosv[2])).toBe(
    JSON.stringify({ id: 1, pos: { x: 3, y: 2 } })
  );
  expect(JSON.stringify(aosv)).toBe(
    JSON.stringify([
      { id: 0, pos: { x: 0, y: 0 } },
      { id: 0, pos: { x: 0, y: 0 } },
      { id: 1, pos: { x: 3, y: 2 } },
    ])
  );
});

test("ArrayOfBufferBackedObjects handles nested BBO with nested arrays", function () {
  const PathNodeDescription = {
    type: BBO.Uint8(),
    x: BBO.Uint32(),
    y: BBO.Uint32(),
  };

  const EnemyDescription = {
    type: BBO.Uint8(),
    x: BBO.Float32(),
    y: BBO.Float32(),
    path: BBO.NestedArrayOfBufferBackedObjects(1, PathNodeDescription),
  };

  const GameStateDescription = {
    gametime: BBO.Uint32(),
    season: BBO.Uint8(),
    enemies: BBO.NestedArrayOfBufferBackedObjects(1, EnemyDescription),
  };
  const gameStateBuffer = new ArrayBuffer(BBO.structSize(GameStateDescription));
  const gameState = BBO.BufferBackedObject(
    gameStateBuffer,
    GameStateDescription
  );

  gameState.gametime = 12345;
  gameState.season = 3;

  expect(gameState.enemies.length).toBe(1);
  gameState.enemies[0].type = 1;
  gameState.enemies[0].x = 512;
  gameState.enemies[0].y = 0;
  expect(gameState.enemies.length).toBe(1);
  expect(JSON.stringify(gameState.enemies[0])).toBe(
    JSON.stringify({ type: 1, x: 512, y: 0, path: [{ type: 0, x: 0, y: 0 }] })
  );
  expect(JSON.stringify(gameState)).toBe(
    JSON.stringify({
      gametime: 12345,
      season: 3,
      enemies: [{ type: 1, x: 512, y: 0, path: [{ type: 0, x: 0, y: 0 }] }],
    })
  );
});

test("ArrayOfBufferBackedObjects can return the buffer", function () {
  const buffer = new ArrayBuffer(22);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, {
    x: BBO.Uint8(),
  });
  expect(aosv.buffer).toBe(buffer);
});

test("ArrayOfBufferBackedObjects encodes to JSON", function () {
  const { buffer } = new Uint8Array([0, 0, 1, 0, 2, 0, 1]);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, {
    id: BBO.Uint8(),
    _: BBO.reserved(1),
  });
  expect(JSON.stringify(aosv)).toBe(
    JSON.stringify([{ id: 0 }, { id: 1 }, { id: 2 }])
  );
});

test("ArrayOfBufferBackedObjects can write items", function () {
  const descriptor = {
    id: BBO.Uint8(),
    x: BBO.Float64(),
    _: BBO.reserved(1),
  };
  const buffer = new ArrayBuffer(BBO.structSize(descriptor) * 2);
  const dataView = new DataView(buffer);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptor);
  aosv[0].x = 10;
  aosv[1].x = 20;
  expect(dataView.getFloat64(8, true)).toBe(10);
  expect(dataView.getFloat64(32, true)).toBe(20);
});

test("ArrayOfBufferBackedObjects handles filter()", function () {
  const descriptor = {
    id: BBO.Uint8(),
    data: BBO.Uint8(),
  };
  const { buffer } = new Uint8Array([0, 10, 1, 11, 2, 12, 3, 13]);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptor);
  const even = aosv.filter(({ id }) => id % 2 == 0);
  expect(even.length).toBe(2);
  even[1].data = 99;
  expect(aosv[2].data).toBe(99);
});

test("ArrayOfBufferBackedObjects rejects new properties", function () {
  const descriptor = {
    id: BBO.Uint8(),
    data: BBO.Uint8(),
  };
  const { buffer } = new Uint8Array([0, 10, 1, 11, 2, 12, 3, 13]);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptor);
  expect(() => {
    aosv[0].lol = 4;
  }).toThrow();
});

test("ArrayOfBufferBackedObjects can handle UTF8 strings", function () {
  const descriptor = {
    name: BBO.UTF8String(32),
    id: BBO.Uint8(),
  };
  const buffer = new ArrayBuffer(BBO.structSize(descriptor) * 2);
  const aosv = BBO.ArrayOfBufferBackedObjects(buffer, descriptor);
  aosv[0].name = "Surma";
  aosv[1].name = "Jason";
  const name1 = new TextDecoder().decode(new Uint8Array(buffer, 0, 5));
  const name2 = new TextDecoder().decode(new Uint8Array(buffer, 33, 5));
  expect(name1).toBe("Surma");
  expect(name2).toBe("Jason");
});

test("BufferBackedObject decodes items correctly", function () {
  const descriptor = {
    id: BBO.Uint8(),
    x: BBO.Float64({ endianness: "big" }),
    y: BBO.Float64({ endianness: "little" }),
    texture: BBO.Int32(),
    _: BBO.reserved(1),
  };

  const buffer = new ArrayBuffer(BBO.structSize(descriptor));
  const dataView = new DataView(buffer);
  dataView.setUint8(0 + 0, 1);
  dataView.setFloat64(0 + 8, 20, false);
  dataView.setFloat64(0 + 16, 30, true);
  dataView.setInt32(0 + 24, 9, true);
  const sdv = BBO.BufferBackedObject(buffer, descriptor);
  expect(sdv.id).toBe(1);
  expect(sdv.x).toBe(20);
  expect(sdv.y).toBe(30);
  expect(sdv.texture).toBe(9);
});

test("BufferBackedObject decodes items correctly with custom align", function () {
  const descriptor = {
    id: BBO.Uint8(),
    x: BBO.Float64({ endianness: "big", align: 1 }),
    y: BBO.Float64({ endianness: "little", align: 1 }),
    texture: BBO.Int32({ align: 1 }),
    _: BBO.reserved(1),
  };

  const buffer = new ArrayBuffer(BBO.structSize(descriptor));
  const dataView = new DataView(buffer);
  dataView.setUint8(0 + 0, 1);
  dataView.setFloat64(0 + 1, 20, false);
  dataView.setFloat64(0 + 9, 30, true);
  dataView.setInt32(0 + 17, 9, true);
  const sdv = BBO.BufferBackedObject(buffer, descriptor);
  expect(sdv.id).toBe(1);
  expect(sdv.x).toBe(20);
  expect(sdv.y).toBe(30);
  expect(sdv.texture).toBe(9);
});

test("NestedArrayOfBufferBackedObjects test raw bufferview", function () {
  const BBOVec3 = BBO.NestedBufferBackedObject({
    x: BBO.Float32(),
    y: BBO.Float32(),
    z: BBO.Float32(),
  });
  const structDesc = {
    ambient: BBOVec3,
    lightCount: BBO.Float32(),
    lights: BBO.NestedArrayOfBufferBackedObjects(1, {
      position: BBOVec3,
      range: BBO.Float32(),
      color: BBOVec3,
      intensity: BBO.Float32(),
    }),
  };
  const buffer = new ArrayBuffer(BBO.structSize(structDesc));
  const view = BBO.BufferBackedObject(buffer, structDesc);
  view.ambient.x = 1;
  view.ambient.y = 2;
  view.ambient.z = 3;
  view.lightCount = 4;
  view.lights.forEach(light => {
    light.position.x = 5;
    light.position.y = 6;
    light.position.z = 7;
    light.range = 8;
    light.color.x = 9;
    light.color.y = 10;
    light.color.z = 11;
    light.intensity = 12;
  });
  const f32 = new Float32Array(buffer);

  expect(f32[0]).toBe(1);
  expect(f32[1]).toBe(2);
  expect(f32[2]).toBe(3);
  expect(f32[3]).toBe(4);
  expect(f32[4]).toBe(5);
  expect(f32[5]).toBe(6);
  expect(f32[6]).toBe(7);
  expect(f32[7]).toBe(8);
  expect(f32[8]).toBe(9);
  expect(f32[9]).toBe(10);
  expect(f32[10]).toBe(11);
  expect(f32[11]).toBe(12);
});

test("Nested NestedBufferBackedObjects", function () {
  const structDesc = {
    somethingElse: BBO.Float32(),
    nest1: BBO.NestedBufferBackedObject({
      somethingElse: BBO.Float32(),
      nest2: BBO.NestedBufferBackedObject( {
        value: BBO.Float32()
      })
    }),
  };
  const buffer = new ArrayBuffer(BBO.structSize(structDesc));
  const view = BBO.BufferBackedObject(buffer, structDesc);
  view.somethingElse = 1;
  view.nest1.somethingElse = 2;
  view.nest1.nest2.value = 3;
  const f32 = new Float32Array(buffer);

  expect(f32[0]).toBe(1);
  expect(f32[1]).toBe(2);
  expect(f32[2]).toBe(3);
});

test("Vector types work correctly", function () {
  const descriptors = {
    vec2: BBO.Float32x2(),
    vec3: BBO.Float32x3(),
    vec4: BBO.Float32x4(),
    uvec2: BBO.Uint32x2(),
    uvec3: BBO.Uint32x3(),
    uvec4: BBO.Uint32x4(),
    ivec2: BBO.Int32x2(),
    ivec3: BBO.Int32x3(),
    ivec4: BBO.Int32x4(),
  };

  const buffer = new ArrayBuffer(BBO.structSize(descriptors));
  const view = BBO.BufferBackedObject(buffer, descriptors);

  // Test Float32 vectors
  view.vec2.x = 1;
  view.vec2.y = 2;
  expect(view.vec2.x).toBe(1);
  expect(view.vec2.y).toBe(2);
  expect(view.vec2.r).toBe(1); // Test color alias
  expect(view.vec2.g).toBe(2); // Test color alias

  view.vec3.x = 3;
  view.vec3.y = 4;
  view.vec3.z = 5;
  expect(view.vec3.x).toBe(3);
  expect(view.vec3.y).toBe(4);
  expect(view.vec3.z).toBe(5);
  expect(view.vec3.r).toBe(3); // Test color alias
  expect(view.vec3.g).toBe(4); // Test color alias
  expect(view.vec3.b).toBe(5); // Test color alias

  view.vec4.x = 6;
  view.vec4.y = 7;
  view.vec4.z = 8;
  view.vec4.w = 9;
  expect(view.vec4.x).toBe(6);
  expect(view.vec4.y).toBe(7);
  expect(view.vec4.z).toBe(8);
  expect(view.vec4.w).toBe(9);
  expect(view.vec4.r).toBe(6); // Test color alias
  expect(view.vec4.g).toBe(7); // Test color alias
  expect(view.vec4.b).toBe(8); // Test color alias
  expect(view.vec4.a).toBe(9); // Test color alias

  // Test Uint32 vectors
  view.uvec2.x = 10;
  view.uvec2.y = 11;
  expect(view.uvec2.x).toBe(10);
  expect(view.uvec2.y).toBe(11);

  view.uvec3.x = 12;
  view.uvec3.y = 13;
  view.uvec3.z = 14;
  expect(view.uvec3.x).toBe(12);
  expect(view.uvec3.y).toBe(13);
  expect(view.uvec3.z).toBe(14);

  view.uvec4.x = 15;
  view.uvec4.y = 16;
  view.uvec4.z = 17;
  view.uvec4.w = 18;
  expect(view.uvec4.x).toBe(15);
  expect(view.uvec4.y).toBe(16);
  expect(view.uvec4.z).toBe(17);
  expect(view.uvec4.w).toBe(18);

  // Test Int32 vectors
  view.ivec2.x = -1;
  view.ivec2.y = -2;
  expect(view.ivec2.x).toBe(-1);
  expect(view.ivec2.y).toBe(-2);

  view.ivec3.x = -3;
  view.ivec3.y = -4;
  view.ivec3.z = -5;
  expect(view.ivec3.x).toBe(-3);
  expect(view.ivec3.y).toBe(-4);
  expect(view.ivec3.z).toBe(-5);

  view.ivec4.x = -6;
  view.ivec4.y = -7;
  view.ivec4.z = -8;
  view.ivec4.w = -9;
  expect(view.ivec4.x).toBe(-6);
  expect(view.ivec4.y).toBe(-7);
  expect(view.ivec4.z).toBe(-8);
  expect(view.ivec4.w).toBe(-9);
});
