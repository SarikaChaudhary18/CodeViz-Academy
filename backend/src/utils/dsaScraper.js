const DsaProblem = require('../models/DsaProblem');
const logger = require('../config/logger');

// ─── NeetCode 150 ─────────────────────────────────────────────────────────────
const NEETCODE_QUESTIONS = [
  // Arrays & Hashing
  { title: 'Contains Duplicate', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Easy', link: 'https://leetcode.com/problems/contains-duplicate/' },
  { title: 'Valid Anagram', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/' },
  { title: 'Two Sum', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/' },
  { title: 'Group Anagrams', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/group-anagrams/' },
  { title: 'Top K Frequent Elements', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  { title: 'Product of Array Except Self', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { title: 'Valid Sudoku', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/valid-sudoku/' },
  { title: 'Encode and Decode Strings', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/encode-and-decode-strings/' },
  { title: 'Longest Consecutive Sequence', category: 'Arrays & Hashing', subCategory: 'Arrays & Hashing', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
  // Two Pointers
  { title: 'Valid Palindrome', category: 'Two Pointers', subCategory: 'Two Pointers', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/' },
  { title: 'Two Sum II - Input Array Is Sorted', category: 'Two Pointers', subCategory: 'Two Pointers', difficulty: 'Medium', link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
  { title: '3Sum', category: 'Two Pointers', subCategory: 'Two Pointers', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/' },
  { title: 'Container With Most Water', category: 'Two Pointers', subCategory: 'Two Pointers', difficulty: 'Medium', link: 'https://leetcode.com/problems/container-with-most-water/' },
  { title: 'Trapping Rain Water', category: 'Two Pointers', subCategory: 'Two Pointers', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/' },
  // Sliding Window
  { title: 'Best Time to Buy and Sell Stock', category: 'Sliding Window', subCategory: 'Sliding Window', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { title: 'Longest Substring Without Repeating Characters', category: 'Sliding Window', subCategory: 'Sliding Window', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { title: 'Longest Repeating Character Replacement', category: 'Sliding Window', subCategory: 'Sliding Window', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
  { title: 'Permutation in String', category: 'Sliding Window', subCategory: 'Sliding Window', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutation-in-string/' },
  { title: 'Minimum Window Substring', category: 'Sliding Window', subCategory: 'Sliding Window', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-window-substring/' },
  { title: 'Sliding Window Maximum', category: 'Sliding Window', subCategory: 'Sliding Window', difficulty: 'Hard', link: 'https://leetcode.com/problems/sliding-window-maximum/' },
  // Stack
  { title: 'Valid Parentheses', category: 'Stack', subCategory: 'Stack', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/' },
  { title: 'Min Stack', category: 'Stack', subCategory: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/min-stack/' },
  { title: 'Evaluate Reverse Polish Notation', category: 'Stack', subCategory: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
  { title: 'Generate Parentheses', category: 'Stack', subCategory: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/generate-parentheses/' },
  { title: 'Daily Temperatures', category: 'Stack', subCategory: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/daily-temperatures/' },
  { title: 'Car Fleet', category: 'Stack', subCategory: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/car-fleet/' },
  { title: 'Largest Rectangle in Histogram', category: 'Stack', subCategory: 'Stack', difficulty: 'Hard', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
  // Binary Search
  { title: 'Binary Search', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-search/' },
  { title: 'Search a 2D Matrix', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-a-2d-matrix/' },
  { title: 'Koko Eating Bananas', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/koko-eating-bananas/' },
  { title: 'Find Minimum in Rotated Sorted Array', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  { title: 'Search in Rotated Sorted Array', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { title: 'Time Based Key-Value Store', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/time-based-key-value-store/' },
  { title: 'Median of Two Sorted Arrays', category: 'Binary Search', subCategory: 'Binary Search', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  // Linked List
  { title: 'Reverse Linked List', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/' },
  { title: 'Merge Two Sorted Lists', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { title: 'Reorder List', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/reorder-list/' },
  { title: 'Remove Nth Node From End of List', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
  { title: 'Copy List with Random Pointer', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
  { title: 'Add Two Numbers', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/add-two-numbers/' },
  { title: 'Linked List Cycle', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/' },
  { title: 'Find the Duplicate Number', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-the-duplicate-number/' },
  { title: 'LRU Cache', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/lru-cache/' },
  { title: 'Merge k Sorted Lists', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Hard', link: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
  { title: 'Reverse Nodes in k-Group', category: 'Linked List', subCategory: 'Linked List', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
  // Trees
  { title: 'Invert Binary Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/' },
  { title: 'Maximum Depth of Binary Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { title: 'Diameter of Binary Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
  { title: 'Balanced Binary Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/balanced-binary-tree/' },
  { title: 'Same Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/same-tree/' },
  { title: 'Subtree of Another Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: 'https://leetcode.com/problems/subtree-of-another-tree/' },
  { title: 'Lowest Common Ancestor of a Binary Search Tree', category: 'Trees', subCategory: 'BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
  { title: 'Binary Tree Level Order Traversal', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { title: 'Binary Tree Right Side View', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
  { title: 'Count Good Nodes in Binary Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/' },
  { title: 'Validate Binary Search Tree', category: 'Trees', subCategory: 'BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  { title: 'Kth Smallest Element in a BST', category: 'Trees', subCategory: 'BST', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
  { title: 'Construct Binary Tree from Preorder and Inorder Traversal', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
  { title: 'Binary Tree Maximum Path Sum', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
  { title: 'Serialize and Deserialize Binary Tree', category: 'Trees', subCategory: 'Binary Tree', difficulty: 'Hard', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
  // Heap / Priority Queue
  { title: 'Kth Largest Element in a Stream', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Easy', link: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
  { title: 'Last Stone Weight', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Easy', link: 'https://leetcode.com/problems/last-stone-weight/' },
  { title: 'K Closest Points to Origin', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
  { title: 'Kth Largest Element in an Array', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { title: 'Task Scheduler', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/task-scheduler/' },
  { title: 'Design Twitter', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/design-twitter/' },
  { title: 'Find Median from Data Stream', category: 'Heap / Priority Queue', subCategory: 'Heap', difficulty: 'Hard', link: 'https://leetcode.com/problems/find-median-from-data-stream/' },
  // Backtracking
  { title: 'Subsets', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets/' },
  { title: 'Combination Sum', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum/' },
  { title: 'Permutations', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/permutations/' },
  { title: 'Subsets II', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/subsets-ii/' },
  { title: 'Combination Sum II', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum-ii/' },
  { title: 'Word Search', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-search/' },
  { title: 'Palindrome Partitioning', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindrome-partitioning/' },
  { title: 'Letter Combinations of a Phone Number', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
  { title: 'N-Queens', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: 'https://leetcode.com/problems/n-queens/' },
  // Graphs
  { title: 'Number of Islands', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/' },
  { title: 'Clone Graph', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/' },
  { title: 'Max Area of Island', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/max-area-of-island/' },
  { title: 'Pacific Atlantic Water Flow', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
  { title: 'Surrounded Regions', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/surrounded-regions/' },
  { title: 'Rotting Oranges', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotting-oranges/' },
  { title: 'Walls and Gates', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/walls-and-gates/' },
  { title: 'Course Schedule', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/' },
  { title: 'Course Schedule II', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule-ii/' },
  { title: 'Redundant Connection', category: 'Graphs', subCategory: 'Union Find', difficulty: 'Medium', link: 'https://leetcode.com/problems/redundant-connection/' },
  { title: 'Number of Connected Components in an Undirected Graph', category: 'Graphs', subCategory: 'Union Find', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
  { title: 'Graph Valid Tree', category: 'Graphs', subCategory: 'Union Find', difficulty: 'Medium', link: 'https://leetcode.com/problems/graph-valid-tree/' },
  { title: 'Word Ladder', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-ladder/' },
  // Dynamic Programming 1D
  { title: 'Climbing Stairs', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/' },
  { title: 'Min Cost Climbing Stairs', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Easy', link: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
  { title: 'House Robber', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/' },
  { title: 'House Robber II', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber-ii/' },
  { title: 'Longest Palindromic Substring', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { title: 'Palindromic Substrings', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindromic-substrings/' },
  { title: 'Decode Ways', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/decode-ways/' },
  { title: 'Coin Change', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/' },
  { title: 'Maximum Product Subarray', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-product-subarray/' },
  { title: 'Word Break', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/' },
  { title: 'Longest Increasing Subsequence', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  { title: 'Partition Equal Subset Sum', category: 'Dynamic Programming', subCategory: '1D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
  // DP 2D
  { title: 'Unique Paths', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/' },
  { title: 'Longest Common Subsequence', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/' },
  { title: 'Best Time to Buy and Sell Stock with Cooldown', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/' },
  { title: 'Coin Change II', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change-ii/' },
  { title: 'Target Sum', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/target-sum/' },
  { title: 'Interleaving String', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/interleaving-string/' },
  { title: 'Longest Increasing Path in a Matrix', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Hard', link: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
  { title: 'Distinct Subsequences', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Hard', link: 'https://leetcode.com/problems/distinct-subsequences/' },
  { title: 'Edit Distance', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Hard', link: 'https://leetcode.com/problems/edit-distance/' },
  { title: 'Burst Balloons', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Hard', link: 'https://leetcode.com/problems/burst-balloons/' },
  { title: 'Regular Expression Matching', category: 'Dynamic Programming', subCategory: '2D DP', difficulty: 'Hard', link: 'https://leetcode.com/problems/regular-expression-matching/' },
  // Greedy
  { title: 'Maximum Subarray', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/' },
  { title: 'Jump Game', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game/' },
  { title: 'Jump Game II', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game-ii/' },
  { title: 'Gas Station', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/gas-station/' },
  { title: 'Hand of Straights', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/hand-of-straights/' },
  { title: 'Merge Triplets to Form Target Triplet', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/' },
  { title: 'Partition Labels', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/partition-labels/' },
  { title: 'Valid Parenthesis String', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/valid-parenthesis-string/' },
  // Intervals
  { title: 'Insert Interval', category: 'Intervals', subCategory: 'Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/insert-interval/' },
  { title: 'Merge Intervals', category: 'Intervals', subCategory: 'Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/' },
  { title: 'Non-overlapping Intervals', category: 'Intervals', subCategory: 'Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/non-overlapping-intervals/' },
  { title: 'Meeting Rooms', category: 'Intervals', subCategory: 'Intervals', difficulty: 'Easy', link: 'https://leetcode.com/problems/meeting-rooms/' },
  { title: 'Meeting Rooms II', category: 'Intervals', subCategory: 'Intervals', difficulty: 'Medium', link: 'https://leetcode.com/problems/meeting-rooms-ii/' },
  { title: 'Minimum Interval to Include Each Query', category: 'Intervals', subCategory: 'Intervals', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/' },
  // Math & Geometry
  { title: 'Rotate Image', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/' },
  { title: 'Spiral Matrix', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Medium', link: 'https://leetcode.com/problems/spiral-matrix/' },
  { title: 'Set Matrix Zeroes', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/' },
  { title: 'Happy Number', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Easy', link: 'https://leetcode.com/problems/happy-number/' },
  { title: 'Plus One', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Easy', link: 'https://leetcode.com/problems/plus-one/' },
  { title: 'Pow(x, n)', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Medium', link: 'https://leetcode.com/problems/powx-n/' },
  { title: 'Multiply Strings', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Medium', link: 'https://leetcode.com/problems/multiply-strings/' },
  { title: 'Detect Squares', category: 'Math & Geometry', subCategory: 'Math', difficulty: 'Medium', link: 'https://leetcode.com/problems/detect-squares/' },
  // Bit Manipulation
  { title: 'Single Number', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: 'https://leetcode.com/problems/single-number/' },
  { title: 'Number of 1 Bits', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: 'https://leetcode.com/problems/number-of-1-bits/' },
  { title: 'Counting Bits', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: 'https://leetcode.com/problems/counting-bits/' },
  { title: 'Reverse Bits', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-bits/' },
  { title: 'Missing Number', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: 'https://leetcode.com/problems/missing-number/' },
  { title: 'Sum of Two Integers', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: 'https://leetcode.com/problems/sum-of-two-integers/' },
  { title: 'Reverse Integer', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: 'https://leetcode.com/problems/reverse-integer/' },
];

// ─── Love Babbar 450 ──────────────────────────────────────────────────────────
function gfgLink(slug) {
  return `https://www.geeksforgeeks.org/problems/${slug}/0`;
}

const BABBAR_QUESTIONS = [
  // ── Arrays (36) ──────────────────────────────────────────────────────────────
  { title: 'Reverse an Array/String', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('reverse-an-array') },
  { title: 'Find the maximum and minimum element in an array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('find-minimum-and-maximum-element-in-an-array') },
  { title: 'Find the Kth max and min element of an array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('kth-smallest-element5635') },
  { title: 'Sort an array of 0s, 1s and 2s', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('sort-an-array-of-0s-1s-and-2s4231') },
  { title: 'Move all negative elements to one side of the array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('move-negative-elements-to-one-side-of-array') },
  { title: 'Find the Union and Intersection of two sorted arrays', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('union-of-two-sorted-arrays') },
  { title: 'Cyclically rotate an array by one', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('cyclically-rotate-an-array-by-one2614') },
  { title: 'Find Largest sum contiguous Subarray (Kadane)', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('kadanes-algorithm-maximum-subarray-sum') },
  { title: 'Minimize the maximum difference between heights', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('minimize-the-heights3351') },
  { title: 'Minimum no. of Jumps to reach end of an array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('minimum-number-of-jumps-to-reach-end-of-a-given-array') },
  { title: 'Find duplicate in an array of N+1 Integers', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('find-duplicates-in-an-array') },
  { title: 'Merge 2 sorted arrays without using Extra space', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Hard', link: gfgLink('merge-two-sorted-arrays-without-extra-space') },
  { title: "Kadane's Algorithm", category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('kadanes-algorithm-maximum-subarray-sum') },
  { title: 'Merge Intervals', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/' },
  { title: 'Next Permutation', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/' },
  { title: 'Count Inversions in an array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('number-of-inversions') },
  { title: 'Best time to buy and Sell stock', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { title: 'Find all pairs on integer array whose sum equals given number', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('count-pairs-with-given-sum5022') },
  { title: 'Find common elements in 3 sorted arrays', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('common-elements1132') },
  { title: 'Rearrange array in alternating positive and negative with O(1) extra space', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('array-of-alternate-ve-and-ve-nos1401') },
  { title: 'Find if there is any subarray with sum equal to 0', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('subarray-with-0-sum') },
  { title: 'Find factorial of a large number', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('factorials-of-large-numbers2508') },
  { title: 'Find maximum product subarray', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('maximum-product-subarray3604') },
  { title: 'Find longest consecutive subsequence', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('longest-consecutive-subsequence2151') },
  { title: 'Find all elements that appear more than n/k times in array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('count-element-occurences') },
  { title: 'Maximum profit by buying and selling a share at most twice', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Hard', link: gfgLink('buy-and-sell-a-share-at-most-twice') },
  { title: 'Find whether an array is a subset of another array', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('array-subset-of-another-array2317') },
  { title: 'Find the triplet that sum to a given value', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('triplet-sum-in-array-1587115621') },
  { title: 'Trapping Rain Water Problem', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Hard', link: gfgLink('trapping-rain-water-1587115621') },
  { title: 'Chocolate Distribution Problem', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('chocolate-distribution-problem3825') },
  { title: 'Smallest Subarray with sum greater than a given value', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('smallest-subarray-with-sum-greater-than-x') },
  { title: 'Three way partitioning of an array around a given value', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('three-way-partitioning') },
  { title: 'Minimum swaps required to bring elements <= K together', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('minimum-swaps-required-bring-elements-less-equal-k-together') },
  { title: 'Minimum operations required to make an array palindrome', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Medium', link: gfgLink('palindromic-array-1587115620') },
  { title: 'Median of 2 sorted arrays of equal size', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Hard', link: gfgLink('median-of-2-sorted-arrays-of-equal-size') },
  { title: 'Median of 2 sorted arrays of different size', category: 'Arrays', subCategory: 'Arrays', difficulty: 'Hard', link: gfgLink('median-of-2-sorted-arrays-of-different-sizes') },

  // ── Matrix (10) ──────────────────────────────────────────────────────────────
  { title: 'Spiral traversal on a Matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('spirally-traversing-a-matrix-1587115621') },
  { title: 'Search an element in a Matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('search-in-a-matrix-1587115621') },
  { title: 'Find median in a row wise sorted matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Hard', link: gfgLink('median-in-a-row-wise-sorted-matrix1527') },
  { title: 'Find row with maximum no. of 1s', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Easy', link: gfgLink('row-with-max-1s0023') },
  { title: 'Print elements in sorted order using row-column wise sorted matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('sorted-matrix2tire') },
  { title: 'Maximum size rectangle in binary matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Hard', link: gfgLink('max-rectangle') },
  { title: 'Find a specific pair in matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('find-a-specific-pair-in-matrix') },
  { title: 'Rotate matrix by 90 degrees', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('rotate-by-90-degree-1587115621') },
  { title: 'Kth smallest element in a row-column wise sorted matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('kth-element-in-matrix') },
  { title: 'Common elements in all rows of a given matrix', category: 'Matrix', subCategory: 'Matrix', difficulty: 'Medium', link: gfgLink('common-elements-in-all-rows-of-a-given-matrix') },

  // ── Strings (43) ─────────────────────────────────────────────────────────────
  { title: 'Reverse a String', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('reverse-a-string') },
  { title: 'Check whether a String is Palindrome or not', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('palindrome-string0817') },
  { title: 'Find Duplicate characters in a string', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('find-all-duplicate-characters-in-string') },
  { title: 'Check whether one string is a rotation of another', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('check-if-string-is-rotated-by-two-places-1587115620') },
  { title: 'Check whether a string is a valid shuffle of two strings', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('check-if-string-is-a-valid-shuffle-of-two-distinct-strings') },
  { title: 'Count and Say Problem', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/count-and-say/' },
  { title: 'Longest Palindromic Substring', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { title: 'Find Longest Recurring Subsequence in String', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('longest-repeating-subsequence') },
  { title: 'Print all Subsequences of a string', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('print-subsequences-string') },
  { title: 'Print all the permutations of the given string', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('permutations-of-a-given-string2041') },
  { title: 'Split the Binary string into two substrings with equal 0s and 1s', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('split-the-binary-string-into-substrings-with-equal-number-of-0s-and-1s') },
  { title: 'Word Wrap Problem', category: 'Strings', subCategory: 'Strings', difficulty: 'Hard', link: gfgLink('word-wrap') },
  { title: 'EDIT Distance', category: 'Strings', subCategory: 'Strings', difficulty: 'Hard', link: gfgLink('edit-distance3702') },
  { title: 'Find next greater number with same set of digits', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/' },
  { title: 'Balanced Parenthesis Problem', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('parenthesis-checker2744') },
  { title: 'Word Break Problem', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-break/' },
  { title: 'Rabin Karp Algorithm', category: 'Strings', subCategory: 'Pattern Matching', difficulty: 'Hard', link: gfgLink('implement-your-atoi') },
  { title: 'KMP Algorithm', category: 'Strings', subCategory: 'Pattern Matching', difficulty: 'Hard', link: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/' },
  { title: 'Convert a Sentence into mobile numeric keypad sequence', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('convert-sentence-to-mobile-numeric-keypad-sequence') },
  { title: 'Minimum number of bracket reversals to balance expression', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('minimum-number-of-bracket-reversals-needed-to-make-an-expression-balanced') },
  { title: 'Count All Palindromic Subsequence in a given String', category: 'Strings', subCategory: 'Strings', difficulty: 'Hard', link: gfgLink('count-palindromic-subsequences') },
  { title: 'Count of number of given string in 2D character array', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('count-occurrence-of-a-given-word-in-a-2d-array') },
  { title: 'Search a Word in a 2D Grid of characters', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('word-search') },
  { title: 'Boyer Moore Algorithm for Pattern Searching', category: 'Strings', subCategory: 'Pattern Matching', difficulty: 'Hard', link: gfgLink('boyer-moore-algorithm-for-pattern-searching') },
  { title: 'Converting Roman Numerals to Decimal', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('roman-number-to-integer3201') },
  { title: 'Longest Common Prefix', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: 'https://leetcode.com/problems/longest-common-prefix/' },
  { title: 'Number of flips to make binary string alternate', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('min-number-of-flips') },
  { title: 'Find the first repeated word in string', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('second-repeated-word-in-a-sequence0') },
  { title: 'Minimum number of swaps for bracket balancing', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('minimum-number-of-bracket-reversals-needed-to-make-an-expression-balanced') },
  { title: 'Find the longest common subsequence between two strings', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('longest-common-subsequence-1587115620') },
  { title: 'Generate all possible valid IP addresses from given string', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('generate-ip-addresses') },
  { title: 'Find the smallest window that contains all characters of string itself', category: 'Strings', subCategory: 'Strings', difficulty: 'Hard', link: gfgLink('smallest-window-in-a-string-containing-all-the-characters-of-another-string-1587115621') },
  { title: 'Rearrange characters so no two adjacent are same', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('rearrange-characters4649') },
  { title: 'Minimum characters to add at front to make string palindrome', category: 'Strings', subCategory: 'Strings', difficulty: 'Hard', link: gfgLink('minimum-characters-to-be-added-at-front-to-make-string-palindrome') },
  { title: 'Given a sequence of words, print all anagrams together', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('anagram-of-string') },
  { title: 'Find the smallest window containing all characters of another string', category: 'Strings', subCategory: 'Strings', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-window-substring/' },
  { title: 'Recursively remove all adjacent duplicates', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('recursively-remove-all-adjacent-duplicates') },
  { title: 'String matching where one string contains wildcard characters', category: 'Strings', subCategory: 'Pattern Matching', difficulty: 'Hard', link: gfgLink('wildcard-string-matching') },
  { title: 'Transform One String to Another using Minimum Number of Given Operation', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('transform-one-string-to-another-using-minimum-number-of-given-operation') },
  { title: 'Check if two given strings are isomorphic to each other', category: 'Strings', subCategory: 'Strings', difficulty: 'Easy', link: gfgLink('isomorphic-strings-1587115620') },
  { title: 'Recursively print all sentences from list of word lists', category: 'Strings', subCategory: 'Strings', difficulty: 'Medium', link: gfgLink('recursively-print-all-sentences-that-can-be-formed-from-list-of-word-lists') },

  // ── Searching & Sorting (35) ─────────────────────────────────────────────────
  { title: 'Find first and last positions of an element in a sorted array', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Medium', link: gfgLink('first-and-last-occurrences-of-x3116') },
  { title: 'Find a Fixed Point (Value equal to index) in a given array', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Easy', link: gfgLink('value-equal-to-index-value1330') },
  { title: 'Search in a rotated sorted array', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { title: 'Square root of an integer', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Easy', link: gfgLink('square-root') },
  { title: 'Maximum and minimum of an array using minimum number of comparisons', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Easy', link: gfgLink('find-minimum-and-maximum-element-in-an-array') },
  { title: 'Optimum location of point to minimize total distance', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Medium', link: gfgLink('optimum-location-of-point-to-minimize-total-distance') },
  { title: 'Find the repeating and the missing', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Medium', link: gfgLink('find-missing-and-repeating2512') },
  { title: 'Find majority element', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Easy', link: gfgLink('majority-element-1587115620') },
  { title: 'Searching in an array where adjacent differ by at most k', category: 'Searching & Sorting', subCategory: 'Searching', difficulty: 'Easy', link: gfgLink('searching-in-an-array-where-adjacent-differ-by-at-most-k') },
  { title: 'Find a pair with a given difference', category: 'Searching & Sorting', subCategory: 'Searching', difficulty: 'Easy', link: gfgLink('find-pair-given-difference1559') },
  { title: 'Find four elements that sum to a given value', category: 'Searching & Sorting', subCategory: 'Searching', difficulty: 'Medium', link: gfgLink('find-all-four-sum-numbers1732') },
  { title: 'Maximum sum such that no 2 elements are adjacent', category: 'Searching & Sorting', subCategory: 'Dynamic Programming', difficulty: 'Medium', link: gfgLink('stickler-thief-1587115621') },
  { title: 'Count triplet with sum smaller than a given value', category: 'Searching & Sorting', subCategory: 'Searching', difficulty: 'Medium', link: gfgLink('count-triplets-with-sum-smaller-than-x5549') },
  { title: 'Merge 2 sorted arrays', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Easy', link: gfgLink('merge-two-sorted-arrays5helper') },
  { title: 'Product array Puzzle', category: 'Searching & Sorting', subCategory: 'Arrays', difficulty: 'Easy', link: gfgLink('product-array-puzzle4525') },
  { title: 'Sort array according to count of set bits', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Medium', link: gfgLink('sort-array-according-to-set-bits-count-1587115621') },
  { title: 'Minimum no. of swaps required to sort the array', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Medium', link: gfgLink('minimum-swaps-and-k-together') },
  { title: 'Find pivot element in a sorted array', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Easy', link: gfgLink('find-the-rotation-count-1587115620') },
  { title: 'K-th Element of Two Sorted Arrays', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Medium', link: gfgLink('k-th-element-of-two-sorted-array1317') },
  { title: 'Aggressive Cows (Binary Search)', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Hard', link: gfgLink('aggressive-cows') },
  { title: 'Book Allocation Problem', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Hard', link: gfgLink('allocate-minimum-number-of-pages0937') },
  { title: 'Job Scheduling Algorithm', category: 'Searching & Sorting', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('job-sequencing-problem-1587115620') },
  { title: 'Missing Number in AP', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Easy', link: gfgLink('missing-element-of-ap2228') },
  { title: 'Smallest number with at least n trailing zeroes in factorial', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Medium', link: gfgLink('smallest-factorial-number7223') },
  { title: 'Painters Partition Problem', category: 'Searching & Sorting', subCategory: 'Binary Search', difficulty: 'Hard', link: gfgLink('the-painters-partition-problem-1587115621') },
  { title: 'Subset Sums', category: 'Searching & Sorting', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('subset-sums2234') },
  { title: 'Find the inversion count', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Medium', link: gfgLink('number-of-inversions') },
  { title: 'Implement Merge-sort in-place', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Medium', link: gfgLink('merge-sort') },
  { title: 'Partitioning and Sorting Arrays with Many Repeated Entries', category: 'Searching & Sorting', subCategory: 'Sorting', difficulty: 'Medium', link: gfgLink('sort-an-array-of-0s-1s-and-2s4231') },

  // ── LinkedList (35) ─────────────────────────────────────────────────────────
  { title: 'Reverse the Linked List (Iterative and Recursive)', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('reverse-linked-list') },
  { title: 'Reverse a Linked List in group of Given Size', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('reverse-a-linked-list-in-groups-of-given-size1542') },
  { title: 'Detect loop in a linked list', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('detect-loop-in-linked-list') },
  { title: 'Delete loop in a linked list', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('remove-loop-in-linked-list') },
  { title: 'Find the starting point of the loop', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('find-the-first-node-of-loop-in-linked-list--170645') },
  { title: 'Remove Duplicates in a sorted Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('remove-duplicate-element-from-sorted-linked-list') },
  { title: 'Remove Duplicates in an Un-sorted Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('remove-duplicates-from-an-unsorted-linked-list') },
  { title: 'Move the last element to Front in a Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('move-last-element-to-front-of-linked-list') },
  { title: 'Add 1 to a number represented as a Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('add-1-to-a-number-represented-as-linked-list') },
  { title: 'Add two numbers represented by linked lists', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('add-two-numbers-represented-by-linked-lists') },
  { title: 'Intersection of two Sorted Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('intersection-of-two-sorted-linked-lists') },
  { title: 'Intersection Point of two Linked Lists', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('intersection-point-in-y-shapped-linked-lists') },
  { title: 'Merge Sort For Linked Lists', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Hard', link: gfgLink('sort-a-linked-list') },
  { title: 'Quicksort for Linked Lists', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Hard', link: gfgLink('quick-sort-on-linked-list') },
  { title: 'Find the middle Element of a linked list', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('finding-middle-element-in-a-linked-list') },
  { title: 'Check if a linked list is a circular linked list', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('circular-linked-list') },
  { title: 'Split a Circular linked list into two halves', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('split-a-circular-linked-list-into-two-halves') },
  { title: 'Check whether the Singly Linked list is a palindrome', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('check-if-linked-list-is-pallindrome') },
  { title: 'Deletion from a Circular Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('circular-linked-list-deletion-1611829108') },
  { title: 'Reverse a Doubly Linked list', category: 'LinkedList', subCategory: 'Doubly Linked List', difficulty: 'Easy', link: gfgLink('reverse-a-doubly-linked-list') },
  { title: 'Find pairs with a given sum in a DLL', category: 'LinkedList', subCategory: 'Doubly Linked List', difficulty: 'Medium', link: gfgLink('find-pairs-with-given-sum-in-doubly-linked-list') },
  { title: 'Count triplets in a sorted DLL whose sum equals given value', category: 'LinkedList', subCategory: 'Doubly Linked List', difficulty: 'Medium', link: gfgLink('count-triplets-in-sorted-doubly-linked-list-whose-sum-is-equal-to-a-given-value-x') },
  { title: 'Sort a k-sorted Doubly Linked list', category: 'LinkedList', subCategory: 'Doubly Linked List', difficulty: 'Hard', link: gfgLink('sort-a-k-sorted-doubly-linked-list') },
  { title: 'Rotate Doubly Linked list by N nodes', category: 'LinkedList', subCategory: 'Doubly Linked List', difficulty: 'Medium', link: gfgLink('rotate-doubly-linked-list-n-places') },
  { title: 'Flatten a Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('flattening-a-linked-list') },
  { title: 'Sort a Linked List of 0s, 1s and 2s', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('given-a-linked-list-of-0s-1s-and-2s-sort-it') },
  { title: 'Clone a linked list with next and random pointer', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Hard', link: gfgLink('clone-linked-list-with-next-and-random-pointer') },
  { title: 'Merge K sorted Linked list', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Hard', link: gfgLink('merge-k-sorted-linked-lists') },
  { title: 'Multiply 2 numbers represented by Linked Lists', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('multiply-two-linked-lists') },
  { title: 'Delete nodes which have a greater value on right side', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Medium', link: gfgLink('delete-nodes-having-greater-value-on-right') },
  { title: 'Segregate even and odd nodes in a Linked List', category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('segregate-even-and-odd-nodes-in-a-linked-list5035') },
  { title: "Program for n'th node from the end of a Linked List", category: 'LinkedList', subCategory: 'LinkedList', difficulty: 'Easy', link: gfgLink('nth-node-from-end-of-linked-list') },

  // ── Bit Manipulation (10) ────────────────────────────────────────────────────
  { title: 'Count set bits in an integer', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: gfgLink('set-bits0215') },
  { title: 'Find the two non-repeating elements in an array of repeating elements', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: gfgLink('finding-the-numbers0215') },
  { title: 'Count number of bits to be flipped to convert A to B', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: gfgLink('bit-difference-1587115620') },
  { title: 'Count total set bits in all numbers from 1 to n', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: gfgLink('count-total-set-bits-1587115620') },
  { title: 'Program to find whether a no is power of two', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: gfgLink('power-of-2-1587115620') },
  { title: 'Find position of the only set bit', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: gfgLink('find-position-of-set-bit3706') },
  { title: 'Copy set bits in a range', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: gfgLink('copy-set-bits-in-a-range') },
  { title: 'Divide two integers without using multiplication, division and mod operator', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: 'https://leetcode.com/problems/divide-two-integers/' },
  { title: 'Calculate square of a number without using *, / and pow()', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Easy', link: gfgLink('square-of-a-number') },
  { title: 'Power Set using bit manipulation', category: 'Bit Manipulation', subCategory: 'Bit Manipulation', difficulty: 'Medium', link: gfgLink('power-set4302') },

  // ── Greedy (33) ─────────────────────────────────────────────────────────────
  { title: 'Activity Selection Problem', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('activity-selection-1587115582') },
  { title: 'Job Sequencing Problem', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('job-sequencing-problem-1587115620') },
  { title: 'Huffman Coding', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('huffman-coding') },
  { title: 'Water Connection Problem', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('water-connection-problem5822') },
  { title: 'Fractional Knapsack Problem', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('fractional-knapsack-1587115620') },
  { title: 'Greedy Algorithm to find Minimum number of Coins', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Easy', link: gfgLink('number-of-coins1824') },
  { title: 'Minimum Platforms Problem', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('minimum-platforms-1587115620') },
  { title: 'Buy Maximum Stocks if i stocks can be bought on i-th day', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('buy-maximum-stocks-if-i-stocks-can-be-bought-on-i-th-day') },
  { title: 'Find the minimum and maximum amount to buy all N candies', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Easy', link: gfgLink('minimum-number-of-candies') },
  { title: 'Minimize Cash Flow among friends who borrowed money from each other', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Hard', link: gfgLink('minimize-cash-flow') },
  { title: 'Minimum Cost to cut a board into squares', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('minimum-cost-to-cut-a-board-into-squares') },
  { title: 'Check if it is possible to survive on Island', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('survival') },
  { title: 'Find maximum meetings in one room', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('maximum-meetings-in-one-room') },
  { title: 'Maximum product subset of an array', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('maximum-product-subset-of-an-array') },
  { title: 'Maximize array sum after K negations', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Easy', link: gfgLink('maximize-sum-after-k-negations-1609580539') },
  { title: 'Maximize the sum of arr[i]*i', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Easy', link: gfgLink('maximize-arrii-of-an-array0026') },
  { title: 'Maximum sum of absolute difference of an array', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('maximum-sum-of-absolute-difference-of-an-array') },
  { title: 'Maximize sum of consecutive differences in a circular array', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('maximum-circular-sum') },
  { title: 'Minimum sum of absolute difference of pairs of two arrays', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('minimum-sum-of-absolute-differences-of-pairs') },
  { title: 'Program for Shortest Job First (SJF) CPU Scheduling', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('shortest-job-first') },
  { title: 'Program for Least Recently Used (LRU) Page Replacement', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Hard', link: gfgLink('lru-cache') },
  { title: 'Smallest subset with sum greater than all other elements', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Easy', link: gfgLink('smallest-subset-with-sum-greater-than-all-other-elements1212') },
  { title: 'Minimum Cost of ropes', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Easy', link: gfgLink('minimum-cost-of-ropes-1587115620') },
  { title: 'Find smallest number with given number of digits and sum of digits', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('smallest-number-with-sum-of-digits-as-s-and-length-as-d') },
  { title: 'Find maximum sum possible equal sum of three stacks', category: 'Greedy', subCategory: 'Greedy', difficulty: 'Medium', link: gfgLink('maximum-sum-with-equal-stack-sum') },

  // ── Backtracking (19) ────────────────────────────────────────────────────────
  { title: 'Rat in a maze Problem', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('rat-in-a-maze-problem') },
  { title: 'Printing all solutions in N-Queen Problem', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('n-queen-problem0315') },
  { title: 'Word Break Problem using Backtracking', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('word-break-part-23249') },
  { title: 'Remove Invalid Parentheses', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: 'https://leetcode.com/problems/remove-invalid-parentheses/' },
  { title: 'Sudoku Solver', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('solve-the-sudoku-1587115621') },
  { title: 'M Coloring Problem', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('m-coloring-problem-1587115620') },
  { title: 'Print all palindromic partitions of a string', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('find-all-possible-palindromic-partitions-of-a-string') },
  { title: 'Subset Sum Problem', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('subset-sum-problem-1611555638') },
  { title: "The Knight's tour problem", category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('the-knights-tour-problem-1587115621') },
  { title: 'Tug of War', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('tug-of-war') },
  { title: 'Find shortest safe route in a path with landmines', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('find-shortest-safe-route-in-a-matrix-with-landmines') },
  { title: 'Combinational Sum', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/combination-sum/' },
  { title: 'Find Maximum number possible by doing at-most K swaps', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('maximum-number-by-doing-at-most-k-swaps') },
  { title: 'Print all permutations of a string', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('permutations-of-a-given-string2041') },
  { title: 'Find if there is a path of more than k length from a source', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('find-if-there-is-a-path-of-more-than-k-length-from-a-source') },
  { title: 'Longest Possible Route in a Matrix with Hurdles', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('longest-possible-route-in-a-matrix-with-hurdles') },
  { title: 'Print all possible paths from top left to bottom right of a mXn matrix', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Medium', link: gfgLink('all-possible-paths-from-top-left-to-bottom-right-of-a-mxn-matrix') },
  { title: 'Partition of a set into K subsets with equal sum', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: gfgLink('partition-array-to-k-subsets') },
  { title: 'Find the K-th Permutation Sequence of first N natural numbers', category: 'Backtracking', subCategory: 'Backtracking', difficulty: 'Hard', link: 'https://leetcode.com/problems/permutation-sequence/' },

  // ── Dynamic Programming (54) ─────────────────────────────────────────────────
  { title: 'Coin Change Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('coin-change2789') },
  { title: '0-1 Knapsack Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('0-1-knapsack-problem0945') },
  { title: 'Binomial Coefficient Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('ncr1140') },
  { title: 'Permutation Coefficient Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('permutation-coefficient2445') },
  { title: 'Program for nth Catalan Number', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('nth-catalan-number0817') },
  { title: 'Matrix Chain Multiplication', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('matrix-chain-multiplication0') },
  { title: 'Edit Distance (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('edit-distance3702') },
  { title: 'Subset Sum Problem (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('subset-sum-problem-1611555638') },
  { title: 'Friends Pairing Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Easy', link: gfgLink('friends-pairing-problem5425') },
  { title: 'Gold Mine Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('gold-mine-problem2608') },
  { title: 'Assembly Line Scheduling Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('assembly-line-scheduling') },
  { title: 'Painting the Fence problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('painting-the-fence3727') },
  { title: 'Maximize The Cut Segments', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('cutted-segments1642') },
  { title: 'Longest Common Subsequence (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-common-subsequence-1587115620') },
  { title: 'Longest Repeated Subsequence', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-repeating-subsequence') },
  { title: 'Longest Increasing Subsequence (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-increasing-subsequence-1587115620') },
  { title: 'Space Optimized Solution of LCS', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('space-optimized-solution-of-lcs') },
  { title: 'LCS of three strings', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('lcs-of-three-strings0028') },
  { title: 'Maximum Sum Increasing Subsequence', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('maximum-sum-increasing-subsequence4749') },
  { title: 'Count all subsequences having product less than K', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('count-subsequences-with-product-less-than-k') },
  { title: 'Longest subsequence such that difference between adjacent is one', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-subsequence-such-that-difference-between-adjacents-is-one') },
  { title: 'Maximum subsequence sum such that no three are consecutive', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('maximum-sum-such-that-no-two-adjacent-are-selected') },
  { title: 'Egg Dropping Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('egg-drop-puzzle-1587115620') },
  { title: 'Maximum Length Chain of Pairs', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('max-length-chain') },
  { title: 'Maximum size square sub-matrix with all 1s', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('largest-square-formed-in-a-matrix') },
  { title: 'Maximum sum of pairs with specific difference', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('maximum-sum-of-pairs-with-specific-difference') },
  { title: 'Min Cost Path Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('path-in-matrix3805') },
  { title: 'Maximum difference of zeros and ones in binary string', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('maximum-difference-of-zeros-and-ones-in-binary-string') },
  { title: 'Minimum number of jumps to reach end', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('minimum-number-of-jumps-to-reach-end-of-a-given-array') },
  { title: 'Minimum cost to fill given weight in a bag', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('minimum-cost-to-fill-given-weight-in-a-bag') },
  { title: 'Longest Common Substring', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-common-substring1452') },
  { title: 'Count number of ways to reach a given score in a game', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('reach-a-given-score1525') },
  { title: 'Count Balanced Binary Trees of Height h', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('count-balanced-binarytrees-of-height-h') },
  { title: 'Largest Sum Contiguous Subarray', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('kadanes-algorithm-maximum-subarray-sum') },
  { title: 'Smallest sum contiguous subarray', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('smallest-sum-contiguous-subarray') },
  { title: 'Unbounded Knapsack (Repetition of items allowed)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('knapsack-with-duplicate-items4201') },
  { title: 'Word Break Problem (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('word-break-part-23249') },
  { title: 'Largest Independent Set Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('largest-independent-set-problem') },
  { title: 'Partition problem (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('subset-sum-problem-1611555638') },
  { title: 'Longest Palindromic Subsequence', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-palindromic-subsequence-1612327878') },
  { title: 'Count All Palindromic Subsequence in a given String (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('count-palindromic-subsequences') },
  { title: 'Longest Palindromic Substring (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { title: 'Longest alternating subsequence', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('longest-alternating-subsequence5951') },
  { title: 'Weighted Job Scheduling', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('job-sequencing-problem-1587115620') },
  { title: 'Coin game winner where every player has three choices', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('coin-game-winner-where-every-player-has-three-choices') },
  { title: 'Count Derangements', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('count-derangements-permutation-such-that-no-element-appears-in-its-original-position') },
  { title: 'Maximum profit by buying and selling a share at most twice (DP)', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('buy-and-sell-a-share-at-most-twice') },
  { title: 'Optimal Strategy for a Game', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('optimal-strategy-for-a-game-1587115620') },
  { title: 'Optimal Binary Search Tree', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('optimal-binary-search-tree-1587115620') },
  { title: 'Palindrome Partitioning Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('palindromic-patitioning4845') },
  { title: 'Mobile Numeric Keypad Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: gfgLink('mobile-numeric-keypad5693') },
  { title: 'Boolean Parenthesization Problem', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('boolean-parenthesization5610') },
  { title: 'Maximum sum rectangle in a 2D matrix', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('maximum-sum-rectangle-in-a-2d-matrix-1587115620') },
  { title: 'Maximum profit by buying and selling a share at most k times', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Hard', link: gfgLink('maximum-profit-from-stock-trading') },
  { title: 'Maximum Length of Pair Chain', category: 'Dynamic Programming', subCategory: 'DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-length-of-pair-chain/' },

  // ── Stacks & Queues (38) ─────────────────────────────────────────────────────
  { title: 'Implement Stack from Scratch', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('implement-stack-from-scratch') },
  { title: 'Implement Queue from Scratch', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Easy', link: gfgLink('implement-queue-using-array') },
  { title: 'Implement 2 stack in an array', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('implement-two-stacks-in-an-array') },
  { title: 'Find the middle element of a stack', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('delete-middle-element-of-a-stack') },
  { title: 'Implement N stacks in an Array', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Hard', link: gfgLink('implement-n-stacks-in-an-array') },
  { title: 'Check the expression has valid or Balanced parenthesis', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('parenthesis-checker2744') },
  { title: 'Reverse a String using Stack', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('reverse-a-string-using-stack') },
  { title: 'Design a Stack that supports getMin() in O(1) time and O(1) extra space', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('special-stack') },
  { title: 'Find the next Greater element', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('next-larger-element-1587115620') },
  { title: 'The Celebrity Problem', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('the-celebrity-problem') },
  { title: 'Arithmetic Expression evaluation', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Hard', link: gfgLink('expression-evaluation-1587115620') },
  { title: 'Evaluation of Postfix expression', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('evaluation-of-postfix-expression-1587115620') },
  { title: 'Insert an element at the bottom of a stack without other data structures', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('insert-an-element-at-the-bottom-of-a-stack') },
  { title: 'Reverse a stack using recursion', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('reverse-a-stack') },
  { title: 'Sort a Stack using recursion', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('sort-a-stack') },
  { title: 'Merge Overlapping Intervals', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('merge-intervals') },
  { title: 'Largest rectangular Area in Histogram', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Hard', link: gfgLink('maximum-rectangular-area-in-a-histogram-1587115620') },
  { title: 'Length of the Longest Valid Substring', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Hard', link: 'https://leetcode.com/problems/longest-valid-parentheses/' },
  { title: 'Expression contains redundant bracket or not', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Medium', link: gfgLink('expression-contains-redundant-bracket-or-not') },
  { title: 'Implement Stack using Queue', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('stack-using-two-queues') },
  { title: 'Implement Queue using Stack', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Easy', link: gfgLink('queue-using-two-stacks') },
  { title: 'Implement a Circular queue', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('circular-queue') },
  { title: 'LRU Cache Implementation', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Hard', link: gfgLink('lru-cache') },
  { title: 'Reverse the first K elements of a queue', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Easy', link: gfgLink('reverse-first-k-elements-of-queue') },
  { title: 'Interleave the first half of the queue with second half', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('interleave-the-first-half-of-the-queue-with-second-half') },
  { title: 'Find the first circular tour that visits all Petrol Pumps', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('circular-tour-1587115620') },
  { title: 'Minimum time required to rot all oranges', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('rotten-oranges') },
  { title: 'Distance of nearest cell having 1 in a binary matrix', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('distance-of-nearest-cell-having-1-1587115620') },
  { title: 'First negative integer in every window of size k', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Easy', link: gfgLink('first-negative-integer-in-every-window-of-size-k') },
  { title: 'Sum of minimum and maximum elements of all subarrays of size k', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('sum-of-minimum-and-maximum-elements-of-all-subarrays-of-size-k') },
  { title: 'Queue based approach for first non-repeating character in a stream', category: 'Stacks & Queues', subCategory: 'Queue', difficulty: 'Medium', link: gfgLink('first-non-repeating-character-in-a-stream') },
  { title: 'Next Smaller Element', category: 'Stacks & Queues', subCategory: 'Stack', difficulty: 'Easy', link: gfgLink('next-smaller-element-1587115620') },

  // ── Binary Trees (34) ────────────────────────────────────────────────────────
  { title: 'Level order traversal', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('level-order-traversal') },
  { title: 'Reverse Level Order traversal', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('reverse-level-order-traversal') },
  { title: 'Height of a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('height-of-binary-tree') },
  { title: 'Diameter of a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('diameter-of-binary-tree') },
  { title: 'Mirror of a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('mirror-tree') },
  { title: 'Inorder Traversal of a tree (Recursive and Iterative)', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('inorder-traversal') },
  { title: 'Preorder Traversal of a tree (Recursive and Iterative)', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('preorder-traversal') },
  { title: 'Postorder Traversal of a tree (Recursive and Iterative)', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('postorder-traversal') },
  { title: 'Left View of a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('left-view-of-binary-tree') },
  { title: 'Right View of Tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('right-view-of-binary-tree') },
  { title: 'Top View of a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('top-view-of-binary-tree') },
  { title: 'Bottom View of a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('bottom-view-of-binary-tree') },
  { title: 'Zig-Zag traversal of a binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('zigzag-tree-traversal') },
  { title: 'Check if a tree is balanced or not', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('check-for-balanced-tree') },
  { title: 'Diagonal Traversal of a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('diagonal-traversal-of-binary-tree') },
  { title: 'Boundary traversal of a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('boundary-traversal-of-binary-tree') },
  { title: 'Construct Binary Tree from String with Bracket Representation', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('construct-binary-tree-from-string-with-bracket-representataion') },
  { title: 'Convert Binary tree into Doubly Linked List', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Hard', link: gfgLink('binary-tree-to-dll') },
  { title: 'Convert Binary tree into Sum tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('transform-to-sum-tree') },
  { title: 'Construct Binary tree from Inorder and preorder traversal', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('construct-tree-1') },
  { title: 'Find minimum swaps required to convert a Binary tree into BST', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Hard', link: gfgLink('minimum-swaps-to-make-sequences-increasing-1587115620') },
  { title: 'Check if Binary tree is Sum tree or not', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('sum-tree') },
  { title: 'Check if all leaf nodes are at same level or not', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('leaf-at-same-level') },
  { title: 'Check if a Binary Tree contains duplicate subtrees of size 2 or more', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Hard', link: gfgLink('duplicate-subtrees') },
  { title: 'Check if 2 trees are mirror or not', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Easy', link: gfgLink('mirror-tree') },
  { title: 'Sum of Nodes on the Longest path from root to leaf node', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('sum-of-the-longest-bloodline-of-a-tree') },
  { title: 'Find Largest subtree sum in a tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('largest-subtree-sum') },
  { title: 'Maximum Sum of nodes in Binary tree such that no two are adjacent', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('maximum-sum-of-non-adjacent-nodes') },
  { title: 'Print all K Sum paths in a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('print-all-k-sum-paths-in-a-binary-tree') },
  { title: 'Find LCA in a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('lowest-common-ancestor-in-a-binary-tree') },
  { title: 'Find distance between 2 nodes in a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('min-distance-between-two-given-nodes-of-a-binary-tree') },
  { title: 'Kth Ancestor of node in a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('kth-ancestor-in-a-tree') },
  { title: 'Find all Duplicate subtrees in a Binary tree', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Hard', link: gfgLink('duplicate-subtrees') },
  { title: 'Tree Isomorphism Problem', category: 'Binary Trees', subCategory: 'Binary Tree', difficulty: 'Medium', link: gfgLink('check-if-tree-is-isomorphic') },

  // ── Binary Search Tree (22) ──────────────────────────────────────────────────
  { title: 'Find a value in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Easy', link: gfgLink('search-a-node-in-bst') },
  { title: 'Deletion of a node in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('delete-a-node-from-bst') },
  { title: 'Find min and max value in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Easy', link: gfgLink('minimum-element-in-bst') },
  { title: 'Find inorder successor and inorder predecessor in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('inorder-successor-in-bst') },
  { title: 'Check if a tree is a BST or not', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('check-for-bst') },
  { title: 'Populate Inorder successor of all nodes', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('populate-inorder-successor-for-all-nodes') },
  { title: 'Find LCA of 2 nodes in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('lowest-common-ancestor-in-a-bst') },
  { title: 'Construct BST from preorder traversal', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('construct-bst-from-preorder-traversal') },
  { title: 'Convert Binary tree into BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('binary-tree-to-bst') },
  { title: 'Convert a normal BST into a Balanced BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('normal-bst-to-balanced-bst') },
  { title: 'Merge two BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Hard', link: gfgLink('merge-two-bst-s') },
  { title: 'Find Kth largest element in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('kth-largest-element-in-bst') },
  { title: 'Find Kth smallest element in a BST', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('find-k-th-smallest-element-in-bst') },
  { title: 'Count pairs from 2 BST whose sum is equal to given value X', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Hard', link: gfgLink('count-pairs-from-two-bsts-whose-sum-is-equal-to-a-given-value-x') },
  { title: 'Find the median of BST in O(n) time and O(1) space', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Hard', link: gfgLink('find-the-median-of-bst-in-on-time-and-o1-space') },
  { title: 'Count BST nodes that lie in a given range', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('count-bst-nodes-that-lie-in-a-given-range') },
  { title: 'Replace every element with the least greater element on its right', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('replace-every-element-with-the-least-greater-element-on-its-right') },
  { title: 'Check preorder is valid or not (BST)', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('preorder-to-postorder') },
  { title: 'Check whether BST contains Dead end', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('check-whether-bst-contains-dead-end') },
  { title: 'Largest BST in a Binary Tree', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Hard', link: gfgLink('largest-bst') },
  { title: 'Flatten BST to sorted list', category: 'Binary Search Tree', subCategory: 'BST', difficulty: 'Medium', link: gfgLink('flatten-bst-to-sorted-list') },

  // ── Graphs (42) ─────────────────────────────────────────────────────────────
  { title: 'Create a Graph and Print it', category: 'Graphs', subCategory: 'Graph Basics', difficulty: 'Easy', link: gfgLink('print-adjacency-list-1587115620') },
  { title: 'Implement BFS algorithm', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Easy', link: gfgLink('bfs-traversal-of-graph') },
  { title: 'Implement DFS Algorithm', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Easy', link: gfgLink('depth-first-traversal-for-a-graph') },
  { title: 'Detect Cycle in Directed Graph using BFS/DFS', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('detect-cycle-in-a-directed-graph') },
  { title: 'Detect Cycle in UnDirected Graph using BFS/DFS', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('detect-cycle-in-an-undirected-graph') },
  { title: 'Search in a Maze', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('rat-in-a-maze-problem') },
  { title: 'Minimum Step by Knight', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('steps-by-knight5927') },
  { title: 'Flood fill algo', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Easy', link: gfgLink('flood-fill-algorithm') },
  { title: 'Clone a graph', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/' },
  { title: 'Making wired Connections', category: 'Graphs', subCategory: 'Graph Basics', difficulty: 'Medium', link: gfgLink('making-wired-connections') },
  { title: 'Word Ladder (Graph)', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Hard', link: 'https://leetcode.com/problems/word-ladder/' },
  { title: "Dijkstra's Algorithm", category: 'Graphs', subCategory: 'Shortest Path', difficulty: 'Medium', link: gfgLink('implementing-dijkstra-set-1-adjacency-matrix') },
  { title: 'Implement Topological Sort', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Medium', link: gfgLink('topological-sort') },
  { title: 'Find minimum time taken by each job to be completed (DAG)', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Medium', link: gfgLink('earliest-time-to-finish-jobs-in-a-dag') },
  { title: 'Find whether it is possible to finish all tasks or not from given dependencies', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/' },
  { title: 'Find the number of Islands', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('find-the-number-of-islands') },
  { title: 'Given a sorted Dictionary of Alien Language, find order of characters', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Hard', link: gfgLink('alien-dictionary') },
  { title: "Implement Kruskal's Algorithm", category: 'Graphs', subCategory: 'Spanning Tree', difficulty: 'Medium', link: gfgLink('minimum-spanning-tree') },
  { title: "Implement Prim's Algorithm", category: 'Graphs', subCategory: 'Spanning Tree', difficulty: 'Medium', link: gfgLink('minimum-spanning-tree') },
  { title: 'Implement Bellman Ford Algorithm', category: 'Graphs', subCategory: 'Shortest Path', difficulty: 'Medium', link: gfgLink('distance-from-the-source-bellman-ford-algorithm') },
  { title: 'Implement Floyd Warshall Algorithm', category: 'Graphs', subCategory: 'Shortest Path', difficulty: 'Medium', link: gfgLink('implementing-floyd-warshall') },
  { title: 'Travelling Salesman Problem', category: 'Graphs', subCategory: 'Advanced Graphs', difficulty: 'Hard', link: gfgLink('travelling-salesman-problem2732') },
  { title: 'Graph Colouring Problem', category: 'Graphs', subCategory: 'Advanced Graphs', difficulty: 'Hard', link: gfgLink('m-coloring-problem-1587115620') },
  { title: 'Snake and Ladders Problem', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: 'https://leetcode.com/problems/snakes-and-ladders/' },
  { title: 'Find bridge in a graph', category: 'Graphs', subCategory: 'Advanced Graphs', difficulty: 'Hard', link: gfgLink('bridge-edge-in-graph') },
  { title: 'Count Strongly connected Components (Kosaraju Algorithm)', category: 'Graphs', subCategory: 'Advanced Graphs', difficulty: 'Hard', link: gfgLink('strongly-connected-component-tarjanss-algo-1591796898') },
  { title: 'Check whether a graph is Bipartite or Not', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('bipartite-graph') },
  { title: 'Detect Negative cycle in a graph', category: 'Graphs', subCategory: 'Shortest Path', difficulty: 'Hard', link: gfgLink('negative-weight-cycle-in-graph') },
  { title: 'Longest path in a Directed Acyclic Graph', category: 'Graphs', subCategory: 'Topological Sort', difficulty: 'Medium', link: gfgLink('longest-path-in-a-directed-acyclic-graph') },
  { title: 'Cheapest Flights Within K Stops', category: 'Graphs', subCategory: 'Shortest Path', difficulty: 'Medium', link: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },
  { title: 'Water Jug problem using BFS', category: 'Graphs', subCategory: 'BFS/DFS', difficulty: 'Medium', link: gfgLink('water-jug-problem') },
  { title: 'Minimum edges to reverse to make path from source to destination', category: 'Graphs', subCategory: 'Shortest Path', difficulty: 'Hard', link: gfgLink('minimum-edges-to-reverse-to-make-path-from-a-source-to-a-destination') },
  { title: 'Two Clique Problem (Graph)', category: 'Graphs', subCategory: 'Advanced Graphs', difficulty: 'Hard', link: gfgLink('two-clique-problem-check-if-graph-can-be-divided-in-two-cliques') },

  // ── Heap (18) ────────────────────────────────────────────────────────────────
  { title: 'Implement a MaxHeap/MinHeap using arrays and recursion', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('binary-heap-operations') },
  { title: 'Sort an Array using Heap (HeapSort)', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('heap-sort') },
  { title: 'Maximum of all subarrays of size k (Heap)', category: 'Heap', subCategory: 'Heap', difficulty: 'Hard', link: gfgLink('maximum-of-all-subarrays-of-size-k3101') },
  { title: 'K largest element in an array', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('k-largest-elements4af6ec') },
  { title: 'Kth smallest and largest element in an unsorted array', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('kth-smallest-element5635') },
  { title: 'Merge K sorted arrays (Heap)', category: 'Heap', subCategory: 'Heap', difficulty: 'Hard', link: gfgLink('merge-k-sorted-arrays') },
  { title: 'Merge 2 Binary Max Heaps', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('merge-two-binary-max-heap') },
  { title: 'Kth largest sum continuous subarrays', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('k-th-largest-sum-contiguous-subarray') },
  { title: 'Reorganize Strings (Heap)', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/reorganize-string/' },
  { title: 'Merge K Sorted Linked Lists (Heap)', category: 'Heap', subCategory: 'Heap', difficulty: 'Hard', link: gfgLink('merge-k-sorted-linked-lists') },
  { title: 'Smallest range in K Lists', category: 'Heap', subCategory: 'Heap', difficulty: 'Hard', link: gfgLink('find-smallest-range-containing-elements-from-k-lists') },
  { title: 'Median in a stream of Integers', category: 'Heap', subCategory: 'Heap', difficulty: 'Hard', link: gfgLink('find-median-in-a-stream-1587115620') },
  { title: 'Check if a Binary Tree is Heap', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('is-binary-tree-heap') },
  { title: 'Connect n ropes with minimum cost', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('minimum-cost-of-ropes-1587115620') },
  { title: 'Convert BST to Min Heap', category: 'Heap', subCategory: 'Heap', difficulty: 'Hard', link: gfgLink('convert-bst-to-min-heap') },
  { title: 'Convert min heap to max heap', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('convert-min-heap-to-max-heap') },
  { title: 'Minimum sum of two numbers formed from digits of an array', category: 'Heap', subCategory: 'Heap', difficulty: 'Medium', link: gfgLink('minimum-sum4058') },

  // ── Trie (6) ─────────────────────────────────────────────────────────────────
  { title: 'Construct a trie from scratch', category: 'Trie', subCategory: 'Trie', difficulty: 'Medium', link: gfgLink('trie-insert-and-search0651') },
  { title: 'Find shortest unique prefix for every word in a given list', category: 'Trie', subCategory: 'Trie', difficulty: 'Medium', link: gfgLink('find-shortest-unique-prefix-for-every-word-in-a-given-list') },
  { title: 'Word Break Problem (Trie solution)', category: 'Trie', subCategory: 'Trie', difficulty: 'Hard', link: gfgLink('word-break-part-23249') },
  { title: 'Given a sequence of words, print all anagrams together (Trie)', category: 'Trie', subCategory: 'Trie', difficulty: 'Medium', link: gfgLink('anagram-of-string') },
  { title: 'Implement a Phone Directory (Trie)', category: 'Trie', subCategory: 'Trie', difficulty: 'Medium', link: gfgLink('phone-directory-1587115620') },
  { title: 'Print unique rows in a given boolean matrix (Trie)', category: 'Trie', subCategory: 'Trie', difficulty: 'Medium', link: gfgLink('unique-rows-in-boolean-matrix') },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function makeSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ─── Seeders ──────────────────────────────────────────────────────────────────
async function seedNeetcodeSheet() {
  try {
    logger.info('DSA Scraper: Seeding NeetCode 150 questions...');
    let count = 0;
    for (let i = 0; i < NEETCODE_QUESTIONS.length; i++) {
      const q = NEETCODE_QUESTIONS[i];
      const problemId = `neetcode-${makeSlug(q.category)}-${i}`;
      await DsaProblem.findOneAndUpdate(
        { problemId },
        { ...q, sheetType: 'neetcode', problemId },
        { upsert: true, new: true }
      );
      count++;
    }
    logger.info(`DSA Scraper: Seeded ${count} NeetCode 150 problems.`);
  } catch (err) {
    logger.error(`DSA Scraper: NeetCode seeding failed: ${err.message}`);
  }
}

async function seedLoveBabbarSheet() {
  try {
    logger.info('DSA Scraper: Seeding Love Babbar 450 questions (hardcoded)...');
    let count = 0;
    for (let i = 0; i < BABBAR_QUESTIONS.length; i++) {
      const q = BABBAR_QUESTIONS[i];
      const problemId = `babbar-${makeSlug(q.category)}-${i}`;
      await DsaProblem.findOneAndUpdate(
        { problemId },
        { ...q, sheetType: 'babbar', problemId },
        { upsert: true, new: true }
      );
      count++;
    }
    logger.info(`DSA Scraper: Seeded ${count} Love Babbar problems.`);
  } catch (err) {
    logger.error(`DSA Scraper: Love Babbar seeding failed: ${err.message}`);
  }
}

// Scrape Striver sheet from takeuforward.org (Next.js RSC stream parsing)
async function scrapeStriverSheet() {
  const axios = require('axios');
  try {
    logger.info('DSA Scraper: Starting Striver A-Z Sheet crawling...');
    const url = 'https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z';
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      timeout: 30000
    });

    const sections = parseNextJsPayload(response.data);
    if (!sections) throw new Error('Could not parse Next.js page state');

    let totalImported = 0;
    for (const section of sections) {
      const categoryName = section.category_name || 'General';
      if (!section.subcategories) continue;
      for (const sub of section.subcategories) {
        const subCategoryName = sub.subcategory_name || 'General';
        if (!sub.problems) continue;
        for (const problem of sub.problems) {
          const problemId = `striver-${problem.problem_id}`;
          const leetcodeLink = problem.leetcode !== '$undefined' ? problem.leetcode : (problem.link !== '$undefined' ? problem.link : problem.article);
          await DsaProblem.findOneAndUpdate(
            { problemId },
            {
              title: problem.problem_name,
              category: categoryName,
              subCategory: subCategoryName,
              difficulty: problem.difficulty || 'Easy',
              link: leetcodeLink,
              youtube: problem.youtube !== '$undefined' ? problem.youtube : '',
              article: problem.article !== '$undefined' ? problem.article : '',
              sheetType: 'striver'
            },
            { upsert: true, new: true }
          );
          totalImported++;
        }
      }
    }
    logger.info(`DSA Scraper: Successfully imported ${totalImported} Striver problems.`);
  } catch (err) {
    logger.error(`DSA Scraper: Striver scrape failed: ${err.message}`);
  }
}

function parseNextJsPayload(html) {
  let stitched = '';
  let searchIdx = 0;
  while (true) {
    const idx = html.indexOf('__next_f.push([1,', searchIdx);
    if (idx === -1) break;
    const startQuoteIdx = idx + 17;
    const quoteChar = html[startQuoteIdx];
    let endQuoteIdx = -1;
    for (let j = startQuoteIdx + 1; j < html.length; j++) {
      if (html[j] === quoteChar && html[j - 1] !== '\\') { endQuoteIdx = j; break; }
    }
    if (endQuoteIdx !== -1) {
      stitched += html.substring(startQuoteIdx + 1, endQuoteIdx);
      searchIdx = endQuoteIdx + 2;
    } else break;
  }
  const startPatterns = ['"sections":[', 'sections":['];
  let matchIndex = -1, offset = 0;
  for (const pattern of startPatterns) {
    const idx = stitched.indexOf(pattern);
    if (idx !== -1) { matchIndex = idx; offset = pattern.length - 1; break; }
  }
  if (matchIndex === -1) return null;
  let bracketCount = 0, started = false, jsonStr = '';
  for (let i = matchIndex + offset; i < stitched.length; i++) {
    const char = stitched[i];
    if (char === '[') { bracketCount++; started = true; }
    else if (char === ']') bracketCount--;
    if (started) { jsonStr += char; if (bracketCount === 0) break; }
  }
  try {
    return JSON.parse(jsonStr.replace(/\\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\u0026/g, '&'));
  } catch { return null; }
}

// ─── Main entry — checks per sheet, not total ─────────────────────────────────
async function triggerDsaSeeding() {
  try {
    const striverCount  = await DsaProblem.countDocuments({ sheetType: 'striver' });
    const babbarCount   = await DsaProblem.countDocuments({ sheetType: 'babbar' });
    const neetcodeCount = await DsaProblem.countDocuments({ sheetType: 'neetcode' });

    logger.info(`DSA Scraper: DB counts — Striver: ${striverCount}, Babbar: ${babbarCount}, NeetCode: ${neetcodeCount}`);

    if (striverCount === 0) {
      await scrapeStriverSheet();
    } else {
      logger.info(`DSA Scraper: Striver already has ${striverCount} problems. Skipping.`);
    }

    if (babbarCount === 0) {
      await seedLoveBabbarSheet();
    } else {
      logger.info(`DSA Scraper: Babbar already has ${babbarCount} problems. Skipping.`);
    }

    if (neetcodeCount === 0) {
      await seedNeetcodeSheet();
    } else {
      logger.info(`DSA Scraper: NeetCode already has ${neetcodeCount} problems. Skipping.`);
    }
  } catch (err) {
    logger.error(`DSA Scraper: triggerDsaSeeding failed: ${err.message}`);
  }
}

module.exports = { scrapeStriverSheet, seedLoveBabbarSheet, seedNeetcodeSheet, triggerDsaSeeding };
