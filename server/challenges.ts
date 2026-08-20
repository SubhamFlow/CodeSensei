import { Challenge } from '../src/types';

export const CHALLENGES: Challenge[] = [
  // 1. GRAPHS: Number of Islands
  {
    id: 'number-of-islands',
    title: 'Number of Islands (Graph DFS/BFS)',
    difficulty: 'Medium',
    category: 'Graphs',
    language: 'javascript',
    description: `Given an m x n 2D binary grid representing a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.
The current code has critical bugs: it forgets to mark visited cells before recursing (causing Maximum Call Stack Exceeded on large grids) and boundary checks allow negative indices to access undefined rows. Fix the traversal logic!`,
    brokenCode: `// Fix the DFS graph traversal & visited state tracking bugs!
function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  
  let islandCount = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r, c) {
    // BUG 1: Boundary check fails when r < 0 or c < 0 before accessing grid[r][c]
    if (r >= rows || c >= cols || grid[r][c] === '0') {
      return;
    }

    // BUG 2: Land is never marked as visited ('0'), causing infinite recursion!
    // grid[r][c] = '0';

    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islandCount++;
        dfs(r, c);
      }
    }
  }

  return islandCount;
}

module.exports = { numIslands };
`,
    solutionCode: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;

  let islandCount = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') {
      return;
    }

    grid[r][c] = '0'; // Sink the island land cell

    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islandCount++;
        dfs(r, c);
      }
    }
  }

  return islandCount;
}

module.exports = { numIslands };
`,
    starterCodes: {
      javascript: `// Fix the DFS graph traversal & visited state tracking bugs!
function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  
  let islandCount = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r, c) {
    // BUG 1: Boundary check fails when r < 0 or c < 0 before accessing grid[r][c]
    if (r >= rows || c >= cols || grid[r][c] === '0') {
      return;
    }

    // BUG 2: Land is never marked as visited ('0'), causing infinite recursion!
    // grid[r][c] = '0';

    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islandCount++;
        dfs(r, c);
      }
    }
  }

  return islandCount;
}
`,
      python: `# Fix the DFS graph traversal & visited state tracking bugs!
class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        
        rows, cols = len(grid), len(grid[0])
        island_count = 0

        def dfs(r, c):
            # BUG 1: Incomplete boundary check
            if r >= rows or c >= cols or grid[r][c] == '0':
                return
            
            # BUG 2: Missing visited cell mutation
            # grid[r][c] = '0'

            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    island_count += 1
                    dfs(r, c)

        return island_count
`,
      cpp: `// Fix the DFS graph traversal & visited state tracking bugs!
#include <vector>
using namespace std;

class Solution {
public:
    void dfs(vector<vector<char>>& grid, int r, int c) {
        int rows = grid.size();
        int cols = grid[0].size();
        // BUG 1: Missing r < 0 or c < 0 boundary check
        if (r >= rows || c >= cols || grid[r][c] == '0') {
            return;
        }

        // BUG 2: Missing visited state
        // grid[r][c] = '0';

        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }

    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
};
`,
      java: `// Fix the DFS graph traversal & visited state tracking bugs!
class Solution {
    public void dfs(char[][] grid, int r, int c) {
        int rows = grid.length;
        int cols = grid[0].length;
        // BUG 1: Missing lower boundary checks
        if (r >= rows || c >= cols || grid[r][c] == '0') {
            return;
        }

        // BUG 2: Missing visited mark
        // grid[r][c] = '0';

        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }

    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
}
`
    },
    solutions: {
      javascript: `function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}`,
      python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0

        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        return count`,
      cpp: `class Solution {
public:
    void dfs(vector<vector<char>>& grid, int r, int c) {
        if (r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
};`,
      java: `class Solution {
    public void dfs(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
}`
    },
    hints: [
      'Guard against out-of-bounds indices: `r < 0 || r >= rows || c < 0 || c >= cols`.',
      'Whenever a land cell `grid[r][c] === "1"` is visited, mutate it to `"0"` immediately to avoid infinite recursion.',
      'Check all 4 adjacent directions (up, down, left, right).'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Single Large Island',
        input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]',
        expected: '1'
      },
      {
        id: 't2',
        name: 'Multiple Disjoint Islands',
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        expected: '3'
      },
      {
        id: 't3',
        name: 'All Water (Empty Grid)',
        input: 'grid = [["0","0"],["0","0"]]',
        expected: '0'
      }
    ]
  },

  // 2. GRAPHS: Course Schedule (Cycle Detection / Topological Sort)
  {
    id: 'course-schedule-cycle',
    title: 'Course Schedule (Topological Sort / Cycle Detection)',
    difficulty: 'Medium',
    category: 'Graphs',
    language: 'javascript',
    description: `There are a total of numCourses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a_i, b_i] indicates that you must take course b_i first if you want to take course a_i.
Return true if you can finish all courses, or false if there is a cycle (deadlock). The implementation has an in-degree calculation bug and fails to decrement child degrees properly in Kahn's BFS queue. Fix the cycle detector!`,
    brokenCode: `// Fix the Kahn's Topological Sort algorithm & in-degree array bugs!
function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);

  for (const [course, prereq] of prerequisites) {
    // BUG 1: In-degree is incremented on the prereq instead of the dependent course!
    inDegree[prereq]++;
    adj[prereq].push(course);
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    visitedCount++;

    for (const neighbor of adj[node]) {
      // BUG 2: Forgets to decrement inDegree[neighbor] before checking if 0
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // BUG 3: Returns wrong boolean evaluation
  return visitedCount !== numCourses;
}

module.exports = { canFinish };
`,
    solutionCode: `function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);

  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    visitedCount++;

    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return visitedCount === numCourses;
}

module.exports = { canFinish };
`,
    starterCodes: {
      javascript: `// Fix the Kahn's Topological Sort algorithm & in-degree array bugs!
function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);

  for (const [course, prereq] of prerequisites) {
    // BUG 1: In-degree inverted
    inDegree[prereq]++;
    adj[prereq].push(course);
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    visitedCount++;

    for (const neighbor of adj[node]) {
      // BUG 2: In-degree not decremented
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return visitedCount !== numCourses;
}
`,
      python: `# Fix Kahn's Topological Sort cycle detection bugs!
from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        in_degree = [0] * numCourses
        adj = [[] for _ in range(numCourses)]

        for course, prereq in prerequisites:
            # BUG: inverted in-degree
            in_degree[prereq] += 1
            adj[prereq].append(course)

        queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
        visited_count = 0

        while queue:
            node = queue.popleft()
            visited_count += 1
            for neighbor in adj[node]:
                # BUG: missing in-degree decrement
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        return visited_count != numCourses
`,
      cpp: `// Fix Kahn's Topological Sort cycle detection bugs!
#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<int> inDegree(numCourses, 0);
        vector<vector<int>> adj(numCourses);

        for (auto& edge : prerequisites) {
            int course = edge[0];
            int prereq = edge[1];
            inDegree[prereq]++; // BUG: inverted
            adj[prereq].push_back(course);
        }

        queue<int> q;
        for (int i = 0; i < numCourses; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }

        int visited = 0;
        while (!q.empty()) {
            int node = q.front();
            q.pop();
            visited++;
            for (int neighbor : adj[node]) {
                if (inDegree[neighbor] == 0) q.push(neighbor); // BUG: missing decrement
            }
        }
        return visited != numCourses;
    }
};
`,
      java: `// Fix Kahn's Topological Sort cycle detection bugs!
import java.util.*;

class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());

        for (int[] p : prerequisites) {
            int course = p[0];
            int prereq = p[1];
            inDegree[prereq]++; // BUG: inverted
            adj.get(prereq).add(course);
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }

        int count = 0;
        while (!q.isEmpty()) {
            int node = q.poll();
            count++;
            for (int neighbor : adj.get(node)) {
                if (inDegree[neighbor] == 0) q.offer(neighbor); // BUG
            }
        }
        return count != numCourses;
    }
}
`
    },
    solutions: {
      javascript: `function canFinish(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    count++;
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  return count === numCourses;
}`,
      python: `from collections import deque

class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        in_degree = [0] * numCourses
        adj = [[] for _ in range(numCourses)]
        for course, prereq in prerequisites:
            adj[prereq].append(course)
            in_degree[course] += 1
        queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
        count = 0
        while queue:
            node = queue.popleft()
            count += 1
            for neighbor in adj[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        return count == numCourses`,
      cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<int> inDegree(numCourses, 0);
        vector<vector<int>> adj(numCourses);
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            inDegree[p[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }
        int count = 0;
        while (!q.empty()) {
            int node = q.front(); q.pop();
            count++;
            for (int neighbor : adj[node]) {
                if (--inDegree[neighbor] == 0) q.push(neighbor);
            }
        }
        return count == numCourses;
    }
};`,
      java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }
        int count = 0;
        while (!q.isEmpty()) {
            int node = q.poll();
            count++;
            for (int neighbor : adj.get(node)) {
                if (--inDegree[neighbor] == 0) q.offer(neighbor);
            }
        }
        return count == numCourses;
    }
}`
    },
    hints: [
      'In prerequisite pair `[course, prereq]`, edge goes from `prereq -> course`, so `inDegree[course]++`.',
      'When popping a node from the BFS queue, decrement each neighbor in-degree: `inDegree[neighbor]--`.',
      'Return `visitedCount === numCourses` to verify no cyclic dependencies prevented topological completion.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Linear Dependency (Valid)',
        input: 'numCourses = 2, prerequisites = [[1, 0]]',
        expected: 'true'
      },
      {
        id: 't2',
        name: 'Direct Cycle (Deadlock)',
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        expected: 'false'
      },
      {
        id: 't3',
        name: 'Complex DAG with Branching (Valid)',
        input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
        expected: 'true'
      }
    ]
  },

  // 3. TREES: Lowest Common Ancestor (Binary Tree LCA)
  {
    id: 'lowest-common-ancestor-tree',
    title: 'Lowest Common Ancestor of Binary Tree',
    difficulty: 'Medium',
    category: 'Trees',
    language: 'javascript',
    description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q. The LCA is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).
The code below has pointer handling bugs that return undefined on unbalanced trees and ignores subtree matches when one node is found. Fix the recursive tree search!`,
    brokenCode: `// Fix the Lowest Common Ancestor tree traversal bugs!
function TreeNode(val, left, right) {
  this.val = val;
  this.left = left === undefined ? null : left;
  this.right = right === undefined ? null : right;
}

function lowestCommonAncestor(root, p, q) {
  // BUG 1: Returns null immediately instead of returning root when root === p or root === q
  if (root === null) {
    return null;
  }

  // BUG 2: Missing base case equality check for p and q target nodes
  // if (root.val === p.val || root.val === q.val) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // BUG 3: Returns left child unconditionally even when both left & right found targets
  if (left !== null && right !== null) {
    return left; // Should be root!
  }

  return left !== null ? left : right;
}

module.exports = { TreeNode, lowestCommonAncestor };
`,
    solutionCode: `function TreeNode(val, left, right) {
  this.val = val;
  this.left = left === undefined ? null : left;
  this.right = right === undefined ? null : right;
}

function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q || root.val === (p.val || p) || root.val === (q.val || q)) {
    return root;
  }

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left !== null && right !== null) {
    return root;
  }

  return left !== null ? left : right;
}

module.exports = { TreeNode, lowestCommonAncestor };
`,
    starterCodes: {
      javascript: `// Fix the Lowest Common Ancestor tree traversal bugs!
function lowestCommonAncestor(root, p, q) {
  if (root === null) return null;

  // BUG: Missing check if root is p or q
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left !== null && right !== null) {
    return left; // BUG: Should return root!
  }

  return left !== null ? left : right;
}
`,
      python: `# Fix Lowest Common Ancestor tree traversal bugs!
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root:
            return None
        
        # BUG: Missing base condition for p and q
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)

        if left and right:
            return left # BUG: Should return root
        
        return left if left else right
`,
      cpp: `// Fix Lowest Common Ancestor tree traversal bugs!
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root) return nullptr;

        // BUG: Missing base case equality check
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);

        if (left && right) return left; // BUG

        return left ? left : right;
    }
};
`,
      java: `// Fix Lowest Common Ancestor tree traversal bugs!
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null) return null;

        // BUG: Missing root == p || root == q
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);

        if (left != null && right != null) return left; // BUG

        return left != null ? left : right;
    }
}
`
    },
    solutions: {
      javascript: `function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q || root.val === (p.val || p) || root.val === (q.val || q)) {
    return root;
  }
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left !== null && right !== null) return root;
  return left !== null ? left : right;
}`,
      python: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left if left else right`,
      cpp: `class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};`,
      java: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`
    },
    hints: [
      'Base cases: If `root == null || root == p || root == q`, immediately return `root`.',
      'If both left and right recursive calls return non-null, `root` is the split point (the LCA)!',
      'Otherwise, pass through the non-null child result.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Nodes in opposite subtrees',
        input: 'tree = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1',
        expected: '3'
      },
      {
        id: 't2',
        name: 'One node is ancestor of the other',
        input: 'tree = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4',
        expected: '5'
      },
      {
        id: 't3',
        name: 'Two node minimal tree',
        input: 'tree = [1,2], p = 1, q = 2',
        expected: '1'
      }
    ]
  },

  // 4. TREES: Validate Binary Search Tree (BST Validation)
  {
    id: 'validate-binary-search-tree',
    title: 'Validate Binary Search Tree (BST Invariants)',
    difficulty: 'Medium',
    category: 'Trees',
    language: 'javascript',
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).
A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys strictly less than the node's key.
- The right subtree of a node contains only nodes with keys strictly greater than the node's key.
- Both the left and right subtrees must also be binary search trees.
The bug in the code only compares a node to its immediate left and right children instead of enforcing global boundary limits across ancestor subtrees. Fix the BST validator!`,
    brokenCode: `// Fix the BST subtree boundary validation bug!
function isValidBST(root) {
  if (!root) return true;

  // BUG: Only checking immediate child instead of enforcing min/max subtree bounds!
  // E.g., Tree [5, 1, 6, null, null, 3, 7] has node 3 in the right subtree of 5!
  if (root.left && root.left.val >= root.val) {
    return false;
  }
  if (root.right && root.right.val <= root.val) {
    return false;
  }

  return isValidBST(root.left) && isValidBST(root.right);
}

module.exports = { isValidBST };
`,
    solutionCode: `function isValidBST(root) {
  function validate(node, minVal, maxVal) {
    if (!node) return true;

    if (minVal !== null && node.val <= minVal) return false;
    if (maxVal !== null && node.val >= maxVal) return false;

    return validate(node.left, minVal, node.val) && validate(node.right, node.val, maxVal);
  }

  return validate(root, null, null);
}

module.exports = { isValidBST };
`,
    starterCodes: {
      javascript: `// Fix the BST subtree boundary validation bug!
function isValidBST(root) {
  if (!root) return true;

  // BUG: Fails to pass min/max bounds down recursive levels
  if (root.left && root.left.val >= root.val) return false;
  if (root.right && root.right.val <= root.val) return false;

  return isValidBST(root.left) && isValidBST(root.right);
}
`,
      python: `# Fix BST validation bounds propagation!
class Solution:
    def isValidBST(self, root: 'TreeNode') -> bool:
        if not root:
            return True
        
        # BUG: Only local checks
        if root.left and root.left.val >= root.val:
            return False
        if root.right and root.right.val <= root.val:
            return False
            
        return self.isValidBST(root.left) and self.isValidBST(root.right)
`,
      cpp: `// Fix BST validation bounds propagation!
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        if (!root) return true;
        // BUG: Local checks fail to detect invalid ancestor bounds
        if (root->left && root->left->val >= root->val) return false;
        if (root->right && root->right->val <= root->val) return false;
        return isValidBST(root->left) && isValidBST(root->right);
    }
};
`,
      java: `// Fix BST validation bounds propagation!
class Solution {
    public boolean isValidBST(TreeNode root) {
        if (root == null) return true;
        // BUG: Misses deep subtree boundary violations
        if (root.left != null && root.left.val >= root.val) return false;
        if (root.right != null && root.right.val <= root.val) return false;
        return isValidBST(root.left) && isValidBST(root.right);
    }
}
`
    },
    solutions: {
      javascript: `function isValidBST(root) {
  function validate(node, min, max) {
    if (!node) return true;
    if (min !== null && node.val <= min) return false;
    if (max !== null && node.val >= max) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
  }
  return validate(root, null, null);
}`,
      python: `class Solution:
    def isValidBST(self, root: 'TreeNode') -> bool:
        def validate(node, low, high):
            if not node:
                return True
            if low is not None and node.val <= low:
                return False
            if high is not None and node.val >= high:
                return False
            return validate(node.left, low, node.val) and validate(node.right, node.val, high)
        return validate(root, None, None)`,
      cpp: `class Solution {
public:
    bool validate(TreeNode* node, long long minVal, long long maxVal) {
        if (!node) return true;
        if (node->val <= minVal || node->val >= maxVal) return false;
        return validate(node->left, minVal, node->val) && validate(node->right, node->val, maxVal);
    }
    bool isValidBST(TreeNode* root) {
        return validate(root, LLONG_MIN, LLONG_MAX);
    }
};`,
      java: `class Solution {
    public boolean validate(TreeNode node, Long min, Long max) {
        if (node == null) return true;
        if (min != null && node.val <= min) return false;
        if (max != null && node.val >= max) return false;
        return validate(node.left, min, (long)node.val) && validate(node.right, (long)node.val, max);
    }
    public boolean isValidBST(TreeNode root) {
        return validate(root, null, null);
    }
}`
    },
    hints: [
      'A helper function `validate(node, min, max)` is required so every left child inherits `max = node.val` and right child inherits `min = node.val`.',
      'Strict equality check: `node.val <= min` or `node.val >= max` must return `false`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Valid Simple BST',
        input: 'root = [2, 1, 3]',
        expected: 'true'
      },
      {
        id: 't2',
        name: 'Invalid Right Subtree Sub-child',
        input: 'root = [5, 1, 4, null, null, 3, 6]',
        expected: 'false (node 3 violates root value 5)'
      },
      {
        id: 't3',
        name: 'Duplicate Values (Strictly Less/Greater)',
        input: 'root = [2, 2, 2]',
        expected: 'false'
      }
    ]
  },

  // 5. ALGORITHMS & SEARCHING: Search in Rotated Sorted Array
  {
    id: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array (Binary Search)',
    difficulty: 'Medium',
    category: 'Algorithms & Searching',
    language: 'javascript',
    description: `Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.
You must write an algorithm with O(log n) runtime complexity.
The broken code misses boundary checks for sorted halves and has off-by-one errors when adjusting left and right pointers. Fix the binary search!`,
    brokenCode: `// Fix the Rotated Sorted Array Binary Search pointers & condition bugs!
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    // BUG 1: Incomplete check for sorted left half (misses equality nums[left] <= nums[mid])
    if (nums[left] < nums[mid]) {
      // BUG 2: Incorrect range check for target inside sorted left half
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      // BUG 3: Inequality bounds miss boundary targets
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid; // BUG: Should be right = mid - 1
      }
    }
  }

  return -1;
}

module.exports = { search };
`,
    solutionCode: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    // Left half is sorted
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

module.exports = { search };
`,
    starterCodes: {
      javascript: `// Fix the Rotated Sorted Array Binary Search pointers & condition bugs!
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    // BUG 1: Strict inequality misses 2-element sorted left half
    if (nums[left] < nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid; // BUG 2: Infinite loop
      }
    }
  }

  return -1;
}
`,
      python: `# Fix Rotated Sorted Array Binary Search bugs!
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            
            # BUG: Misses <=
            if nums[left] < nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid # BUG
        
        return -1
`,
      cpp: `// Fix Rotated Sorted Array Binary Search bugs!
#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;

            if (nums[left] < nums[mid]) { // BUG: should be <=
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid; // BUG
                }
            }
        }
        return -1;
    }
};
`,
      java: `// Fix Rotated Sorted Array Binary Search bugs!
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;

            if (nums[left] < nums[mid]) { // BUG: should be <=
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid; // BUG
                }
            }
        }
        return -1;
    }
}
`
    },
    solutions: {
      javascript: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return -1;
}`,
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
}`
    },
    hints: [
      'Check which half is sorted: if `nums[left] <= nums[mid]`, left half is monotonic.',
      'If target lies in `[nums[left], nums[mid])`, narrow to `right = mid - 1`; otherwise `left = mid + 1`.',
      'Always adjust pointers with `mid - 1` and `mid + 1` to prevent infinite loops.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Standard Rotated Array Target Found',
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        expected: '4'
      },
      {
        id: 't2',
        name: 'Target Not Present in Rotated Array',
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        expected: '-1'
      },
      {
        id: 't3',
        name: 'Single Element Array Match',
        input: 'nums = [1], target = 1',
        expected: '0'
      }
    ]
  },

  // 6. DYNAMIC PROGRAMMING: Longest Increasing Subsequence
  {
    id: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence (LIS - DP)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    language: 'javascript',
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.
A subsequence is derived by deleting some or no elements without changing the order of the remaining elements.
The current code fails because it only compares adjacent elements (finding longest continuous subarray instead of subsequence) and initializes DP array with 0s. Fix the dynamic programming algorithm!`,
    brokenCode: `// Fix the Longest Increasing Subsequence DP table algorithm!
function lengthOfLIS(nums) {
  if (!nums || nums.length === 0) return 0;

  // BUG 1: DP array initialized to 0s instead of 1 (a single number is an LIS of length 1)
  const dp = new Array(nums.length).fill(0);

  for (let i = 0; i < nums.length; i++) {
    // BUG 2: Only checks j = i - 1 instead of all previous indices 0 <= j < i
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        // BUG 3: Overwrites dp[i] instead of taking Math.max(dp[i], dp[j] + 1)
        dp[i] = dp[j] + 1;
      }
    }
  }

  // BUG 4: Returns dp[nums.length - 1] instead of Math.max(...dp)
  return dp[nums.length - 1];
}

module.exports = { lengthOfLIS };
`,
    solutionCode: `function lengthOfLIS(nums) {
  if (!nums || nums.length === 0) return 0;

  const dp = new Array(nums.length).fill(1);
  let maxLen = 1;

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }

  return maxLen;
}

module.exports = { lengthOfLIS };
`,
    starterCodes: {
      javascript: `// Fix the Longest Increasing Subsequence DP table algorithm!
function lengthOfLIS(nums) {
  if (!nums || nums.length === 0) return 0;

  // BUG 1: Initialized to 0
  const dp = new Array(nums.length).fill(0);

  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = dp[j] + 1; // BUG 2: Missing Math.max
      }
    }
  }

  return dp[nums.length - 1]; // BUG 3: Must return max over all dp[i]
}
`,
      python: `# Fix Longest Increasing Subsequence DP bugs!
class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        if not nums:
            return 0
        
        dp = [0] * len(nums) # BUG: Should be initialized to 1

        for i in range(len(nums)):
            for j in range(i):
                if nums[i] > nums[j]:
                    dp[i] = dp[j] + 1 # BUG: Missing max()

        return dp[-1] # BUG: Should return max(dp)
`,
      cpp: `// Fix Longest Increasing Subsequence DP bugs!
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        if (nums.empty()) return 0;
        vector<int> dp(nums.size(), 0); // BUG: initialize to 1

        for (int i = 0; i < nums.size(); ++i) {
            for (int j = 0; j < i; ++j) {
                if (nums[i] > nums[j]) {
                    dp[i] = dp[j] + 1; // BUG: missing max
                }
            }
        }
        return dp.back(); // BUG: return max_element
    }
};
`,
      java: `// Fix Longest Increasing Subsequence DP bugs!
import java.util.Arrays;

class Solution {
    public int lengthOfLIS(int[] nums) {
        if (nums == null || nums.length == 0) return 0;
        int[] dp = new int[nums.length]; // BUG: initialized to 0

        for (int i = 0; i < nums.length; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[i] > nums[j]) {
                    dp[i] = dp[j] + 1; // BUG: missing Math.max
                }
            }
        }
        return dp[nums.length - 1]; // BUG
    }
}
`
    },
    solutions: {
      javascript: `function lengthOfLIS(nums) {
  if (!nums || nums.length === 0) return 0;
  const dp = new Array(nums.length).fill(1);
  let maxLen = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  return maxLen;
}`,
      python: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        if not nums:
            return 0
        dp = [1] * len(nums)
        for i in range(1, len(nums)):
            for j in range(i):
                if nums[i] > nums[j]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)`,
      cpp: `class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        if (nums.empty()) return 0;
        vector<int> dp(nums.size(), 1);
        int maxLen = 1;
        for (int i = 1; i < nums.size(); ++i) {
            for (int j = 0; j < i; ++j) {
                if (nums[i] > nums[j]) {
                    dp[i] = max(dp[i], dp[j] + 1);
                }
            }
            maxLen = max(maxLen, dp[i]);
        }
        return maxLen;
    }
};`,
      java: `class Solution {
    public int lengthOfLIS(int[] nums) {
        if (nums == null || nums.length == 0) return 0;
        int[] dp = new int[nums.length];
        Arrays.fill(dp, 1);
        int maxLen = 1;
        for (int i = 1; i < nums.length; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[i] > nums[j]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLen = Math.max(maxLen, dp[i]);
        }
        return maxLen;
    }
}`
    },
    hints: [
      'Initialize DP array filled with 1s: `const dp = new Array(n).fill(1)`.',
      'For each `i`, check all `j < i`: if `nums[i] > nums[j]`, update `dp[i] = Math.max(dp[i], dp[j] + 1)`.',
      'The final answer is the maximum value in the DP array.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Standard Sequence',
        input: 'nums = [10,9,2,5,3,7,101,18]',
        expected: '4 ([2,3,7,101])'
      },
      {
        id: 't2',
        name: 'Consecutive Decreasing Array',
        input: 'nums = [7,7,7,7,7,7,7]',
        expected: '1'
      },
      {
        id: 't3',
        name: 'Alternating Peaks',
        input: 'nums = [0,1,0,3,2,3]',
        expected: '4 ([0,1,2,3])'
      }
    ]
  },

  // 7. ALGORITHMS & TWO POINTERS: Trapping Rain Water
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water (Two Pointers & Monotonic Peaks)',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    language: 'javascript',
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.
The code below attempts a two-pointer approach but has pointer movement conditions swapped and adds negative water values when bars exceed maximum heights. Fix the elevation trapping logic!`,
    brokenCode: `// Fix the Two-Pointer Trapping Rain Water bugs!
function trap(height) {
  if (!height || height.length === 0) return 0;

  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left <= right) {
    // BUG 1: Inverted comparison causes water calculated against wrong bound
    if (height[left] > height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        // BUG 2: Calculates water from wrong max
        totalWater += rightMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += leftMax - height[right];
      }
      right--;
    }
  }

  return totalWater;
}

module.exports = { trap };
`,
    solutionCode: `function trap(height) {
  if (!height || height.length === 0) return 0;

  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += rightMax - height[right];
      }
      right--;
    }
  }

  return totalWater;
}

module.exports = { trap };
`,
    starterCodes: {
      javascript: `// Fix the Two-Pointer Trapping Rain Water bugs!
function trap(height) {
  if (!height || height.length === 0) return 0;

  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let totalWater = 0;

  while (left < right) {
    // BUG: Condition and max references mixed up
    if (height[left] > height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        totalWater += rightMax - height[left]; // BUG
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        totalWater += leftMax - height[right]; // BUG
      }
      right--;
    }
  }

  return totalWater;
}
`,
      python: `# Fix Trapping Rain Water two-pointer bugs!
class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        
        left, right = 0, len(height) - 1
        left_max, right_max = 0, 0
        total_water = 0

        while left < right:
            # BUG: inverted branch
            if height[left] > height[right]:
                if height[left] >= left_max:
                    left_max = height[left]
                else:
                    total_water += right_max - height[left]
                left += 1
            else:
                if height[right] >= right_max:
                    right_max = height[right]
                else:
                    total_water += left_max - height[right]
                right -= 1

        return total_water
`,
      cpp: `// Fix Trapping Rain Water two-pointer bugs!
#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        if (height.empty()) return 0;
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int total = 0;

        while (left < right) {
            if (height[left] > height[right]) { // BUG: inverted
                if (height[left] >= leftMax) leftMax = height[left];
                else total += rightMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else total += leftMax - height[right];
                right--;
            }
        }
        return total;
    }
};
`,
      java: `// Fix Trapping Rain Water two-pointer bugs!
class Solution {
    public int trap(int[] height) {
        if (height == null || height.length == 0) return 0;
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int total = 0;

        while (left < right) {
            if (height[left] > height[right]) { // BUG
                if (height[left] >= leftMax) leftMax = height[left];
                else total += rightMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else total += leftMax - height[right];
                right--;
            }
        }
        return total;
    }
}
`
    },
    solutions: {
      javascript: `function trap(height) {
  if (!height || height.length === 0) return 0;
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else total += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else total += rightMax - height[right];
      right--;
    }
  }
  return total;
}`,
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        left, right = 0, len(height) - 1
        left_max, right_max = 0, 0
        total = 0
        while left < right:
            if height[left] < height[right]:
                if height[left] >= left_max:
                    left_max = height[left]
                else:
                    total += left_max - height[left]
                left += 1
            else:
                if height[right] >= right_max:
                    right_max = height[right]
                else:
                    total += right_max - height[right]
                right -= 1
        return total`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        if (height.empty()) return 0;
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int total = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else total += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else total += rightMax - height[right];
                right--;
            }
        }
        return total;
    }
};`,
      java: `class Solution {
    public int trap(int[] height) {
        if (height == null || height.length == 0) return 0;
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int total = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else total += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else total += rightMax - height[right];
                right--;
            }
        }
        return total;
    }
}`
    },
    hints: [
      'Advance the pointer that has the smaller height: `if (height[left] < height[right])`.',
      'For the left side: if `height[left] >= leftMax`, update `leftMax`; otherwise accumulate `leftMax - height[left]`.',
      'For the right side: if `height[right] >= rightMax`, update `rightMax`; otherwise accumulate `rightMax - height[right]`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Standard Valley Elevation Map',
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        expected: '6'
      },
      {
        id: 't2',
        name: 'Deep Crater Elevation',
        input: 'height = [4,2,0,3,2,5]',
        expected: '9'
      },
      {
        id: 't3',
        name: 'Strictly Decreasing (No Water Trapped)',
        input: 'height = [5,4,3,2,1]',
        expected: '0'
      }
    ]
  },

  // 8. DATA STRUCTURES: LRU Cache
  {
    id: 'lru-cache-design',
    title: 'LRU Cache Design (Doubly Linked List + Hash Map)',
    difficulty: 'Hard',
    category: 'Data Structures',
    language: 'javascript',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.
Implement the LRUCache class with get(key) and put(key, value) operations running in O(1) average time complexity.
The current code fails to refresh recently accessed nodes upon get() and corrupts doubly linked list pointers when evicting at capacity. Fix the LRU Cache!`,
    brokenCode: `// Fix the LRU Cache doubly linked list & map sync bugs!
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0); // Dummy head
    this.tail = new Node(0, 0); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    // BUG 1: Does not move node to head (most recently used position)!
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      // BUG 2: Doesn't move existing updated node to head
      return;
    }

    if (this.map.size >= this.capacity) {
      // BUG 3: Evicts head.next instead of tail.prev (evicts newest instead of oldest!)
      const oldest = this.head.next;
      this.removeNode(oldest);
      this.map.delete(oldest.key);
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
}

module.exports = { LRUCache };
`,
    solutionCode: `class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
      return;
    }

    if (this.map.size >= this.capacity) {
      const oldest = this.tail.prev;
      this.removeNode(oldest);
      this.map.delete(oldest.key);
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
}

module.exports = { LRUCache };
`,
    starterCodes: {
      javascript: `// Fix the LRU Cache doubly linked list & map sync bugs!
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    // BUG 1: Must move node to head
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      // BUG 2: Must move updated node to head
      return;
    }

    if (this.map.size >= this.capacity) {
      const oldest = this.head.next; // BUG 3: Evicts head instead of tail.prev!
      this.removeNode(oldest);
      this.map.delete(oldest.key);
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
}
`,
      python: `# Fix LRU Cache implementation bugs!
class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        # BUG: Missing move to head
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            # BUG: Missing move to head
            return
        
        if len(self.cache) >= self.cap:
            oldest = self.head.next # BUG: Evicts newest instead of tail.prev
            self._remove(oldest)
            del self.cache[oldest.key]

        new_node = Node(key, value)
        self._add(new_node)
        self.cache[key] = new_node

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
`,
      cpp: `// Fix LRU Cache implementation bugs!
#include <unordered_map>
using namespace std;

struct Node {
    int key, val;
    Node *prev, *next;
    Node(int k = 0, int v = 0) : key(k), val(v), prev(nullptr), next(nullptr) {}
};

class LRUCache {
    int cap;
    unordered_map<int, Node*> map;
    Node *head, *tail;

    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addToHead(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node();
        tail = new Node();
        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {
        if (map.find(key) == map.end()) return -1;
        Node* node = map[key];
        // BUG: must remove & add to head
        return node->val;
    }

    void put(int key, int value) {
        if (map.find(key) != map.end()) {
            Node* node = map[key];
            node->val = value;
            return; // BUG: must move to head
        }
        if (map.size() >= cap) {
            Node* oldest = head->next; // BUG: should be tail->prev
            removeNode(oldest);
            map.erase(oldest->key);
            delete oldest;
        }
        Node* newNode = new Node(key, value);
        addToHead(newNode);
        map[key] = newNode;
    }
};
`,
      java: `// Fix LRU Cache implementation bugs!
import java.util.*;

class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private int cap;
    private Map<Integer, Node> map;
    private Node head, tail;

    public LRUCache(int capacity) {
        cap = capacity;
        map = new HashMap<>();
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    private void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addToHead(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        // BUG: missing move to head
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.val = value;
            return; // BUG: missing move to head
        }
        if (map.size() >= cap) {
            Node oldest = head.next; // BUG: should be tail.prev
            removeNode(oldest);
            map.remove(oldest.key);
        }
        Node newNode = new Node(key, value);
        addToHead(newNode);
        map.put(key, newNode);
    }
}
`
    },
    solutions: {
      javascript: `class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this.removeNode(node);
    this.addToHead(node);
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
      return;
    }

    if (this.map.size >= this.capacity) {
      const oldest = this.tail.prev;
      this.removeNode(oldest);
      this.map.delete(oldest.key);
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.map.set(key, newNode);
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
}`,
      python: `class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            self._remove(node)
            self._add(node)
            return
        if len(self.cache) >= self.cap:
            oldest = self.tail.prev
            self._remove(oldest)
            del self.cache[oldest.key]
        new_node = Node(key, value)
        self._add(new_node)
        self.cache[key] = new_node`,
      cpp: `class LRUCache {
    int cap;
    unordered_map<int, Node*> map;
    Node *head, *tail;

    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addToHead(Node* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node();
        tail = new Node();
        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {
        if (map.find(key) == map.end()) return -1;
        Node* node = map[key];
        removeNode(node);
        addToHead(node);
        return node->val;
    }

    void put(int key, int value) {
        if (map.find(key) != map.end()) {
            Node* node = map[key];
            node->val = value;
            removeNode(node);
            addToHead(node);
            return;
        }
        if (map.size() >= cap) {
            Node* oldest = tail->prev;
            removeNode(oldest);
            map.erase(oldest->key);
            delete oldest;
        }
        Node* newNode = new Node(key, value);
        addToHead(newNode);
        map[key] = newNode;
    }
};`,
      java: `class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private int cap;
    private Map<Integer, Node> map;
    private Node head, tail;

    public LRUCache(int capacity) {
        cap = capacity;
        map = new HashMap<>();
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    private void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addToHead(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        removeNode(node);
        addToHead(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.val = value;
            removeNode(node);
            addToHead(node);
            return;
        }
        if (map.size() >= cap) {
            Node oldest = tail.prev;
            removeNode(oldest);
            map.remove(oldest.key);
        }
        Node newNode = new Node(key, value);
        addToHead(newNode);
        map.put(key, newNode);
    }
}`
    },
    hints: [
      'In `get(key)`, remove the node from its current linked list position and re-insert at `head.next`.',
      'In `put(key, value)` for existing keys, update value and move to `head`.',
      'When cache is full, evict `tail.prev` (the least recently used node) and delete from `map`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Basic Put and Get',
        input: 'put(1, 1); put(2, 2); get(1)',
        expected: '1'
      },
      {
        id: 't2',
        name: 'Evicts Least Recently Used Node',
        input: 'cap = 2; put(1, 1); put(2, 2); get(1); put(3, 3); get(2)',
        expected: '-1 (key 2 was evicted because key 1 was accessed)'
      },
      {
        id: 't3',
        name: 'Overwrites existing key and promotes',
        input: 'put(1, 10); put(1, 20); get(1)',
        expected: '20'
      }
    ]
  },

  // 9. DYNAMIC PROGRAMMING: Coin Change
  {
    id: 'coin-change',
    title: 'Coin Change (Unbounded DP)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    language: 'javascript',
    description: `You are given an integer array 'coins' representing coins of different denominations and an integer 'amount' representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.
The current code fails because it tries an incorrect greedy approach that fails on inputs like coins=[1,3,4,5], amount=7 (greedy picks 5+1+1=3 coins instead of 3+4=2 coins), or initializes DP with 0 instead of infinity. Fix the bottom-up DP table transition!`,
    brokenCode: `// Fix the coin change bottom-up DP transition!
function coinChange(coins, amount) {
  if (amount === 0) return 0;
  
  // BUG: Initialized with 0 instead of amount + 1 (Infinity equivalent)
  const dp = new Array(amount + 1).fill(0);

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        // BUG: Fails because dp[i - coin] could be 0 representing uninitialized
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] > amount ? -1 : dp[amount];
}

module.exports = { coinChange };
`,
    solutionCode: `function coinChange(coins, amount) {
  if (amount === 0) return 0;
  
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] > amount ? -1 : dp[amount];
}

module.exports = { coinChange };
`,
    starterCodes: {
      javascript: `// Fix the coin change bottom-up DP transition!
function coinChange(coins, amount) {
  if (amount === 0) return 0;
  
  // BUG: Initialized with 0 instead of amount + 1
  const dp = new Array(amount + 1).fill(0);

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] > amount ? -1 : dp[amount];
}
`,
      python: `# Fix the coin change bottom-up DP transition!
class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        if amount == 0:
            return 0
            
        # BUG: Initialized incorrectly
        dp = [0] * (amount + 1)
        
        for i in range(1, amount + 1):
            for coin in coins:
                if i - coin >= 0:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
                    
        return dp[amount] if dp[amount] <= amount else -1
`,
      cpp: `// Fix the coin change bottom-up DP transition!
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        if (amount == 0) return 0;
        
        // BUG: dp filled with 0 instead of amount + 1
        vector<int> dp(amount + 1, 0);
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        
        return dp[amount] > amount ? -1 : dp[amount];
    }
};
`,
      java: `// Fix the coin change bottom-up DP transition!
import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        if (amount == 0) return 0;
        
        int[] dp = new int[amount + 1];
        // BUG: Missing proper initialization of unreachable states
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
`
    },
    solutions: {
      javascript: `function coinChange(coins, amount) {
  if (amount === 0) return 0;
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        if amount == 0:
            return 0
        dp = [amount + 1] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for coin in coins:
                if i - coin >= 0:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        return -1 if dp[amount] > amount else dp[amount]`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        if (amount == 0) return 0;
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
      java: `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        if (amount == 0) return 0;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
    },
    hints: [
      'Initialize `dp[0] = 0` and all other entries `dp[1...amount]` to `amount + 1`.',
      'For each sub-amount `i` from 1 to `amount`, iterate through every `coin`.',
      'If `i - coin >= 0`, update `dp[i] = Math.min(dp[i], dp[i - coin] + 1)`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Standard Denominations',
        input: 'coins = [1, 2, 5], amount = 11',
        expected: '3 (5 + 5 + 1)'
      },
      {
        id: 't2',
        name: 'Unreachable Amount',
        input: 'coins = [2], amount = 3',
        expected: '-1'
      },
      {
        id: 't3',
        name: 'Zero Target',
        input: 'coins = [1], amount = 0',
        expected: '0'
      }
    ]
  },

  // 10. BACKTRACKING: Word Search
  {
    id: 'word-search',
    title: 'Word Search (Backtracking & Grid DFS)',
    difficulty: 'Medium',
    category: 'Backtracking',
    language: 'javascript',
    description: `Given an m x n grid of characters 'board' and a string 'word', return true if 'word' exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically neighboring). The same letter cell may not be used more than once.
The current code fails to restore the cell character after returning from recursive branches (backtracking failure) and fails index boundary validations. Fix the backtracking state restoration!`,
    brokenCode: `// Fix the backtracking cell restoration and boundary checks!
function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(r, c, index) {
    if (index === word.length) return true;
    
    // BUG 1: Out of bounds check or mismatch
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[index]) {
      return false;
    }

    const temp = board[r][c];
    board[r][c] = '#'; // Mark visited

    // Search 4 directions
    const found = dfs(r + 1, c, index + 1) ||
                  dfs(r - 1, c, index + 1) ||
                  dfs(r, c + 1, index + 1) ||
                  dfs(r, c - 1, index + 1);

    // BUG 2: Forgets to restore board[r][c] = temp before returning!
    // board[r][c] = temp;

    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }

  return false;
}

module.exports = { exist };
`,
    solutionCode: `function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[index]) {
      return false;
    }

    const temp = board[r][c];
    board[r][c] = '#';

    const found = dfs(r + 1, c, index + 1) ||
                  dfs(r - 1, c, index + 1) ||
                  dfs(r, c + 1, index + 1) ||
                  dfs(r, c - 1, index + 1);

    board[r][c] = temp; // Backtrack & restore original character
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }

  return false;
}

module.exports = { exist };
`,
    starterCodes: {
      javascript: `// Fix the backtracking cell restoration and boundary checks!
function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function dfs(r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[index]) {
      return false;
    }

    const temp = board[r][c];
    board[r][c] = '#';

    const found = dfs(r + 1, c, index + 1) ||
                  dfs(r - 1, c, index + 1) ||
                  dfs(r, c + 1, index + 1) ||
                  dfs(r, c - 1, index + 1);

    // BUG: Missing backtrack restore: board[r][c] = temp
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }

  return false;
}
`,
      python: `# Fix the backtracking cell restoration!
class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def dfs(r, c, index):
            if index == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[index]:
                return False
            
            temp = board[r][c]
            board[r][c] = '#'
            
            found = (dfs(r + 1, c, index + 1) or
                     dfs(r - 1, c, index + 1) or
                     dfs(r, c + 1, index + 1) or
                     dfs(r, c - 1, index + 1))
            
            # BUG: Missing board[r][c] = temp
            return found

        for r in range(rows):
            for c in range(cols):
                if dfs(r, c, 0):
                    return True
        return False
`,
      cpp: `// Fix the backtracking cell restoration!
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size();
        int cols = board[0].size();
        
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (dfs(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }
    
    bool dfs(vector<vector<char>>& board, const string& word, int r, int c, int index) {
        if (index == word.length()) return true;
        if (r < 0 || r >= board.size() || c < 0 || c >= board[0].size() || board[r][c] != word[index]) {
            return false;
        }
        
        char temp = board[r][c];
        board[r][c] = '#';
        
        bool found = dfs(board, word, r + 1, c, index + 1) ||
                     dfs(board, word, r - 1, c, index + 1) ||
                     dfs(board, word, r, c + 1, index + 1) ||
                     dfs(board, word, r, c - 1, index + 1);
                     
        // BUG: board[r][c] must be restored to temp
        return found;
    }
};
`,
      java: `// Fix the backtracking cell restoration!
class Solution {
    public boolean exist(char[][] board, String word) {
        int rows = board.length;
        int cols = board[0].length;
        
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (dfs(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }
    
    private boolean dfs(char[][] board, String word, int r, int c, int index) {
        if (index == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(index)) {
            return false;
        }
        
        char temp = board[r][c];
        board[r][c] = '#';
        
        boolean found = dfs(board, word, r + 1, c, index + 1) ||
                        dfs(board, word, r - 1, c, index + 1) ||
                        dfs(board, word, r, c + 1, index + 1) ||
                        dfs(board, word, r, c - 1, index + 1);
                        
        // BUG: board[r][c] = temp must be restored!
        return found;
    }
}
`
    },
    solutions: {
      javascript: `function exist(board, word) {
  const rows = board.length;
  const cols = board[0].length;
  function dfs(r, c, index) {
    if (index === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[index]) return false;
    const temp = board[r][c];
    board[r][c] = '#';
    const found = dfs(r + 1, c, index + 1) || dfs(r - 1, c, index + 1) || dfs(r, c + 1, index + 1) || dfs(r, c - 1, index + 1);
    board[r][c] = temp;
    return found;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}`,
      python: `class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])
        def dfs(r, c, index):
            if index == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[index]:
                return False
            temp = board[r][c]
            board[r][c] = '#'
            found = dfs(r + 1, c, index + 1) or dfs(r - 1, c, index + 1) or dfs(r, c + 1, index + 1) or dfs(r, c - 1, index + 1)
            board[r][c] = temp
            return found
        for r in range(rows):
            for c in range(cols):
                if dfs(r, c, 0):
                    return True
        return False`,
      cpp: `#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size();
        int cols = board[0].size();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (dfs(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }
    bool dfs(vector<vector<char>>& board, string& word, int r, int c, int index) {
        if (index == word.length()) return true;
        if (r < 0 || r >= board.size() || c < 0 || c >= board[0].size() || board[r][c] != word[index]) return false;
        char temp = board[r][c];
        board[r][c] = '#';
        bool found = dfs(board, word, r + 1, c, index + 1) || dfs(board, word, r - 1, c, index + 1) || dfs(board, word, r, c + 1, index + 1) || dfs(board, word, r, c - 1, index + 1);
        board[r][c] = temp;
        return found;
    }
};`,
      java: `class Solution {
    public boolean exist(char[][] board, String word) {
        int rows = board.length;
        int cols = board[0].length;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (dfs(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }
    private boolean dfs(char[][] board, String word, int r, int c, int index) {
        if (index == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(index)) return false;
        char temp = board[r][c];
        board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, index + 1) || dfs(board, word, r - 1, c, index + 1) || dfs(board, word, r, c + 1, index + 1) || dfs(board, word, r, c - 1, index + 1);
        board[r][c] = temp;
        return found;
    }
}`
    },
    hints: [
      'Store `temp = board[r][c]` before recursing into neighbors.',
      'Temporarily mark `board[r][c] = "#"` to avoid re-using the current cell.',
      'Always restore `board[r][c] = temp` immediately before returning the recursive boolean result.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Word exists sequentially',
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
        expected: 'true'
      },
      {
        id: 't2',
        name: 'Word not in grid',
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"',
        expected: 'false'
      }
    ]
  },

  // 11. TREES: Invert Binary Tree
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree (Tree Recursion)',
    difficulty: 'Easy',
    category: 'Trees',
    language: 'javascript',
    description: `Given the root of a binary tree, invert the tree (mirror all left and right children recursively), and return its root.
The current code fails because it overwrites root.left before inverting root.right, causing the right subtree to be lost and processed twice. Fix the recursive swap!`,
    brokenCode: `// Fix the child node swap order!
function invertTree(root) {
  if (!root) return null;

  // BUG: Overwrites root.left immediately so root.right becomes the newly inverted left!
  root.left = invertTree(root.right);
  root.right = invertTree(root.left);

  return root;
}

module.exports = { invertTree };
`,
    solutionCode: `function invertTree(root) {
  if (!root) return null;

  const left = invertTree(root.left);
  const right = invertTree(root.right);

  root.left = right;
  root.right = left;

  return root;
}

module.exports = { invertTree };
`,
    starterCodes: {
      javascript: `// Fix the child node swap order!
function invertTree(root) {
  if (!root) return null;

  // BUG: Swapping in-place without holding temporary reference
  root.left = invertTree(root.right);
  root.right = invertTree(root.left);

  return root;
}
`,
      python: `# Fix the child node swap order!
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def invertTree(self, root: TreeNode | None) -> TreeNode | None:
        if not root:
            return None
            
        # BUG: Lost reference to original left subtree
        root.left = self.invertTree(root.right)
        root.right = self.invertTree(root.left)
        return root
`,
      cpp: `// Fix the child node swap order!
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        
        // BUG: Incomplete swap
        root->left = invertTree(root->right);
        root->right = invertTree(root->left);
        return root;
    }
};
`,
      java: `// Fix the child node swap order!
public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        
        // BUG: Swapping logic overwrites reference
        root.left = invertTree(root.right);
        root.right = invertTree(root.left);
        return root;
    }
}
`
    },
    solutions: {
      javascript: `function invertTree(root) {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}`,
      python: `class Solution:
    def invertTree(self, root):
        if not root:
            return None
        left = self.invertTree(root.left)
        right = self.invertTree(root.right)
        root.left = right
        root.right = left
        return root`,
      cpp: `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* left = invertTree(root->left);
        TreeNode* right = invertTree(root->right);
        root->left = right;
        root->right = left;
        return root;
    }
};`,
      java: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}`
    },
    hints: [
      'Save the result of `invertTree(root.left)` and `invertTree(root.right)` in temporary variables first.',
      'Assign `root.left = right` and `root.right = left`.',
      'Return `root`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Invert 3-level Binary Tree',
        input: 'root = [4,2,7,1,3,6,9]',
        expected: '[4,7,2,9,6,3,1]'
      },
      {
        id: 't2',
        name: 'Invert 2-node Tree',
        input: 'root = [2,1,3]',
        expected: '[2,3,1]'
      },
      {
        id: 't3',
        name: 'Empty Tree',
        input: 'root = []',
        expected: '[]'
      }
    ]
  },

  // 12. DYNAMIC PROGRAMMING: Min Cost Climbing Stairs
  {
    id: 'min-cost-climbing-stairs',
    title: 'Min Cost Climbing Stairs (1D DP)',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    language: 'javascript',
    description: `You are given an integer array 'cost' where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from index 0 or index 1. Return the minimum cost to reach the top of the floor (index n).
The current code fails because it returns cost at n-1 instead of considering step over to top floor, or computes O(2^N) exponential branches without memoization. Fix the O(N) DP progression!`,
    brokenCode: `// Fix the base cases and recurrence relation!
function minCostClimbingStairs(cost) {
  const n = cost.length;
  // BUG: dp array size incorrect for top of stairs (n)
  const dp = new Array(n);
  dp[0] = cost[0];
  dp[1] = cost[1];

  for (let i = 2; i < n; i++) {
    // BUG: Missing cost[i] in the recurrence
    dp[i] = Math.min(dp[i - 1], dp[i - 2]);
  }

  // BUG: Returns step n-1 instead of top of the staircase
  return dp[n - 1];
}

module.exports = { minCostClimbingStairs };
`,
    solutionCode: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  let first = cost[0];
  let second = cost[1];

  for (let i = 2; i < n; i++) {
    const current = cost[i] + Math.min(first, second);
    first = second;
    second = current;
  }

  return Math.min(first, second);
}

module.exports = { minCostClimbingStairs };
`,
    starterCodes: {
      javascript: `// Fix the base cases and recurrence relation!
function minCostClimbingStairs(cost) {
  const n = cost.length;
  const dp = new Array(n);
  dp[0] = cost[0];
  dp[1] = cost[1];

  for (let i = 2; i < n; i++) {
    dp[i] = Math.min(dp[i - 1], dp[i - 2]);
  }

  return dp[n - 1];
}
`,
      python: `# Fix the 1D DP recurrence relation!
class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        n = len(cost)
        dp = [0] * n
        dp[0], dp[1] = cost[0], cost[1]
        
        for i in range(2, n):
            # BUG: Misses cost of current step
            dp[i] = min(dp[i - 1], dp[i - 2])
            
        return dp[n - 1]
`,
      cpp: `// Fix the 1D DP recurrence relation!
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int n = cost.size();
        vector<int> dp(n);
        dp[0] = cost[0];
        dp[1] = cost[1];
        
        for (int i = 2; i < n; i++) {
            dp[i] = min(dp[i - 1], dp[i - 2]);
        }
        return dp[n - 1];
    }
};
`,
      java: `// Fix the 1D DP recurrence relation!
class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int n = cost.length;
        int[] dp = new int[n];
        dp[0] = cost[0];
        dp[1] = cost[1];
        
        for (int i = 2; i < n; i++) {
            dp[i] = Math.min(dp[i - 1], dp[i - 2]);
        }
        return dp[n - 1];
    }
}
`
    },
    solutions: {
      javascript: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  let first = cost[0];
  let second = cost[1];
  for (let i = 2; i < n; i++) {
    const current = cost[i] + Math.min(first, second);
    first = second;
    second = current;
  }
  return Math.min(first, second);
}`,
      python: `class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        first, second = cost[0], cost[1]
        for i in range(2, len(cost)):
            current = cost[i] + min(first, second)
            first, second = second, current
        return min(first, second)`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int first = cost[0], second = cost[1];
        for (int i = 2; i < cost.size(); i++) {
            int current = cost[i] + min(first, second);
            first = second;
            second = current;
        }
        return min(first, second);
    }
};`,
      java: `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int first = cost[0], second = cost[1];
        for (int i = 2; i < cost.length; i++) {
            int current = cost[i] + Math.min(first, second);
            first = second;
            second = current;
        }
        return Math.min(first, second);
    }
}`
    },
    hints: [
      'To reach step `i`, you must pay `cost[i]` plus the minimum of reaching `i-1` or `i-2`.',
      'The top floor can be reached from either step `n-1` or `n-2`.',
      'Return `Math.min(minCost(n-1), minCost(n-2))`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Short Staircase',
        input: 'cost = [10, 15, 20]',
        expected: '15 (Start at index 1, climb 2 steps to top)'
      },
      {
        id: 't2',
        name: 'Alternating Costs',
        input: 'cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]',
        expected: '6'
      }
    ]
  },

  // 13. STACKS: Valid Parentheses & Depth
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses (Stack Matching)',
    difficulty: 'Easy',
    category: 'Stacks & Strings',
    language: 'javascript',
    description: `Given a string 's' containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets in the correct order, and every close bracket has a corresponding open bracket.
The current code fails on bracket mismatch (e.g. '(]' or '([)]') and fails when closing bracket appears with empty stack. Fix the stack validation!`,
    brokenCode: `// Fix the stack matching for all bracket types!
function isValid(s) {
  const stack = [];
  
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else {
      // BUG: Pops without verifying matching bracket pair!
      stack.pop();
    }
  }

  return stack.length === 0;
}

module.exports = { isValid };
`,
    solutionCode: `function isValid(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else if (map[c]) {
      if (stack.length === 0 || stack.pop() !== map[c]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

module.exports = { isValid };
`,
    starterCodes: {
      javascript: `// Fix the stack matching for all bracket types!
function isValid(s) {
  const stack = [];
  
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else {
      // BUG: Pops without verifying matching pair
      stack.pop();
    }
  }

  return stack.length === 0;
}
`,
      python: `# Fix the stack matching for all bracket types!
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        
        for c in s:
            if c in '({[':
                stack.append(c)
            else:
                # BUG: Stack pop without matching check or empty guard
                stack.pop()
                
        return len(stack) == 0
`,
      cpp: `// Fix the stack matching for all bracket types!
#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                st.pop(); // BUG: Doesn't check bracket type equality
            }
        }
        return st.empty();
    }
};
`,
      java: `// Fix the stack matching for all bracket types!
import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                stack.pop(); // BUG: Doesn't verify character match
            }
        }
        return stack.isEmpty();
    }
}
`
    },
    solutions: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else if (map[c]) {
      if (stack.length === 0 || stack.pop() !== map[c]) return false;
    }
  }
  return stack.length === 0;
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for c in s:
            if c in '({[':
                stack.append(c)
            elif c in mapping:
                if not stack or stack.pop() != mapping[c]:
                    return False
        return len(stack) == 0`,
      cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`
    },
    hints: [
      'Use a hash map mapping closing brackets `")" -> "(", "}" -> "{", "]" -> "["`.',
      'When seeing an opening bracket, push to stack.',
      'When seeing a closing bracket, check `if (stack.length === 0 || stack.pop() !== map[c]) return false`.'
    ],
    testCases: [
      {
        id: 't1',
        name: 'Balanced Mixed Brackets',
        input: 's = "()[]{}"',
        expected: 'true'
      },
      {
        id: 't2',
        name: 'Mismatched Types',
        input: 's = "(]"',
        expected: 'false'
      },
      {
        id: 't3',
        name: 'Incorrect Nesting Order',
        input: 's = "([)]"',
        expected: 'false'
      },
      {
        id: 't4',
        name: 'Nested Matching',
        input: 's = "{[]}"',
        expected: 'true'
      }
    ]
  }
];

