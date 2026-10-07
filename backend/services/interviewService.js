const { getFirestore } = require('../config/firebase-admin');
const { generateInterviewQuestions, evaluateInterviewAnswer } = require('./geminiService');

// Robust Question Bank spanning roles and difficulty levels
const QUESTION_BANK = {
  'frontend-developer': {
    'Easy': [
      { id: 'fe-e-1', topic: 'HTML/CSS', question: 'What is the CSS Box Model, and how does box-sizing: border-box affect element dimensions?', expectedPoints: ['Content, padding, border, margin', 'border-box includes padding and border in width/height', 'Prevents unexpected layout overflow'] },
      { id: 'fe-e-2', topic: 'JavaScript', question: 'Explain the difference between let, const, and var in modern JavaScript.', expectedPoints: ['var is function scoped and hoisted', 'let and const are block scoped', 'const prevents re-assignment'] },
      { id: 'fe-e-3', topic: 'DOM', question: 'What is event delegation in JavaScript, and why is it useful?', expectedPoints: ['Attaching a single listener to a parent element', 'Leverages event bubbling', 'Improves memory usage and works on dynamic children'] },
      { id: 'fe-e-4', topic: 'React', question: 'What is the purpose of keys in React lists?', expectedPoints: ['Helps React identify which items have changed, added, or removed', 'Optimizes virtual DOM reconciliation', 'Must be stable and unique, avoiding array indices when order changes'] },
      { id: 'fe-e-5', topic: 'Web Concepts', question: 'Explain the difference between localStorage, sessionStorage, and cookies.', expectedPoints: ['localStorage persists until cleared', 'sessionStorage clears when tab closes', 'cookies sent with HTTP requests and have size limits (4KB)'] },
      { id: 'fe-e-6', topic: 'CSS', question: 'What is the difference between display: none and visibility: hidden?', expectedPoints: ['display: none removes element from document flow', 'visibility: hidden hides element but preserves occupied space', 'Repaint vs reflow differences'] },
      { id: 'fe-e-7', topic: 'JavaScript', question: 'What are arrow functions and how do they handle the this keyword?', expectedPoints: ['Concise syntax', 'Lexical this binding (inherits from enclosing scope)', 'Cannot be used as constructors'] },
      { id: 'fe-e-8', topic: 'HTML', question: 'Why is semantic HTML important for modern web development?', expectedPoints: ['Accessibility for screen readers', 'SEO optimization', 'Code readability and maintainability'] },
      { id: 'fe-e-9', topic: 'React', question: 'What is the difference between state and props in React?', expectedPoints: ['Props are read-only and passed from parent', 'State is managed internally and mutable via updater functions', 'Changes to either trigger re-render'] },
      { id: 'fe-e-10', topic: 'HTTP', question: 'What is the difference between GET and POST HTTP methods in web apps?', expectedPoints: ['GET retrieves data and parameters in URL', 'POST sends data in request body', 'Idempotency and caching differences'] },
      { id: 'fe-e-11', topic: 'CSS', question: 'Explain the difference between Flexbox and CSS Grid.', expectedPoints: ['Flexbox is one-dimensional (row or column)', 'Grid is two-dimensional (rows and columns simultaneously)', 'Use cases for component layout vs page layout'] },
      { id: 'fe-e-12', topic: 'JavaScript', question: 'What is the purpose of Array.prototype.map(), filter(), and reduce()?', expectedPoints: ['map transforms each element into new array', 'filter selects subset matching condition', 'reduce accumulates array down to single value'] },
      { id: 'fe-e-13', topic: 'Web Security', question: 'What is Cross-Site Scripting (XSS) and how do frontend developers prevent it?', expectedPoints: ['Injecting malicious scripts into web pages', 'Sanitizing user input', 'Using modern frameworks that escape HTML', 'Content Security Policy (CSP)'] },
      { id: 'fe-e-14', topic: 'React', question: 'What does the useEffect hook do and how do dependencies affect its execution?', expectedPoints: ['Runs side effects after rendering', 'Empty dependency array runs once on mount', 'Specified dependencies run on change', 'Cleanup function prevents memory leaks'] },
      { id: 'fe-e-15', topic: 'Performance', question: 'What is image lazy loading and how is it implemented natively in HTML?', expectedPoints: ['Defers loading offscreen images until scrolled near viewport', 'loading="lazy" attribute on img tags', 'Reduces initial page load time and bandwidth'] }
    ],
    'Medium': [
      { id: 'fe-m-1', topic: 'JavaScript', question: 'Explain how the JavaScript Event Loop handles Microtasks vs Macrotasks.', expectedPoints: ['Call stack, Web APIs, Task Queue, Microtask Queue', 'Microtasks (Promises, queueMicrotask) run immediately after current script before rendering', 'Macrotasks (setTimeout, setInterval, I/O) run after microtasks complete'] },
      { id: 'fe-m-2', topic: 'React', question: 'Explain React Fiber and how virtual DOM reconciliation works.', expectedPoints: ['Fiber is a complete rewrite of React core reconciliation engine', 'Enables incremental rendering and interruptible work units', 'Diffing algorithm with O(n) heuristic complexity'] },
      { id: 'fe-m-3', topic: 'Performance', question: 'What are Core Web Vitals (LCP, INP, CLS) and how do you optimize each?', expectedPoints: ['LCP: Largest Contentful Paint (hero images, fetchpriority)', 'INP: Interaction to Next Paint (yield to main thread, break long tasks)', 'CLS: Cumulative Layout Shift (explicit image dimensions, font display)'] },
      { id: 'fe-m-4', topic: 'Browser', question: 'Explain the browser Critical Rendering Path from HTML download to paint.', expectedPoints: ['DOM tree construction', 'CSSOM tree construction', 'Render tree formation', 'Layout calculation (reflow)', 'Painting and compositing onto screen'] },
      { id: 'fe-m-5', topic: 'JavaScript', question: 'What is a closure in JavaScript, and what are practical use cases and memory pitfalls?', expectedPoints: ['Function bundled with its lexical environment', 'Data privacy, currying, event handlers', 'Memory leaks if unintended references remain retained in memory'] },
      { id: 'fe-m-6', topic: 'React', question: 'Compare useMemo and useCallback. When should you avoid using them?', expectedPoints: ['useMemo caches calculated value, useCallback caches function reference', 'Both add memory overhead and dependency comparison cost', 'Avoid for trivial calculations or un-memoized child components'] },
      { id: 'fe-m-7', topic: 'Web Architecture', question: 'Explain how Service Workers work and how they enable Offline-First Progressive Web Apps (PWAs).', expectedPoints: ['Runs in background thread separate from main DOM', 'Interprets and intercepts network requests (Fetch API)', 'Cache API strategies (Cache-First, Network-First, Stale-While-Revalidate)'] },
      { id: 'fe-m-8', topic: 'Security', question: 'Explain CORS (Cross-Origin Resource Sharing) and preflight OPTIONS requests.', expectedPoints: ['Browser security mechanism enforcing Same-Origin Policy', 'Server returns Access-Control-Allow-Origin headers', 'Preflight OPTIONS sent for non-simple requests (custom headers, PUT/DELETE)'] },
      { id: 'fe-m-9', topic: 'TypeScript', question: 'What is the difference between type and interface in TypeScript, and how does declaration merging work?', expectedPoints: ['Interfaces support declaration merging; types do not', 'Types support unions, primitives, tuples and computed properties', 'Performance and idiomatic library authoring differences'] },
      { id: 'fe-m-10', topic: 'State Management', question: 'Compare prop drilling solutions: Context API vs External stores (Zustand/Redux).', expectedPoints: ['Context causes re-renders across all consumers unless split', 'Zustand/Redux provide granular selector subscriptions', 'Boilerplate vs scalability tradeoffs'] },
      { id: 'fe-m-11', topic: 'Performance', question: 'What is code splitting and dynamic import(), and how does it reduce bundle size?', expectedPoints: ['Splits bundle into smaller chunks loaded on demand', 'React.lazy and dynamic import()', 'Route-based splitting vs component-level splitting'] },
      { id: 'fe-m-12', topic: 'JavaScript', question: 'What are JavaScript Generators and Iterators, and how do they function?', expectedPoints: ['Functions with function* syntax and yield keyword', 'Return iterator objects with next() method', 'Enables lazy evaluation and custom iterable protocols'] },
      { id: 'fe-m-13', topic: 'CSS', question: 'What is CSS Specificity hierarchy, and how does the :is() and :where() pseudo-classes impact it?', expectedPoints: ['Inline > ID > Class/Attribute/Pseudo-class > Element', ':where() has zero specificity (0,0,0)', ':is() takes specificity of its most specific argument'] },
      { id: 'fe-m-14', topic: 'Web APIs', question: 'What is the Intersection Observer API and how is it superior to scroll listeners?', expectedPoints: ['Asynchronously observes changes in intersection with ancestor viewport', 'Runs off main thread avoiding continuous layout recalculation and scroll jank', 'Ideal for infinite scrolling and lazy loading'] },
      { id: 'fe-m-15', topic: 'Testing', question: 'What is the difference between Shallow Rendering and Full DOM integration testing in frontend applications?', expectedPoints: ['Shallow renders one level deep, mocking children', 'Testing Library philosophy tests user interactions against real rendered DOM', 'Resilience against internal refactoring'] }
    ],
    'Hard': [
      { id: 'fe-h-1', topic: 'Architecture', question: 'How would you architect a Micro-Frontend system for an enterprise platform? Discuss module federation, shared dependencies, and state boundaries.', expectedPoints: ['Webpack 5 / Vite Module Federation runtime resolution', 'Isolated sandbox vs shared runtime singleton management', 'Cross-microfrontend communication via custom events or light bus', 'CSS collision isolation via scoped styles / shadow DOM'] },
      { id: 'fe-h-2', topic: 'Performance', question: 'How would you diagnose and resolve an unexplainable 300ms Interaction to Next Paint (INP) bottleneck in a data-heavy React application?', expectedPoints: ['Performance profiler in DevTools to identify long tasks (>50ms)', 'Identify main thread blocking during event callbacks', 'Chunk work using requestAnimationFrame, scheduler API, or startTransition', 'Virtualize tables with react-window or custom intersection observers'] },
      { id: 'fe-h-3', topic: 'Rendering', question: 'Compare SSR, SSG, ISR, and React Server Components (RSC) from hydration cost and streaming perspectives.', expectedPoints: ['SSR sends HTML but still requires full JS hydration payload', 'RSC runs strictly on server with zero bundle footprint for server components', 'Selective hydration with Suspense streams chunks as they resolve', 'Tradeoffs regarding server load and cold starts'] },
      { id: 'fe-h-4', topic: 'Memory & V8', question: 'How does V8 manage garbage collection (Scavenger vs Mark-Sweep-Compact), and how do you trace memory leaks using Chrome DevTools heap snapshots?', expectedPoints: ['Generational hypothesis: Young generation (Nursery/Intermediate) vs Old generation', 'Scavenge semi-space copy algorithm', 'Mark-Sweep-Compact for old generation fragmentation', 'Retaining trees and detached DOM nodes in DevTools'] },
      { id: 'fe-h-5', topic: 'Networking & Protocols', question: 'Compare HTTP/2 multiplexing with HTTP/3 QUIC protocol. What problem does HTTP/3 solve regarding Head-of-Line blocking?', expectedPoints: ['HTTP/2 multiplexes streams over single TCP connection', 'TCP packet loss causes TCP-level Head-of-Line blocking across all streams', 'HTTP/3 uses UDP-based QUIC where packet loss only impacts the affected stream', '0-RTT connection resumption'] },
      { id: 'fe-h-6', topic: 'Build Systems', question: 'Explain how tree shaking works in Rollup and Webpack. Why does ESM enable static analysis that CommonJS cannot provide?', expectedPoints: ['ESM imports/exports are static and resolved at compile time', 'CommonJS require() is dynamic and conditional at runtime', 'Dead-code elimination via AST parsing and pure annotation flags (/*#__PURE__*/)', 'SideEffects field in package.json'] },
      { id: 'fe-h-7', topic: 'Web Security', question: 'Explain how Content Security Policy (CSP) with nonce-based script execution prevents advanced DOM-based XSS attacks.', expectedPoints: ['Random cryptographic nonce generated per HTTP response', 'Strict-dynamic propagation to authorized dependencies', 'Disallowing unsafe-inline and eval()', 'Reporting endpoints for policy violations'] },
      { id: 'fe-h-8', topic: 'WebAssembly', question: 'How does WebAssembly (Wasm) integrate with the JavaScript engine, and how do memory buffers transfer data between JS and Wasm linear memory?', expectedPoints: ['SharedArrayBuffer and WebAssembly.Memory', 'Linear memory represents continuous unmanaged byte array', 'Zero-copy data passing via typed arrays vs serialization overhead', 'Compute-intensive workloads in WebAssembly'] },
      { id: 'fe-h-9', topic: 'State Architecture', question: 'Design an optimistic UI update system with offline rollback and conflict resolution for a collaborative kanban board.', expectedPoints: ['Immediate UI update in local state with pending status', 'Queueing mutations in IndexedDB with idempotency keys', 'Rollback strategy upon server HTTP 4xx/5xx rejection', 'Operational Transformation or CRDT for concurrent multi-user conflicts'] },
      { id: 'fe-h-10', topic: 'Accessibility', question: 'How would you build a fully accessible, keyboard-navigable combobox with live search according to W3C ARIA Authoring Practices (APG)?', expectedPoints: ['role="combobox", aria-expanded, aria-controls, aria-activedescendant', 'Keyboard navigation (Arrow keys, Home, End, Escape, Enter)', 'aria-live regions for announcing dynamic results to screen readers', 'Focus retention on input element during selection'] }
    ]
  },

  'backend-developer': {
    'Easy': [
      { id: 'be-e-1', topic: 'Node.js', question: 'What is the Node.js event-driven, non-blocking I/O model?', expectedPoints: ['Single threaded main execution', 'Offloads asynchronous I/O to libuv thread pool', 'Callback queue and event loop process completed operations'] },
      { id: 'be-e-2', topic: 'SQL', question: 'Explain the difference between SQL and NoSQL databases. When would you pick one over the other?', expectedPoints: ['SQL has structured schemas and ACID transactions', 'NoSQL offers flexible document/key-value schemas and horizontal scaling', 'Structured relational data vs unstructured rapid iterations'] },
      { id: 'be-e-3', topic: 'HTTP', question: 'What are standard HTTP status codes: 200, 201, 400, 401, 403, 404, 500?', expectedPoints: ['200 OK, 201 Created', '400 Bad Request, 401 Unauthorized (unauthenticated), 403 Forbidden', '404 Not Found, 500 Internal Server Error'] },
      { id: 'be-e-4', topic: 'Authentication', question: 'What is a JSON Web Token (JWT) and what are its three parts?', expectedPoints: ['Header (algorithm & type)', 'Payload (claims/data)', 'Signature (cryptographic hash ensuring integrity)'] },
      { id: 'be-e-5', topic: 'Databases', question: 'What is an index in a database, and what is the trade-off of having too many indexes?', expectedPoints: ['Data structure (e.g., B-Tree) that accelerates SELECT queries', 'Slows down INSERT, UPDATE, and DELETE operations', 'Consumes additional disk and RAM'] },
      { id: 'be-e-6', topic: 'REST', question: 'What does it mean for an HTTP method to be idempotent?', expectedPoints: ['Making multiple identical requests produces the exact same state', 'GET, PUT, DELETE are idempotent; POST is not'] },
      { id: 'be-e-7', topic: 'Security', question: 'How do you prevent SQL Injection vulnerabilities in backend applications?', expectedPoints: ['Use parameterized queries / prepared statements', 'Use reputable ORMs / query builders', 'Never concatenate raw user strings into SQL queries'] },
      { id: 'be-e-8', topic: 'Node.js', question: 'What is middleware in Express.js and how does next() work?', expectedPoints: ['Functions with access to req, res, next objects', 'Execute code, modify request/response, end request cycle, or invoke next()', 'Failure to call next() hangs the request'] },
      { id: 'be-e-9', topic: 'Caching', question: 'What is Redis and what are common use cases for it in backend systems?', expectedPoints: ['In-memory key-value data store', 'Session storage, caching API responses, rate limiting, pub/sub messaging'] },
      { id: 'be-e-10', topic: 'Git', question: 'What is the purpose of environment variables and why must secrets not be committed to Git?', expectedPoints: ['Separates configuration from application code across environments', 'Prevents credential leaks and unauthorized breach of production systems'] }
    ],
    'Medium': [
      { id: 'be-m-1', topic: 'Transactions', question: 'Explain the four ACID properties in relational database management systems.', expectedPoints: ['Atomicity (all or nothing)', 'Consistency (valid state transitions and constraints)', 'Isolation (concurrent transactions do not interfere)', 'Durability (committed data survives server crashes)'] },
      { id: 'be-m-2', topic: 'Scalability', question: 'What is the difference between horizontal and vertical scaling, and what challenges arise with horizontal scaling?', expectedPoints: ['Vertical: adding CPU/RAM to single machine', 'Horizontal: adding more machines', 'Challenges: stateless sessions, distributed databases, cache invalidation, load balancing'] },
      { id: 'be-m-3', topic: 'Architecture', question: 'Explain how message queues (e.g. RabbitMQ, Kafka) decouple distributed backend services.', expectedPoints: ['Asynchronous task processing without blocking HTTP clients', 'Buffer bursts of traffic (load leveling)', 'Publish/Subscribe pattern and fault tolerance through retries'] },
      { id: 'be-m-4', topic: 'Security', question: 'How do you safely hash and salt passwords before storing them in a database?', expectedPoints: ['One-way cryptographic hash functions like bcrypt, Argon2, or PBKDF2', 'Unique salt per user prevents rainbow table attacks', 'Work factor/cost parameter slows down brute-force attacks'] },
      { id: 'be-m-5', topic: 'Node.js', question: 'What are Node.js Streams and Buffers, and when should you use them over fs.readFile()?', expectedPoints: ['Streams process data piece by piece without loading entire file into RAM', 'Buffers represent fixed-length raw binary sequences in memory', 'Prevents memory exhaustion on multi-gigabyte files or video streaming'] },
      { id: 'be-m-6', topic: 'Database Optimization', question: 'Explain the difference between Clustered and Non-Clustered indexes in SQL.', expectedPoints: ['Clustered determines physical storage order of rows (only one per table)', 'Non-clustered creates separate index structure containing pointers to data rows', 'Range queries benefit from clustered indexes'] },
      { id: 'be-m-7', topic: 'Microservices', question: 'What is the API Gateway pattern and what responsibilities does it handle?', expectedPoints: ['Single entry point for client requests', 'Routing to microservices, rate limiting, authentication/authorization, SSL termination, caching'] },
      { id: 'be-m-8', topic: 'Caching Strategies', question: 'Explain Cache-Aside vs Write-Through vs Write-Back caching strategies.', expectedPoints: ['Cache-Aside: app queries cache, on miss fetches from DB and populates cache', 'Write-Through: app writes to cache and DB synchronously', 'Write-Back: app writes to cache, async worker flushes to DB'] },
      { id: 'be-m-9', topic: 'Concurrency', question: 'What is the difference between Optimistic Locking and Pessimistic Locking?', expectedPoints: ['Pessimistic locks the database record during read until transaction ends', 'Optimistic checks version or timestamp column before committing update', 'Optimistic suited for low contention; pessimistic for high conflict risk'] },
      { id: 'be-m-10', topic: 'API Design', question: 'Explain rate limiting algorithms: Token Bucket vs Leaky Bucket vs Sliding Window.', expectedPoints: ['Token bucket allows bursts up to bucket capacity while refilling at constant rate', 'Leaky bucket processes requests at smooth steady rate', 'Sliding window log/counter provides accurate rolling time limit enforcement'] }
    ],
    'Hard': [
      { id: 'be-h-1', topic: 'Distributed Systems', question: 'Explain the CAP Theorem and PACELC theorem. How do distributed databases like Cassandra vs Spanner make trade-offs?', expectedPoints: ['CAP: Consistency, Availability, Partition Tolerance', 'PACELC: If Partition, choose A or C; Else, choose Latency or Consistency', 'Cassandra favors AP; Spanner uses TrueTime GPS clocks for CP consistency'] },
      { id: 'be-h-2', topic: 'Data Consistency', question: 'How do you implement distributed transactions across microservices using the Saga pattern (Choreography vs Orchestration)?', expectedPoints: ['Series of local transactions with compensating transactions for rollbacks', 'Choreography: services react to domain events via message broker', 'Orchestration: centralized coordinator orchestrates steps', 'Handling idempotency and eventual consistency'] },
      { id: 'be-h-3', topic: 'Event Streaming', question: 'Explain Kafka’s architecture: partitions, consumer groups, log compaction, and exactly-once processing semantics (EOS).', expectedPoints: ['Append-only distributed commit log divided into partitions', 'Consumer groups achieve parallel consumption and rebalancing', 'Log compaction retains latest value per key', 'Idempotent producers and transactional API achieve EOS'] },
      { id: 'be-h-4', topic: 'Database Internals', question: 'How does Write-Ahead Logging (WAL) and B+ Tree indexing work internally in relational database storage engines?', expectedPoints: ['WAL guarantees Durability by writing changes sequentially to disk before buffer pool dirty pages', 'B+ Trees store all records in leaf nodes linked as doubly-linked lists for fast range scans', 'Internal nodes only store keys for routing'] },
      { id: 'be-h-5', topic: 'High Availability', question: 'Design a globally distributed URL shortener (like TinyURL) handling 100k writes/sec and 1M reads/sec with low latency.', expectedPoints: ['Base62 encoding of distributed unique IDs (Twitter Snowflake / ZooKeeper range allocation)', 'Cache layer (Redis clusters with LRU eviction)', 'Read replicas with geo-DNS routing', 'Database sharding by hash of short key'] }
    ]
  }
};

/**
 * Get random questions avoiding previously used IDs
 */
function getBankQuestions(role, difficulty = 'Medium', count = 10, previousQuestionIds = []) {
  // Normalize role
  let roleKey = 'frontend-developer';
  const rLower = (role || '').toLowerCase();
  if (rLower.includes('backend') || rLower.includes('server') || rLower.includes('api')) {
    roleKey = 'backend-developer';
  }

  const roleQuestions = QUESTION_BANK[roleKey] || QUESTION_BANK['frontend-developer'];
  const pool = roleQuestions[difficulty] || roleQuestions['Medium'] || [];

  // Exclude previously used IDs
  const prevSet = new Set(previousQuestionIds);
  let available = pool.filter(q => !prevSet.has(q.id));

  // If pool exhausted, recycle all
  if (available.length < count) {
    available = [...pool];
  }

  // Shuffle
  const shuffled = available.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Start a new Mock Interview Session
 */
async function startInterviewSession({ userId, targetPosition, difficulty = 'Medium', questionCount = 10 }) {
  const db = getFirestore();
  const count = parseInt(questionCount, 10) === 15 ? 15 : 10;

  // 1. Retrieve previously used question IDs for this user
  let previousQuestionIds = [];
  try {
    const userHistoryDoc = await db.collection('usedInterviewQuestions').doc(userId).get();
    if (userHistoryDoc.exists) {
      previousQuestionIds = userHistoryDoc.data().questionIds || [];
    }
  } catch (err) {
    console.warn('Could not fetch used questions history:', err.message);
  }

  // 2. Generate or select unique questions
  let questions = [];
  try {
    // Try Gemini first with exclude list
    questions = await generateInterviewQuestions({
      role: targetPosition,
      difficulty,
      count,
      previousQuestionIds
    });
  } catch (genErr) {
    console.warn('Gemini question generation error, falling back to bank:', genErr.message);
  }

  if (!questions || questions.length < count) {
    questions = getBankQuestions(targetPosition, difficulty, count, previousQuestionIds);
  }

  // Ensure each question has a valid unique ID
  const selectedQuestionIds = [];
  questions = questions.map((q, idx) => {
    const qId = q.id || `q-${Date.now()}-${idx}`;
    selectedQuestionIds.push(qId);
    return {
      id: qId,
      number: idx + 1,
      topic: q.topic || 'Core Engineering',
      question: q.question,
      expectedPoints: q.expectedPoints || []
    };
  });

  // 3. Store newly used question IDs in user history
  try {
    const updatedQuestionIds = Array.from(new Set([...previousQuestionIds, ...selectedQuestionIds]));
    // Keep max 200 IDs to allow reasonable cycling
    const trimmed = updatedQuestionIds.slice(-200);
    await db.collection('usedInterviewQuestions').doc(userId).set({
      userId,
      questionIds: trimmed,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to update used questions history:', err.message);
  }

  const interviewId = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // Save session record
  const sessionData = {
    interviewId,
    userId,
    targetPosition,
    difficulty,
    questionCount: count,
    questions,
    startedAt: new Date().toISOString(),
    status: 'in-progress'
  };

  try {
    await db.collection('mockInterviews').doc(interviewId).set(sessionData);
  } catch (err) {
    console.error('Failed to save interview session:', err.message);
  }

  return {
    interviewId,
    targetPosition,
    difficulty,
    questionCount: count,
    questions: questions.map(q => ({
      id: q.id,
      number: q.number,
      topic: q.topic,
      question: q.question
    }))
  };
}

/**
 * Evaluate Complete Mock Interview
 */
async function evaluateInterviewSession({ userId, interviewId, answers = [] }) {
  const db = getFirestore();

  let sessionDoc = null;
  try {
    sessionDoc = await db.collection('mockInterviews').doc(interviewId).get();
  } catch (err) {
    console.warn('Failed to fetch session doc:', err.message);
  }

  const sessionData = (sessionDoc && sessionDoc.exists) ? sessionDoc.data() : {
    targetPosition: 'Software Engineer',
    difficulty: 'Medium',
    questions: []
  };

  const questions = sessionData.questions || [];
  const evaluatedQuestions = [];
  let totalScoreSum = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  const topicBreakdown = {};

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const userAns = (answers.find(a => a.id === q.id) || {}).answer || '';

    let evalResult = null;
    try {
      evalResult = await evaluateInterviewAnswer({
        question: q.question,
        answer: userAns,
        role: sessionData.targetPosition,
        difficulty: sessionData.difficulty
      });
    } catch (err) {
      console.warn('Answer evaluation error:', err.message);
    }

    if (!evalResult) {
      evalResult = {
        score: userAns.length > 20 ? 7 : 3,
        verdict: userAns.length > 20 ? 'Good' : 'Needs Improvement',
        strengths: ['Addressed the question.'],
        missingOrIncorrect: ['Could elaborate further.'],
        idealAnswerSummary: 'Explain the core principles, performance characteristics, and practical implementation.',
        feedback: 'Keep expanding your technical explanation.'
      };
    }

    totalScoreSum += evalResult.score;
    if (evalResult.score >= 6) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    const topic = q.topic || 'General';
    if (!topicBreakdown[topic]) {
      topicBreakdown[topic] = { total: 0, score: 0 };
    }
    topicBreakdown[topic].total += 10;
    topicBreakdown[topic].score += evalResult.score;

    evaluatedQuestions.push({
      id: q.id,
      number: q.number,
      topic: q.topic,
      question: q.question,
      userAnswer: userAns,
      evaluation: evalResult
    });
  }

  const maxPossible = (questions.length || 1) * 10;
  const overallPercentage = Math.round((totalScoreSum / maxPossible) * 100);

  // Formulate topic performance summary
  const topicPerformance = Object.entries(topicBreakdown).map(([topic, data]) => ({
    topic,
    scorePercentage: Math.round((data.score / data.total) * 100)
  }));

  const strengthsList = [];
  const weaknessesList = [];
  topicPerformance.forEach(tp => {
    if (tp.scorePercentage >= 70) {
      strengthsList.push(`Solid grasp of ${tp.topic} concepts`);
    } else {
      weaknessesList.push(`Further practice advised in ${tp.topic}`);
    }
  });

  const finalResult = {
    interviewId,
    userId,
    targetPosition: sessionData.targetPosition,
    difficulty: sessionData.difficulty,
    completedAt: new Date().toISOString(),
    overallScore: overallPercentage,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    totalQuestions: questions.length,
    topicPerformance,
    strengths: strengthsList.length > 0 ? strengthsList : ['Demonstrated fundamental knowledge and persistence.'],
    weaknesses: weaknessesList.length > 0 ? weaknessesList : ['Continue refining precision and real-world system nuances.'],
    recommendedTopics: topicPerformance.filter(t => t.scorePercentage < 70).map(t => t.topic),
    evaluatedQuestions
  };

  // Update session in Firestore
  try {
    await db.collection('mockInterviews').doc(interviewId).set({
      ...sessionData,
      status: 'completed',
      result: finalResult,
      completedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to update completed interview:', err.message);
  }

  return finalResult;
}

module.exports = {
  QUESTION_BANK,
  getBankQuestions,
  startInterviewSession,
  evaluateInterviewSession
};
