import { Challenge } from '../src/types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'async-queue-race',
    title: 'Async Task Queue Race Condition',
    difficulty: 'Medium',
    language: 'typescript',
    category: 'Concurrency & Promises',
    description: `The \`AsyncTaskQueue\` class is supposed to execute asynchronous tasks with a maximum concurrency limit. However, due to an unhandled promise resolution ordering and a race condition in the active worker counter, the queue either stalls or exceeds the max concurrency limit when tasks reject or resolve in non-deterministic order. Fix the queue so all tasks run up to concurrency limit and resolve correctly!`,
    brokenCode: `// Fix the concurrency tracking and error propagation bug!
export class AsyncTaskQueue {
  private concurrency: number;
  private running = 0;
  private queue: Array<() => Promise<any>> = [];

  constructor(concurrency = 2) {
    this.concurrency = concurrency;
  }

  push<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // BUG: running count isn't incremented properly before execution
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          // BUG: running counter goes negative or stalls because next() isn't called safely
          this.running--;
          this.next();
        }
      });
      this.next();
    });
  }

  private next(): void {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    // BUG: Increments running after shifting without guarding multiple triggers
    const task = this.queue.shift();
    if (task) {
      this.running++;
      task();
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }
}
`,
    solutionCode: `export class AsyncTaskQueue {
  private concurrency: number;
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(concurrency = 2) {
    this.concurrency = concurrency;
  }

  push<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          this.next();
        }
      };

      this.queue.push(execute);
      this.next();
    });
  }

  private next(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task();
      }
    }
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }
}
`,
    hints: [
      'Look at how `this.next()` is called: it only processes one item per call instead of draining up to `this.concurrency`.',
      'Ensure `this.running++` happens immediately inside the runner before execution to prevent race conditions during rapid enqueue.',
      'Always decrement `running` in `finally` and trigger `next()` to fill open slots.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Executes single task',
        input: 'queue.push(() => Promise.resolve(42))',
        expected: '42'
      },
      {
        id: 't2',
        name: 'Honors concurrency limit of 2',
        input: '10 concurrent tasks with 20ms delay each',
        expected: 'Max active <= 2 at all times'
      },
      {
        id: 't3',
        name: 'Handles task rejections without stalling queue',
        input: 'Task 1 rejects, Task 2 resolves',
        expected: 'Task 2 resolves successfully'
      },
      {
        id: 't4',
        name: 'Drains all 20 queued tasks completely',
        input: '20 rapid tasks',
        expected: 'All 20 resolved, active == 0, pending == 0'
      }
    ]
  },
  {
    id: 'lru-cache-eviction',
    title: 'Broken LRU Cache Eviction & Hash Map Sync',
    difficulty: 'Medium',
    language: 'typescript',
    category: 'Data Structures',
    description: `This LRU Cache implementation has multiple bugs: reading a key does not mark it as recently used, evicting the oldest key fails when capacity is 1, and duplicate keys cause orphaned nodes in the doubly linked list. Fix the get, put, and eviction logic!`,
    brokenCode: `// Fix the LRU Cache doubly linked list & map sync bugs!
class Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, Node<K, V>>();
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    // BUG: Does not move accessed node to head of the list!
    return node.value;
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      // BUG: Doesn't refresh position to head
      return;
    }

    if (this.map.size >= this.capacity) {
      // BUG: Evicts head instead of tail, or breaks pointers on size 1
      if (this.tail) {
        this.map.delete(this.tail.key);
        this.removeNode(this.tail);
      }
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  private addToHead(node: Node<K, V>): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: Node<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
  }

  get size(): number {
    return this.map.size;
  }
}
`,
    solutionCode: `class Node<K, V> {
  key: K;
  value: V;
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, Node<K, V>>();
  private head: Node<K, V> | null = null;
  private tail: Node<K, V> | null = null;

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToHead(node);
      return;
    }

    if (this.map.size >= this.capacity && this.tail) {
      const evictedKey = this.tail.key;
      this.removeNode(this.tail);
      this.map.delete(evictedKey);
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  private moveToHead(node: Node<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: Node<K, V>): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: Node<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
  }

  get size(): number {
    return this.map.size;
  }
}
`,
    hints: [
      'In `get(key)`, call `this.moveToHead(node)` so recently read entries stay active.',
      'In `put(key, value)` for existing keys, update the value AND call `moveToHead(node)`.',
      'When evicting at capacity, remove `this.tail` from the linked list and delete its key from `this.map`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Basic Put and Get',
        input: 'put("a", 1); get("a")',
        expected: '1'
      },
      {
        id: 't2',
        name: 'Evicts least recently used on overflow',
        input: 'cap 2: put("a", 1); put("b", 2); get("a"); put("c", 3); get("b")',
        expected: 'undefined (b was evicted, a was kept)'
      },
      {
        id: 't3',
        name: 'Single capacity edge case',
        input: 'cap 1: put("a", 1); put("b", 2); get("a")',
        expected: 'undefined (only b remains)'
      }
    ]
  },
  {
    id: 'deep-clone-circular',
    title: 'Prototype Pollution & Circular Deep Clone',
    difficulty: 'Hard',
    language: 'javascript',
    category: 'Security & Edge Cases',
    description: `A developer wrote a custom \`deepClone\` function for high-performance state replication. However, it crashes on circular references (Maximum call stack size exceeded) and is vulnerable to Prototype Pollution via \`__proto__\` keys. Fix both vulnerabilities!`,
    brokenCode: `// Fix circular reference infinite recursion and prototype pollution!
export function deepClone(target, hash = new WeakMap()) {
  // BUG 1: Fails to handle primitives, functions, Dates, and RegExps properly
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  // BUG 2: Circular reference check is missing or flawed
  // if (hash.has(target)) return hash.get(target);

  // BUG 3: Vulnerable to __proto__ prototype pollution attack
  const clone = Array.isArray(target) ? [] : {};
  // hash.set(target, clone);

  for (const key of Object.keys(target)) {
    // BUG 4: Copies unsafe prototype keys
    clone[key] = deepClone(target[key], hash);
  }

  return clone;
}
`,
    solutionCode: `export function deepClone(target, hash = new WeakMap()) {
  if (target === null || typeof target !== 'object') {
    return target;
  }

  if (target instanceof Date) return new Date(target.getTime());
  if (target instanceof RegExp) return new RegExp(target.source, target.flags);
  if (typeof target === 'function') return target;

  if (hash.has(target)) {
    return hash.get(target);
  }

  const clone = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
  hash.set(target, clone);

  const keys = [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)];
  for (const key of keys) {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    const desc = Object.getOwnPropertyDescriptor(target, key);
    if (desc && (desc.get || desc.set)) {
      Object.defineProperty(clone, key, desc);
    } else {
      clone[key] = deepClone(target[key], hash);
    }
  }

  return clone;
}
`,
    hints: [
      'Use a `WeakMap` to keep track of visited objects and return the cached reference on cycles.',
      'Filter out keys named `__proto__`, `constructor`, or `prototype` to prevent prototype pollution.',
      'Handle special object instances like `Date` and `RegExp` cleanly.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Clones nested object and arrays',
        input: '{ a: [1, 2, { b: "hello" }] }',
        expected: 'Deep equal but distinct memory references'
      },
      {
        id: 't2',
        name: 'Handles circular references without crashing',
        input: 'const obj = {}; obj.self = obj;',
        expected: 'obj.self === obj (retained circular reference)'
      },
      {
        id: 't3',
        name: 'Blocks prototype pollution',
        input: 'JSON.parse(\'{"__proto__":{"polluted":true}}\')',
        expected: 'Object.prototype.polluted remains undefined'
      }
    ]
  },
  {
    id: 'binary-search-boundary',
    title: 'Off-By-One & Midpoint Overflow in Binary Search',
    difficulty: 'Easy',
    language: 'typescript',
    category: 'Algorithms',
    description: `A classic binary search function has subtle integer overflow and off-by-one errors when target elements are at boundary indexes 0 and length - 1. Fix the calculation so it reliably finds target index or returns -1!`,
    brokenCode: `// Fix the off-by-one boundary index and infinite loop bugs!
export function binarySearch(nums: number[], target: number): number {
  let left = 0;
  // BUG 1: Index boundary error
  let right = nums.length;

  // BUG 2: Infinite loop or skipped elements with <= vs <
  while (left < right) {
    // BUG 3: Potential integer overflow in high indices (or truncating wrong)
    const mid = (left + right) / 2;

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      // BUG 4: Moving bounds incorrectly
      left = mid;
    } else {
      right = mid;
    }
  }

  return -1;
}
`,
    solutionCode: `export function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
`,
    hints: [
      'Use `right = nums.length - 1` with `while (left <= right)`.',
      'Compute mid with `Math.floor(left + (right - left) / 2)`.',
      'Increment `left = mid + 1` and decrement `right = mid - 1`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Finds element at start (index 0)',
        input: 'nums = [2, 5, 8, 12, 16], target = 2',
        expected: '0'
      },
      {
        id: 't2',
        name: 'Finds element at end (index 4)',
        input: 'nums = [2, 5, 8, 12, 16], target = 16',
        expected: '4'
      },
      {
        id: 't3',
        name: 'Returns -1 for missing elements',
        input: 'nums = [1, 3, 5, 7], target = 4',
        expected: '-1'
      }
    ]
  },
  {
    id: 'matrix-spiral-boundary',
    title: 'Matrix Spiral Traversal Edge Leak',
    difficulty: 'Hard',
    language: 'javascript',
    category: 'Matrix & Geometry',
    description: `Given an m x n matrix, return all elements of the matrix in spiral order. The existing function duplicates elements on non-square matrices and throws \`Cannot read properties of undefined\` on single row or single column matrices. Fix the boundaries!`,
    brokenCode: `// Fix the spiral matrix traversal boundary leaks!
export function spiralOrder(matrix) {
  if (!matrix || matrix.length === 0) return [];
  const result = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    // Traverse Right
    for (let i = left; i <= right; i++) {
      result.push(matrix[top][i]);
    }
    top++;

    // Traverse Down
    for (let i = top; i <= bottom; i++) {
      result.push(matrix[i][right]);
    }
    right--;

    // BUG: Missing check for top <= bottom causes duplicate traversals on single row/column
    for (let i = right; i >= left; i--) {
      result.push(matrix[bottom][i]);
    }
    bottom--;

    // BUG: Missing check for left <= right causes duplicate traversals
    for (let i = bottom; i >= top; i--) {
      result.push(matrix[i][left]);
    }
    left++;
  }

  return result;
}
`,
    solutionCode: `export function spiralOrder(matrix) {
  if (!matrix || matrix.length === 0) return [];
  const result = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) {
      result.push(matrix[top][i]);
    }
    top++;

    for (let i = top; i <= bottom; i++) {
      result.push(matrix[i][right]);
    }
    right--;

    if (top <= bottom) {
      for (let i = right; i >= left; i--) {
        result.push(matrix[bottom][i]);
      }
      bottom--;
    }

    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        result.push(matrix[i][left]);
      }
      left++;
    }
  }

  return result;
}
`,
    hints: [
      'Guard the bottom row traversal with `if (top <= bottom)` before iterating backwards.',
      'Guard the left column traversal with `if (left <= right)` before iterating upwards.'
    ],
    testCases: [
      {
        id: 't1',
        name: '3x3 Square Matrix',
        input: '[[1,2,3],[4,5,6],[7,8,9]]',
        expected: '[1,2,3,6,9,8,7,4,5]'
      },
      {
        id: 't2',
        name: 'Single Row Matrix (1x4)',
        input: '[[1,2,3,4]]',
        expected: '[1,2,3,4]'
      },
      {
        id: 't3',
        name: 'Single Column Matrix (4x1)',
        input: '[[1],[2],[3],[4]]',
        expected: '[1,2,3,4]'
      }
    ]
  }
];
