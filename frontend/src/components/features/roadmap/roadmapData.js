// ─── TRACKS ──────────────────────────────────────────────────────────────────
export const TRACKS = [
  { id: 'web-dev',  label: 'Web Dev',    icon: '🌐', color: '#06b6d4' },
  { id: 'dsa',      label: 'DSA',        icon: '🧠', color: '#a855f7' },
  { id: 'devops',   label: 'DevOps',     icon: '⚙️', color: '#f97316' },
  { id: 'ai-ml',    label: 'AI / ML',    icon: '🤖', color: '#ec4899' },
  { id: 'mobile',   label: 'Mobile',     icon: '📱', color: '#22c55e' },
];

// ─── ROADMAPS ─────────────────────────────────────────────────────────────────
export const ROADMAPS = {

  // ── WEB DEV ───────────────────────────────────────────────────────────────
  'web-dev': {
    title: 'Full-Stack Web Development',
    tagline: 'From HTML basics to production-ready full-stack apps',
    phases: [
      {
        id: 'phase-1', phase: 1, title: 'Foundations',
        nodes: [
          {
            id: 'html-basics', title: 'HTML Fundamentals', difficulty: 'Beginner', duration: '1 week',
            notes: `## HTML Fundamentals\n\nHTML (HyperText Markup Language) is the backbone of every webpage.\n\n### Core Concepts\n- **Elements & Tags** – building blocks of HTML\n- **Attributes** – add metadata to elements\n- **Semantic HTML5** – \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<footer>\`\n\n### Forms\n\`\`\`html\n<form action="/submit" method="POST">\n  <input type="text" name="username" required />\n  <button type="submit">Submit</button>\n</form>\n\`\`\`\n\n### Accessibility\nAlways use \`alt\` on images, \`aria-label\` on icon buttons, and proper heading hierarchy.`,
            resources: [
              { label: 'MDN HTML Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
              { label: 'HTML Reference', url: 'https://htmlreference.io' },
            ],
            bestPractices: [
              'Use semantic elements instead of generic divs',
              'Always include a lang attribute on the html element',
              'Validate your HTML with the W3C validator',
            ],
            quiz: [
              { q: 'Which tag is used for the largest heading?', options: ['<h6>', '<h1>', '<heading>', '<title>'], answer: 1 },
              { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperTool Multi Language', 'None'], answer: 0 },
            ],
          },
          {
            id: 'css-basics', title: 'CSS & Styling', difficulty: 'Beginner', duration: '2 weeks',
            notes: `## CSS Fundamentals\n\n### Box Model\nEvery element is a box: **content → padding → border → margin**.\n\n### Flexbox\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1rem;\n}\n\`\`\`\n\n### Grid\n\`\`\`css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n\`\`\`\n\n### CSS Variables\n\`\`\`css\n:root { --primary: #06b6d4; }\n.btn { background: var(--primary); }\n\`\`\``,
            resources: [
              { label: 'CSS-Tricks Flexbox Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' },
              { label: 'Grid by Example', url: 'https://gridbyexample.com' },
            ],
            bestPractices: [
              'Use CSS custom properties (variables) for theming',
              'Mobile-first responsive design',
              'Avoid over-specificity in selectors',
            ],
            quiz: [
              { q: 'Which CSS property controls the space inside an element?', options: ['margin', 'padding', 'border', 'spacing'], answer: 1 },
              { q: 'Which value makes a flex container wrap items?', options: ['flex-wrap: wrap', 'display: wrap', 'flex: wrap', 'overflow: wrap'], answer: 0 },
            ],
          },
          {
            id: 'js-basics', title: 'JavaScript Essentials', difficulty: 'Beginner', duration: '3 weeks',
            notes: `## JavaScript Essentials\n\n### Variables\n\`\`\`js\nconst name = 'Alice'; // block-scoped, immutable binding\nlet age = 25;         // block-scoped, mutable\n\`\`\`\n\n### Functions\n\`\`\`js\nconst greet = (name) => \`Hello, \${name}!\`;\n\`\`\`\n\n### Array Methods\n\`\`\`js\nconst nums = [1, 2, 3, 4];\nnums.filter(n => n > 2);   // [3, 4]\nnums.map(n => n * 2);      // [2, 4, 6, 8]\nnums.reduce((a, b) => a + b, 0); // 10\n\`\`\`\n\n### Promises & Async/Await\n\`\`\`js\nasync function fetchUser(id) {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json();\n}\n\`\`\``,
            resources: [
              { label: 'JavaScript.info', url: 'https://javascript.info' },
              { label: 'MDN JS Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
            ],
            bestPractices: [
              'Prefer const over let, avoid var',
              'Use === instead of ==',
              'Handle promise rejections with try/catch',
            ],
            quiz: [
              { q: 'Which method removes and returns the last element of an array?', options: ['shift()', 'pop()', 'splice()', 'slice()'], answer: 1 },
              { q: 'What does typeof null return?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], answer: 2 },
            ],
          },
        ],
      },
      {
        id: 'phase-2', phase: 2, title: 'Modern Frontend',
        nodes: [
          {
            id: 'react', title: 'React.js', difficulty: 'Intermediate', duration: '4 weeks',
            notes: `## React.js\n\n### Components & Props\n\`\`\`jsx\nfunction Button({ label, onClick }) {\n  return <button onClick={onClick}>{label}</button>;\n}\n\`\`\`\n\n### useState & useEffect\n\`\`\`jsx\nconst [count, setCount] = useState(0);\nuseEffect(() => {\n  document.title = \`Count: \${count}\`;\n}, [count]);\n\`\`\`\n\n### Context API\n\`\`\`jsx\nconst ThemeCtx = createContext('light');\nfunction App() {\n  return <ThemeCtx.Provider value="dark"><Child /></ThemeCtx.Provider>;\n}\n\`\`\``,
            resources: [
              { label: 'React Official Docs', url: 'https://react.dev' },
              { label: 'Awesome React', url: 'https://github.com/enaqx/awesome-react' },
            ],
            bestPractices: [
              'Keep components small and single-responsibility',
              'Lift state only when needed',
              'Memoize expensive calculations with useMemo',
            ],
            quiz: [
              { q: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useRef', 'useMemo'], answer: 1 },
              { q: 'What is the virtual DOM?', options: ['A browser API', 'A lightweight copy of the real DOM', 'A CSS engine', 'A database'], answer: 1 },
            ],
          },
          {
            id: 'typescript', title: 'TypeScript', difficulty: 'Intermediate', duration: '2 weeks',
            notes: `## TypeScript\n\n### Basic Types\n\`\`\`ts\nlet username: string = 'Alice';\nlet age: number = 30;\nlet active: boolean = true;\n\`\`\`\n\n### Interfaces\n\`\`\`ts\ninterface User {\n  id: number;\n  name: string;\n  email?: string; // optional\n}\n\`\`\`\n\n### Generics\n\`\`\`ts\nfunction identity<T>(arg: T): T { return arg; }\n\`\`\``,
            resources: [
              { label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
              { label: 'Total TypeScript', url: 'https://www.totaltypescript.com' },
            ],
            bestPractices: [
              'Enable strict mode in tsconfig',
              'Prefer interfaces over type aliases for objects',
              'Avoid using any — use unknown instead',
            ],
            quiz: [
              { q: 'Which TypeScript keyword makes a property optional?', options: ['?', '!', '*', '~'], answer: 0 },
              { q: 'What is the any type?', options: ['A type that accepts all values', 'A string type', 'A null type', 'An error type'], answer: 0 },
            ],
          },
        ],
      },
      {
        id: 'phase-3', phase: 3, title: 'Backend & APIs',
        nodes: [
          {
            id: 'nodejs', title: 'Node.js & Express', difficulty: 'Intermediate', duration: '3 weeks',
            notes: `## Node.js & Express\n\n### Hello World\n\`\`\`js\nconst express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Hello World'));\napp.listen(3000);\n\`\`\`\n\n### Middleware\n\`\`\`js\napp.use(express.json());\napp.use((req, res, next) => {\n  console.log(req.method, req.path);\n  next();\n});\n\`\`\`\n\n### REST API Design\n- GET /users — list\n- POST /users — create\n- PUT /users/:id — update\n- DELETE /users/:id — delete`,
            resources: [
              { label: 'Node.js Docs', url: 'https://nodejs.org/en/docs' },
              { label: 'Express Guide', url: 'https://expressjs.com/en/guide/routing.html' },
            ],
            bestPractices: [
              'Use environment variables for configuration',
              'Always validate and sanitize input',
              'Return proper HTTP status codes',
            ],
            quiz: [
              { q: 'Which method handles POST requests in Express?', options: ['app.get()', 'app.post()', 'app.put()', 'app.send()'], answer: 1 },
              { q: 'What does middleware do?', options: ['Styles components', 'Intercepts requests/responses', 'Manages databases', 'Compiles code'], answer: 1 },
            ],
          },
          {
            id: 'databases', title: 'Databases (SQL & NoSQL)', difficulty: 'Intermediate', duration: '3 weeks',
            notes: `## Databases\n\n### SQL (PostgreSQL)\n\`\`\`sql\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL\n);\nSELECT * FROM users WHERE email = 'a@b.com';\n\`\`\`\n\n### MongoDB (NoSQL)\n\`\`\`js\nconst user = await User.findOne({ email: 'a@b.com' });\nconst newUser = await User.create({ name: 'Alice', email: 'a@b.com' });\n\`\`\`\n\n### When to use which?\n- SQL: structured, relational data\n- NoSQL: flexible schema, high velocity data`,
            resources: [
              { label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
              { label: 'MongoDB University', url: 'https://university.mongodb.com' },
            ],
            bestPractices: [
              'Index frequently queried columns',
              'Never store plain-text passwords',
              'Use connection pooling in production',
            ],
            quiz: [
              { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'Sequential Query List', 'None'], answer: 0 },
              { q: 'Which MongoDB method inserts a new document?', options: ['insert()', 'create()', 'push()', 'add()'], answer: 1 },
            ],
          },
        ],
      },
      {
        id: 'phase-4', phase: 4, title: 'Deployment & Beyond',
        nodes: [
          {
            id: 'git', title: 'Git & Version Control', difficulty: 'Beginner', duration: '1 week',
            notes: `## Git Essentials\n\n### Core Commands\n\`\`\`bash\ngit init\ngit add .\ngit commit -m "feat: add login page"\ngit push origin main\n\`\`\`\n\n### Branching\n\`\`\`bash\ngit checkout -b feature/login\ngit merge feature/login\ngit branch -d feature/login\n\`\`\`\n\n### Conventional Commits\n- \`feat:\` new feature\n- \`fix:\` bug fix\n- \`docs:\` documentation\n- \`chore:\` maintenance`,
            resources: [
              { label: 'Pro Git Book (free)', url: 'https://git-scm.com/book/en/v2' },
              { label: 'Learn Git Branching', url: 'https://learngitbranching.js.org' },
            ],
            bestPractices: [
              'Commit early, commit often',
              'Write meaningful commit messages',
              'Never force-push to main/master',
            ],
            quiz: [
              { q: 'Which command stages all changes?', options: ['git commit', 'git add .', 'git push', 'git stage'], answer: 1 },
              { q: 'What is a pull request?', options: ['Downloading code', 'Proposing changes for review', 'Deleting a branch', 'Merging locally'], answer: 1 },
            ],
          },
          {
            id: 'deployment', title: 'Deployment & CI/CD', difficulty: 'Advanced', duration: '2 weeks',
            notes: `## Deployment & CI/CD\n\n### Docker\n\`\`\`dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD ["node", "src/server.js"]\n\`\`\`\n\n### GitHub Actions (CI)\n\`\`\`yaml\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci && npm test\n\`\`\`\n\n### Platforms\n- **Vercel** — frontend\n- **Railway / Render** — backend\n- **AWS / GCP** — production scale`,
            resources: [
              { label: 'Docker Docs', url: 'https://docs.docker.com' },
              { label: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions' },
            ],
            bestPractices: [
              'Use environment-specific configs',
              'Set up health checks for all services',
              'Automate tests before every deployment',
            ],
            quiz: [
              { q: 'What does CI stand for?', options: ['Continuous Integration', 'Code Inspection', 'Container Interface', 'Cloud Infrastructure'], answer: 0 },
              { q: 'Which command builds a Docker image?', options: ['docker run', 'docker build', 'docker push', 'docker start'], answer: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ── DSA ───────────────────────────────────────────────────────────────────
  'dsa': {
    title: 'Data Structures & Algorithms',
    tagline: 'Master problem-solving for top tech interviews',
    phases: [
      {
        id: 'dsa-p1', phase: 1, title: 'Core Data Structures',
        nodes: [
          {
            id: 'arrays', title: 'Arrays & Strings', difficulty: 'Beginner', duration: '1 week',
            notes: `## Arrays & Strings\n\n### Key Patterns\n- **Two Pointers** — O(n) traversal\n- **Sliding Window** — subarray problems\n- **Prefix Sum** — range queries\n\n### Example: Two Sum\n\`\`\`python\ndef twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n\`\`\``,
            resources: [
              { label: 'NeetCode Arrays', url: 'https://neetcode.io/roadmap' },
              { label: 'LeetCode Array Problems', url: 'https://leetcode.com/tag/array/' },
            ],
            bestPractices: [
              'Always check edge cases: empty array, single element',
              'Draw out examples before coding',
              'Think about time and space complexity first',
            ],
            quiz: [
              { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1 },
              { q: 'Which pattern is best for "longest subarray with sum k"?', options: ['Recursion', 'Sliding Window', 'Divide & Conquer', 'Backtracking'], answer: 1 },
            ],
          },
          {
            id: 'linked-lists', title: 'Linked Lists', difficulty: 'Beginner', duration: '1 week',
            notes: `## Linked Lists\n\n### Types\n- **Singly** — each node points to next\n- **Doubly** — prev and next pointers\n- **Circular** — tail points to head\n\n### Reverse a Linked List\n\`\`\`python\ndef reverse(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev, curr = curr, nxt\n    return prev\n\`\`\`\n\n### Floyd's Cycle Detection\n\`\`\`python\ndef hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow == fast: return True\n    return False\n\`\`\``,
            resources: [
              { label: 'Visualgo — Linked List', url: 'https://visualgo.net/en/list' },
              { label: 'LeetCode Linked List', url: 'https://leetcode.com/tag/linked-list/' },
            ],
            bestPractices: [
              'Draw the linked list before coding',
              'Use a dummy head node to simplify edge cases',
              'Always handle null pointer cases',
            ],
            quiz: [
              { q: 'What is the time complexity of inserting at the head of a linked list?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2 },
              { q: 'Floyd\'s algorithm detects?', options: ['Shortest path', 'Cycles', 'Sorting', 'Hashing'], answer: 1 },
            ],
          },
          {
            id: 'trees', title: 'Trees & BST', difficulty: 'Intermediate', duration: '2 weeks',
            notes: `## Trees & Binary Search Trees\n\n### Tree Traversals\n\`\`\`python\ndef inorder(root):\n    if not root: return []\n    return inorder(root.left) + [root.val] + inorder(root.right)\n\`\`\`\n\n### BST Search\n\`\`\`python\ndef search(root, val):\n    if not root or root.val == val: return root\n    if val < root.val: return search(root.left, val)\n    return search(root.right, val)\n\`\`\`\n\n### BFS (Level Order)\n\`\`\`python\nfrom collections import deque\ndef bfs(root):\n    q, result = deque([root]), []\n    while q:\n        node = q.popleft()\n        result.append(node.val)\n        if node.left: q.append(node.left)\n        if node.right: q.append(node.right)\n    return result\n\`\`\``,
            resources: [
              { label: 'Visualgo BST', url: 'https://visualgo.net/en/bst' },
              { label: 'LeetCode Tree Tag', url: 'https://leetcode.com/tag/tree/' },
            ],
            bestPractices: [
              'Know all 3 DFS traversals by heart',
              'BFS is great for level-order / shortest path problems',
              'Recursive solutions are cleaner; iterative are safer for deep trees',
            ],
            quiz: [
              { q: 'Which traversal visits: Left → Root → Right?', options: ['Preorder', 'Inorder', 'Postorder', 'BFS'], answer: 1 },
              { q: 'In a BST, where is the minimum value?', options: ['Root', 'Rightmost node', 'Leftmost node', 'Any leaf'], answer: 2 },
            ],
          },
        ],
      },
      {
        id: 'dsa-p2', phase: 2, title: 'Algorithms',
        nodes: [
          {
            id: 'sorting', title: 'Sorting Algorithms', difficulty: 'Intermediate', duration: '1 week',
            notes: `## Sorting Algorithms\n\n| Algorithm | Best | Average | Worst | Space |\n|-----------|------|---------|-------|-------|\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |\n| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |\n\n### Merge Sort\n\`\`\`python\ndef mergeSort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = mergeSort(arr[:mid])\n    right = mergeSort(arr[mid:])\n    return merge(left, right)\n\`\`\``,
            resources: [
              { label: 'Sorting Visualizer', url: 'https://www.toptal.com/developers/sorting-algorithms' },
            ],
            bestPractices: [
              'Use built-in sort for most problems (Timsort)',
              'Know merge sort deeply — it\'s used in many variations',
              'Quick sort is in-place; merge sort is stable',
            ],
            quiz: [
              { q: 'Which sort is stable by nature?', options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'], answer: 2 },
              { q: 'Average case of Quick Sort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1 },
            ],
          },
          {
            id: 'dp', title: 'Dynamic Programming', difficulty: 'Advanced', duration: '3 weeks',
            notes: `## Dynamic Programming\n\n### 1D DP — Fibonacci\n\`\`\`python\ndef fib(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1) + fib(n-2)\n    return memo[n]\n\`\`\`\n\n### 2D DP — Longest Common Subsequence\n\`\`\`python\ndef lcs(s1, s2):\n    m, n = len(s1), len(s2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]\n\`\`\`\n\n### Key Patterns\n- Overlapping subproblems\n- Optimal substructure`,
            resources: [
              { label: 'DP Patterns — LeetCode Discuss', url: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns' },
              { label: 'Aditya Verma DP Playlist', url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go' },
            ],
            bestPractices: [
              'Identify the state first, then the transition',
              'Start with recursion + memoization before tabulation',
              'Draw the DP table for 2D problems',
            ],
            quiz: [
              { q: 'DP is applicable when a problem has?', options: ['Greedy choices', 'Overlapping subproblems', 'Sorted input', 'Graph structure'], answer: 1 },
              { q: 'Bottom-up DP is also called?', options: ['Memoization', 'Recursion', 'Tabulation', 'Greedy'], answer: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ── DEVOPS ────────────────────────────────────────────────────────────────
  'devops': {
    title: 'DevOps Engineering',
    tagline: 'From code to cloud — automate everything',
    phases: [
      {
        id: 'devops-p1', phase: 1, title: 'Linux & Networking',
        nodes: [
          {
            id: 'linux', title: 'Linux Fundamentals', difficulty: 'Beginner', duration: '2 weeks',
            notes: `## Linux Fundamentals\n\n### Essential Commands\n\`\`\`bash\nls -la           # list files with permissions\nchmod 755 file   # change permissions\nchown user file  # change owner\nps aux           # list processes\nkill -9 PID      # force kill process\ntail -f app.log  # follow log file\n\`\`\`\n\n### File System\n- \`/etc\` — configuration files\n- \`/var/log\` — log files\n- \`/home\` — user directories\n- \`/usr\` — user programs\n\n### Shell Scripting\n\`\`\`bash\n#!/bin/bash\nfor i in {1..5}; do\n  echo "Iteration $i"\ndone\n\`\`\``,
            resources: [
              { label: 'Linux Command Line', url: 'https://linuxcommand.org' },
              { label: 'The Missing Semester', url: 'https://missing.csail.mit.edu' },
            ],
            bestPractices: [
              'Use aliases for long commands',
              'Always test scripts with set -e and set -x',
              'Keep scripts idempotent',
            ],
            quiz: [
              { q: 'Which command shows disk usage?', options: ['df -h', 'ls -la', 'ps aux', 'top'], answer: 0 },
              { q: 'chmod 777 gives?', options: ['Read only', 'Full permissions to all', 'Execute only', 'No permissions'], answer: 1 },
            ],
          },
        ],
      },
      {
        id: 'devops-p2', phase: 2, title: 'Containers & CI/CD',
        nodes: [
          {
            id: 'docker', title: 'Docker & Containerization', difficulty: 'Intermediate', duration: '2 weeks',
            notes: `## Docker\n\n### Dockerfile\n\`\`\`dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 5000\nCMD ["node", "server.js"]\n\`\`\`\n\n### Docker Compose\n\`\`\`yaml\nservices:\n  app:\n    build: .\n    ports: ["3000:3000"]\n    depends_on: [db]\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: secret\n\`\`\`\n\n### Useful Commands\n\`\`\`bash\ndocker build -t myapp .\ndocker run -p 3000:3000 myapp\ndocker compose up -d\ndocker logs -f container_name\n\`\`\``,
            resources: [
              { label: 'Docker Docs', url: 'https://docs.docker.com' },
              { label: 'Play with Docker', url: 'https://labs.play-with-docker.com' },
            ],
            bestPractices: [
              'Use multi-stage builds to reduce image size',
              'Never run containers as root',
              'Pin image versions (not latest)',
            ],
            quiz: [
              { q: 'What command starts services defined in docker-compose.yml?', options: ['docker run', 'docker compose up', 'docker start', 'docker build'], answer: 1 },
              { q: 'Which instruction sets the working directory in a Dockerfile?', options: ['DIR', 'WORKDIR', 'CD', 'RUN cd'], answer: 1 },
            ],
          },
          {
            id: 'kubernetes', title: 'Kubernetes Basics', difficulty: 'Advanced', duration: '4 weeks',
            notes: `## Kubernetes\n\n### Core Objects\n- **Pod** — smallest deployable unit\n- **Deployment** — manages pod replicas\n- **Service** — network abstraction\n- **Ingress** — HTTP routing\n\n### Basic Deployment\n\`\`\`yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: my-app\n        image: myapp:1.0\n        ports:\n        - containerPort: 3000\n\`\`\``,
            resources: [
              { label: 'Kubernetes Docs', url: 'https://kubernetes.io/docs' },
              { label: 'KillerCoda Labs', url: 'https://killercoda.com/kubernetes' },
            ],
            bestPractices: [
              'Use namespaces to separate environments',
              'Set resource requests and limits on all pods',
              'Use readiness and liveness probes',
            ],
            quiz: [
              { q: 'What is the smallest deployable unit in Kubernetes?', options: ['Container', 'Node', 'Pod', 'Cluster'], answer: 2 },
              { q: 'Which object exposes pods as a network service?', options: ['Ingress', 'Deployment', 'Service', 'ConfigMap'], answer: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ── AI / ML ───────────────────────────────────────────────────────────────
  'ai-ml': {
    title: 'Artificial Intelligence & Machine Learning',
    tagline: 'Build intelligent systems from scratch',
    phases: [
      {
        id: 'ai-p1', phase: 1, title: 'Math & Python Foundations',
        nodes: [
          {
            id: 'python-ml', title: 'Python for ML', difficulty: 'Beginner', duration: '2 weeks',
            notes: `## Python for Machine Learning\n\n### NumPy\n\`\`\`python\nimport numpy as np\na = np.array([[1, 2], [3, 4]])\nprint(a.shape)   # (2, 2)\nprint(a.mean())  # 2.5\n\`\`\`\n\n### Pandas\n\`\`\`python\nimport pandas as pd\ndf = pd.read_csv('data.csv')\ndf.head()\ndf.describe()\ndf.dropna(inplace=True)\n\`\`\`\n\n### Matplotlib\n\`\`\`python\nimport matplotlib.pyplot as plt\nplt.plot([1, 2, 3], [4, 5, 6])\nplt.xlabel('x'); plt.ylabel('y')\nplt.title('My Plot')\nplt.show()\n\`\`\``,
            resources: [
              { label: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html' },
              { label: 'Pandas Docs', url: 'https://pandas.pydata.org/docs/' },
            ],
            bestPractices: [
              'Use vectorized operations, avoid loops in NumPy',
              'Always explore data with df.info() and df.describe()',
              'Normalize/scale features before training',
            ],
            quiz: [
              { q: 'Which library provides the DataFrame structure?', options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'], answer: 1 },
              { q: 'np.zeros((3,3)) creates?', options: ['3x3 ones matrix', '3x3 zeros matrix', '3x3 identity matrix', 'Random 3x3 matrix'], answer: 1 },
            ],
          },
        ],
      },
      {
        id: 'ai-p2', phase: 2, title: 'Machine Learning',
        nodes: [
          {
            id: 'ml-supervised', title: 'Supervised Learning', difficulty: 'Intermediate', duration: '3 weeks',
            notes: `## Supervised Learning\n\n### Linear Regression\n\`\`\`python\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npred = model.predict(X_test)\n\`\`\`\n\n### Classification\n\`\`\`python\nfrom sklearn.ensemble import RandomForestClassifier\nclf = RandomForestClassifier(n_estimators=100)\nclf.fit(X_train, y_train)\nprint(clf.score(X_test, y_test))\n\`\`\`\n\n### Key Metrics\n- **Regression**: MSE, RMSE, R²\n- **Classification**: Accuracy, Precision, Recall, F1, AUC-ROC`,
            resources: [
              { label: 'Scikit-learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html' },
              { label: 'Kaggle ML Course', url: 'https://www.kaggle.com/learn/intro-to-machine-learning' },
            ],
            bestPractices: [
              'Always split data into train/val/test sets',
              'Use cross-validation for model evaluation',
              'Feature engineering often matters more than model choice',
            ],
            quiz: [
              { q: 'Which metric is best for imbalanced classification?', options: ['Accuracy', 'F1 Score', 'MSE', 'R²'], answer: 1 },
              { q: 'Overfitting occurs when?', options: ['Model is too simple', 'Model memorizes training data', 'Dataset is too large', 'Learning rate is too low'], answer: 1 },
            ],
          },
          {
            id: 'deep-learning', title: 'Deep Learning & Neural Networks', difficulty: 'Advanced', duration: '4 weeks',
            notes: `## Deep Learning\n\n### Neural Network (PyTorch)\n\`\`\`python\nimport torch\nimport torch.nn as nn\n\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(784, 128)\n        self.fc2 = nn.Linear(128, 10)\n    def forward(self, x):\n        x = torch.relu(self.fc1(x))\n        return self.fc2(x)\n\nmodel = Net()\n\`\`\`\n\n### Training Loop\n\`\`\`python\nfor epoch in range(10):\n    optimizer.zero_grad()\n    output = model(X)\n    loss = criterion(output, y)\n    loss.backward()\n    optimizer.step()\n\`\`\``,
            resources: [
              { label: 'fast.ai Practical DL', url: 'https://course.fast.ai' },
              { label: 'PyTorch Docs', url: 'https://pytorch.org/docs' },
            ],
            bestPractices: [
              'Start with a simple baseline before complex models',
              'Use batch normalization and dropout for regularization',
              'Monitor training with TensorBoard or W&B',
            ],
            quiz: [
              { q: 'What does ReLU activation do?', options: ['Squashes to 0-1', 'Returns max(0, x)', 'Normalizes outputs', 'Adds noise'], answer: 1 },
              { q: 'Backpropagation computes?', options: ['Forward pass', 'Gradients via chain rule', 'Loss function', 'Predictions'], answer: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ── MOBILE ────────────────────────────────────────────────────────────────
  'mobile': {
    title: 'Mobile App Development',
    tagline: 'Build cross-platform iOS & Android apps',
    phases: [
      {
        id: 'mob-p1', phase: 1, title: 'React Native Foundations',
        nodes: [
          {
            id: 'rn-basics', title: 'React Native Basics', difficulty: 'Beginner', duration: '3 weeks',
            notes: `## React Native Basics\n\n### Core Components\n\`\`\`jsx\nimport { View, Text, StyleSheet, TouchableOpacity } from 'react-native';\n\nfunction App() {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Hello, Mobile!</Text>\n      <TouchableOpacity style={styles.btn}>\n        <Text>Press Me</Text>\n      </TouchableOpacity>\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },\n  title: { fontSize: 24, fontWeight: 'bold' },\n  btn: { padding: 12, backgroundColor: '#06b6d4', borderRadius: 8 },\n});\n\`\`\``,
            resources: [
              { label: 'React Native Docs', url: 'https://reactnative.dev/docs/getting-started' },
              { label: 'Expo Docs', url: 'https://docs.expo.dev' },
            ],
            bestPractices: [
              'Use Expo for faster development and OTA updates',
              'Keep heavy logic out of the main thread (use Reanimated for animations)',
              'Test on both iOS and Android simulators',
            ],
            quiz: [
              { q: 'What is the equivalent of div in React Native?', options: ['div', 'View', 'Container', 'Box'], answer: 1 },
              { q: 'Which library gives access to device camera, GPS etc?', options: ['React Navigation', 'Expo SDK', 'Redux', 'Axios'], answer: 1 },
            ],
          },
          {
            id: 'rn-navigation', title: 'Navigation & State', difficulty: 'Intermediate', duration: '2 weeks',
            notes: `## Navigation & State Management\n\n### React Navigation\n\`\`\`jsx\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createStackNavigator } from '@react-navigation/stack';\n\nconst Stack = createStackNavigator();\n\nfunction App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator>\n        <Stack.Screen name="Home" component={HomeScreen} />\n        <Stack.Screen name="Details" component={DetailsScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}\n\`\`\`\n\n### State with Zustand\n\`\`\`js\nimport { create } from 'zustand';\nconst useStore = create(set => ({\n  count: 0,\n  increment: () => set(s => ({ count: s.count + 1 })),\n}));\n\`\`\``,
            resources: [
              { label: 'React Navigation Docs', url: 'https://reactnavigation.org/docs/getting-started' },
              { label: 'Zustand Docs', url: 'https://zustand-demo.pmnd.rs' },
            ],
            bestPractices: [
              'Use tab + stack navigation combination for most apps',
              'Persist state with AsyncStorage or MMKV',
              'Avoid prop drilling — use context or Zustand',
            ],
            quiz: [
              { q: 'Which package provides navigation in React Native?', options: ['react-router-native', '@react-navigation/native', 'expo-router', 'react-native-navigation'], answer: 1 },
              { q: 'What is AsyncStorage used for?', options: ['API calls', 'Persistent key-value storage', 'Image caching', 'Animations'], answer: 1 },
            ],
          },
        ],
      },
    ],
  },
};
