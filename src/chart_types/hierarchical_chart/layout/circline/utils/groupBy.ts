import { Relation } from '../types/Types';

export const aggregateKey = 'value'; // todo later switch back to 'aggregate'
export const depthKey = 'depth';
export const childrenKey = 'children';

interface NodeDescriptor {
  [aggregateKey]: number;
  [depthKey]: number;
}

export type ArrayEntry = [Key, ArrayNode];
export type HierarchyOfArrays = Array<ArrayEntry>;
interface ArrayNode extends NodeDescriptor {
  [childrenKey]?: HierarchyOfArrays;
}

type HierarchyOfMaps = Map<Key, MapNode>;
interface MapNode extends NodeDescriptor {
  [childrenKey]?: HierarchyOfMaps;
}

export type PrimitiveValue = string | number | null; // there could be more but sufficient for now
type Key = PrimitiveValue;
type Sorter = (a: number, b: number) => number;
type NodeSorter = (a: ArrayEntry, b: ArrayEntry) => number;

export type Tuple = Record<string, any>; // this is a row like {country: 'US', gdp: 20392090, ...} from ES; we don't know its properties, todo
export const entryKey = ([key]: ArrayEntry) => key;
export const entryValue = ([, value]: ArrayEntry) => value;
export const depthAccessor = (n: ArrayEntry) => entryValue(n)[depthKey];
export const aggregateAccessor = (n: ArrayEntry) => entryValue(n)[aggregateKey];
export const childrenAccessor = (n: ArrayEntry) => entryValue(n)[childrenKey];
const ascending: Sorter = (a, b) => a - b;
const descending: Sorter = (a, b) => b - a;

export const groupBy = (
  keyAccessors: Array<(a: Tuple) => Key>,
  valueAccessor: Function,
  {
    reducer,
    identity,
  }: {
    reducer: (prev: number, next: number) => number;
    identity: Function;
  },
  factTable: Relation,
) => {
  const reductionMap = factTable.reduce((p: HierarchyOfMaps, n) => {
    const keyCount = keyAccessors.length;
    let pointer: HierarchyOfMaps = p;
    keyAccessors.forEach((keyAccessor, i) => {
      const key = keyAccessor(n);
      const keyExists = pointer.has(key);
      const last = i === keyCount - 1;
      const node = keyExists && pointer.get(key);
      const childrenMap = node ? node[childrenKey] : new Map();
      const aggregate = node ? node[aggregateKey] : identity();
      const reductionValue = reducer(aggregate, valueAccessor(n));
      pointer.set(key, {
        [aggregateKey]: reductionValue,
        [depthKey]: i,
        ...(!last && { [childrenKey]: childrenMap }),
      });
      if (childrenMap) {
        // will always be true except when exiting from forEach, ie. upon encountering the leaf node
        pointer = childrenMap;
      }
    });
    return p;
  }, new Map());
  return reductionMap;
};

export const mapsToArrays = (root: HierarchyOfMaps, sorter: NodeSorter): HierarchyOfArrays => {
  const groupByMap = (node: HierarchyOfMaps) =>
    Array.from(
      node,
      ([key, value]: [Key, MapNode]): ArrayEntry => {
        const valueElement = value[childrenKey];
        const newValue: ArrayNode = Object.assign(
          {},
          value,
          valueElement && { [childrenKey]: groupByMap(valueElement) },
        );
        return [key, newValue];
      },
    ).sort(sorter); // with the current algo, decreasing order is important
  return groupByMap(root);
};

export const mapEntryValue = (entry: ArrayEntry) => entryValue(entry)[aggregateKey];

export const aggregateComparator = (accessor: Function, sorter: Sorter): NodeSorter => (a, b) =>
  sorter(accessor(a), accessor(b));

export const childOrders = {
  ascending,
  descending,
};

/*
type MeanReduction = { sum: number; count: number };
type MedianReduction = Array<number>;
*/

export const aggregators = {
  one: {
    identity: () => 0,
    reducer: () => 1,
  },
  count: {
    identity: () => 0,
    reducer: (r: number) => r + 1,
  },
  sum: {
    identity: () => 0,
    reducer: (r: number, n: number) => r + n,
  },
  min: {
    identity: () => Infinity,
    reducer: (r: number, n: number) => Math.min(r, n),
  },
  max: {
    identity: () => -Infinity,
    reducer: (r: number, n: number) => Math.max(r, n),
  },
  min0: {
    identity: () => 0,
    reducer: (r: number, n: number) => Math.min(r, n),
  },
  max0: {
    identity: () => 0,
    reducer: (r: number, n: number) => Math.max(r, n),
  },
  /* // todo more TS typing is needed to use these
  mean: {
    identity: (): MeanReduction => ({ sum: 0, count: 0 }),
    reducer: (r: MeanReduction, n: number) => {
      r.sum += n;
      r.count++;
      return r;
    },
    finalizer: (r: MeanReduction): number => r.sum / r.count,
  },
  median: {
    identity: (): MedianReduction => [],
    reducer: (r: MedianReduction, n: number) => {
      r.push(n);
      return r;
    },
    finalizer: (r: MedianReduction): number => {
      const sorted = r.sort(ascending);
      const len = r.length;
      const even = len === len % 2;
      const half = len / 2;
      return even ? (sorted[half - 1] + sorted[half]) / 2 : sorted[half - 0.5];
    },
  },
*/
};
