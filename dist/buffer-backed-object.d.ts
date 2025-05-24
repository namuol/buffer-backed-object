declare module "buffer-backed-object" {
    export type Descriptor<T = any> = {
        type: string;
        size: number;
        align?: number;
        get(dataview: DataView, byteOffset: number): T;
        set(dataview: DataView, byteOffset: number, value: T): void;
        innerDescriptors?: Descriptors<any>;
    };
    export type ExtendedDescriptor<T = any> = Descriptor<T> & {
        offset: number;
    };
    export type Descriptors<T = Descriptor<any>> = {
        [key: string]: T;
    };
    export type DecodedBuffer<E extends Descriptors> = {
        [K in keyof E]: ReturnType<E[K]["get"]>;
    };
    /**
     * Returns the next integer bigger than `current` that has the desirged alignment.
     */
    export function nextAlign(current: number, align: number): number;
    export function structSize(descriptors: Descriptors): number;
    export function structAlign(descriptors: Descriptors): number;
    export function ArrayOfBufferBackedObjects<T extends Descriptors>(buffer: ArrayBuffer, descriptors: T, { byteOffset, length, align }?: {
        byteOffset?: number;
        length?: number;
        align?: number;
    }): Array<DecodedBuffer<T>>;
    export function BufferBackedObject<T extends Descriptors>(buffer: ArrayBuffer, descriptors: T, { byteOffset, align }?: {
        byteOffset?: number;
        align?: number;
    }): DecodedBuffer<T>;
    export interface EndiannessOption {
        endianness: "little" | "big";
    }
    export interface AlignOption {
        align: number;
    }
    export function Uint16({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<number>;
    export function Uint32({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<number>;
    export function Int16({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<number>;
    export function Int32({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<number>;
    export function Float32({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<number>;
    export function Float64({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<number>;
    export function BigInt64({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<bigint>;
    export function BigUint64({ endianness, align, }?: Partial<EndiannessOption & AlignOption>): Descriptor<bigint>;
    export function Uint8(): Descriptor<number>;
    export function Int8(): Descriptor<number>;
    export function NestedBufferBackedObject<T extends Descriptors>(descriptors: T): Descriptor<DecodedBuffer<T>>;
    export function NestedArrayOfBufferBackedObjects<T extends Descriptors>(length: number, descriptors: T): Descriptor<Array<DecodedBuffer<T>>>;
    export function UTF8String(maxBytes: number): Descriptor<string>;
    export function reserved(size: number): Descriptor<void>;
}
