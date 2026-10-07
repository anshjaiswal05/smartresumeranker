// Curated Open Learning Roadmaps aligned with roadmap.sh community roadmaps
const ROADMAPS_DATA = {
  'frontend': {
    id: 'frontend',
    title: 'Frontend Developer Roadmap',
    description: 'Step by step guide to becoming a modern frontend developer in 2026.',
    prerequisites: ['Basic computer literacy', 'Familiarity with web browsers', 'Text editor usage'],
    topics: [
      {
        id: 'fe-internet',
        order: 1,
        title: 'How the Internet Works',
        description: 'Understand how computers communicate, DNS, HTTP/HTTPS, hosting, and browser rendering engines.',
        subtopics: ['How DNS works', 'HTTP/HTTPS protocols & status codes', 'Domain Names & Hosting', 'Browsers and How They Work'],
        resources: [
          { name: 'MDN: How the Web Works', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works' },
          { name: 'CS50: Internet Basics', url: 'https://cs50.harvard.edu/' }
        ]
      },
      {
        id: 'fe-html',
        order: 2,
        title: 'HTML & Semantic Web',
        description: 'Learn the backbone of web pages, accessibility best practices, and SEO structure.',
        subtopics: ['HTML Basics & Syntax', 'Forms and Validations', 'Semantic HTML5 Elements', 'Web Accessibility (ARIA) & SEO Basics'],
        resources: [
          { name: 'web.dev: Learn HTML', url: 'https://web.dev/learn/html/' },
          { name: 'MDN Web Docs: HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }
        ]
      },
      {
        id: 'fe-css',
        order: 3,
        title: 'CSS & Modern Layouts',
        description: 'Style responsive interfaces with Flexbox, Grid, CSS Variables, and animations.',
        subtopics: ['Box Model & Selectors', 'Flexbox & CSS Grid', 'Responsive Design & Media Queries', 'CSS Custom Properties (Variables)', 'Animations & Transitions'],
        resources: [
          { name: 'web.dev: Learn CSS', url: 'https://web.dev/learn/css/' },
          { name: 'CSS Tricks: Complete Guide to Flexbox', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/' }
        ]
      },
      {
        id: 'fe-js',
        order: 4,
        title: 'JavaScript Fundamentals & Modern ES6+',
        description: 'Master core programming, DOM manipulation, asynchronous programming, and modern APIs.',
        subtopics: ['Data Types & Control Flow', 'DOM & Event Handling', 'Promises, Async/Await & Fetch API', 'ES6+ Features (Destructuring, Modules)', 'Event Loop & Scope'],
        resources: [
          { name: 'JavaScript.info: Modern JS Tutorial', url: 'https://javascript.info/' },
          { name: 'MDN: JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }
        ]
      },
      {
        id: 'fe-vcs',
        order: 5,
        title: 'Version Control (Git & GitHub)',
        description: 'Collaborate with teams, track revisions, and manage branching workflows.',
        subtopics: ['Git Basics (init, add, commit, push, pull)', 'Branching, Merging & Merge Conflicts', 'Pull Requests & Code Reviews', 'GitHub Workflow'],
        resources: [
          { name: 'Git Official Documentation', url: 'https://git-scm.com/doc' }
        ]
      },
      {
        id: 'fe-framework',
        order: 6,
        title: 'Modern Frontend Framework (React)',
        description: 'Build complex reactive single-page applications with declarative component models.',
        subtopics: ['Components, JSX & Props', 'Hooks (useState, useEffect, useMemo)', 'State Management (Context, Zustand, Redux)', 'Routing & Lifecycle'],
        resources: [
          { name: 'React Official Documentation', url: 'https://react.dev/' }
        ]
      },
      {
        id: 'fe-build-tools',
        order: 7,
        title: 'Package Managers & Build Tools',
        description: 'Bundle assets, transpile modern syntax, and optimize build pipelines.',
        subtopics: ['npm, pnpm & yarn', 'Vite & Webpack basics', 'Linter & Formatter (ESLint, Prettier)', 'TypeScript Fundamentals'],
        resources: [
          { name: 'TypeScript Documentation', url: 'https://www.typescriptlang.org/docs/' }
        ]
      },
      {
        id: 'fe-testing',
        order: 8,
        title: 'Testing & Web Performance',
        description: 'Guarantee reliability and high-speed user experience across all devices.',
        subtopics: ['Unit Testing with Vitest/Jest', 'Component Testing (React Testing Library)', 'Core Web Vitals (LCP, INP, CLS)', 'Lighthouse Audits'],
        resources: [
          { name: 'web.dev: Core Web Vitals', url: 'https://web.dev/vitals/' }
        ]
      }
    ]
  },

  'backend': {
    id: 'backend',
    title: 'Backend Developer Roadmap',
    description: 'Step by step guide to engineering resilient server architectures and databases in 2026.',
    prerequisites: ['Basic programming logic', 'Command line comfort', 'Git version control'],
    topics: [
      {
        id: 'be-language',
        order: 1,
        title: 'Backend Language & Runtime',
        description: 'Deep dive into a robust backend runtime: Node.js/JavaScript, Python, or Go.',
        subtopics: ['Node.js Event Loop & Non-blocking I/O', 'Package Management & Environment Variables', 'File System & Streams', 'Process Management'],
        resources: [
          { name: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs/' }
        ]
      },
      {
        id: 'be-databases-rel',
        order: 2,
        title: 'Relational Databases (SQL & PostgreSQL)',
        description: 'Model structured schemas, write queries, manage transactions, and optimize indexes.',
        subtopics: ['Schema Design & Normalization', 'ACID Transactions', 'SQL Joins, Aggregations & Subqueries', 'Indexing & Query Performance Tuning'],
        resources: [
          { name: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/' }
        ]
      },
      {
        id: 'be-databases-nosql',
        order: 3,
        title: 'NoSQL & In-Memory Caching',
        description: 'Leverage flexible document stores and lightning-fast Redis cache layers.',
        subtopics: ['Document Databases (MongoDB)', 'Key-Value Stores & Caching (Redis)', 'Cache Invalidation Strategies', 'TTL & Pub/Sub'],
        resources: [
          { name: 'Redis Documentation', url: 'https://redis.io/docs/' }
        ]
      },
      {
        id: 'be-apis',
        order: 4,
        title: 'API Architecture & Protocols',
        description: 'Design secure, scalable RESTful services and modern GraphQL/gRPC interfaces.',
        subtopics: ['REST Principles & HTTP Status Codes', 'Authentication (JWT, OAuth 2.0, Sessions)', 'Rate Limiting & CORS', 'OpenAPI / Swagger Documentation'],
        resources: [
          { name: 'OWASP REST Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/' }
        ]
      },
      {
        id: 'be-containers',
        order: 5,
        title: 'Containerization & CI/CD',
        description: 'Package applications reproducibly with Docker and automate tests.',
        subtopics: ['Dockerfiles & Image Layering', 'Docker Compose for Multi-Container Dev', 'GitHub Actions / CI Pipelines', 'Environment Secrets Management'],
        resources: [
          { name: 'Docker Get Started', url: 'https://docs.docker.com/get-started/' }
        ]
      },
      {
        id: 'be-system-design',
        order: 6,
        title: 'System Design & Scalability',
        description: 'Scale systems from single instance to high-availability distributed architecture.',
        subtopics: ['Load Balancers & Reverse Proxies (Nginx)', 'Horizontal vs Vertical Scaling', 'Message Brokers (RabbitMQ, Kafka)', 'CAP Theorem & Microservices'],
        resources: [
          { name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }
        ]
      }
    ]
  },

  'fullstack': {
    id: 'fullstack',
    title: 'Full Stack Developer Roadmap',
    description: 'Master full-cycle web engineering from pixel-perfect UI to scalable cloud backend.',
    prerequisites: ['HTML/CSS/JS fundamentals', 'Git basics'],
    topics: [
      {
        id: 'fs-frontend',
        order: 1,
        title: 'Frontend Mastery',
        description: 'Build modern user experiences with React, TypeScript, and modern styling.',
        subtopics: ['React Component Lifecycle & Hooks', 'TypeScript Typing & Interfaces', 'State Management & Client Routing', 'Responsive CSS & Tailwind'],
        resources: [{ name: 'React Documentation', url: 'https://react.dev/' }]
      },
      {
        id: 'fs-backend',
        order: 2,
        title: 'Full Stack Frameworks & APIs',
        description: 'Unify client and server with Next.js or Express REST endpoints.',
        subtopics: ['Server-Side Rendering (SSR) & Server Components', 'API Routes & REST Endpoints', 'Data Fetching & Mutations', 'Authentication & Session Handling'],
        resources: [{ name: 'Next.js Documentation', url: 'https://nextjs.org/docs' }]
      },
      {
        id: 'fs-database',
        order: 3,
        title: 'Database & ORM Integration',
        description: 'Connect databases safely using Prisma or Drizzle ORM.',
        subtopics: ['PostgreSQL & MongoDB', 'Prisma / Drizzle ORM', 'Database Migrations', 'Connection Pooling'],
        resources: [{ name: 'Prisma Documentation', url: 'https://www.prisma.io/docs' }]
      },
      {
        id: 'fs-deployment',
        order: 4,
        title: 'Deployment & Production Ops',
        description: 'Ship to cloud providers, configure monitoring, and manage production domains.',
        subtopics: ['Dockerizing Fullstack Apps', 'Cloud Hosting (Vercel, AWS EC2/ECS)', 'SSL, DNS & Environment Variables', 'Logging & Error Monitoring'],
        resources: [{ name: 'AWS Documentation', url: 'https://aws.amazon.com/documentation/' }]
      }
    ]
  },

  'ml-engineer': {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer Roadmap',
    description: 'From statistical foundations and data prep to deploying deep neural networks in production.',
    prerequisites: ['Python proficiency', 'Calculus, Linear Algebra, and Probability basics'],
    topics: [
      {
        id: 'ml-math',
        order: 1,
        title: 'Mathematics & Data Foundations',
        description: 'Master linear algebra, calculus, probability distributions, and statistical testing.',
        subtopics: ['Linear Algebra (Vectors, Matrices, Eigenvalues)', 'Calculus (Gradients, Chain Rule)', 'NumPy, Pandas, & Matplotlib', 'Exploratory Data Analysis (EDA)'],
        resources: [{ name: 'Khan Academy: Linear Algebra', url: 'https://www.khanacademy.org/math/linear-algebra' }]
      },
      {
        id: 'ml-classical',
        order: 2,
        title: 'Classical Machine Learning',
        description: 'Supervised and unsupervised machine learning algorithms using Scikit-Learn.',
        subtopics: ['Linear & Logistic Regression', 'Decision Trees, Random Forests & Gradient Boosting (XGBoost)', 'Clustering (K-Means, DBSCAN)', 'Model Evaluation & Cross-Validation'],
        resources: [{ name: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/' }]
      },
      {
        id: 'ml-deep-learning',
        order: 3,
        title: 'Deep Learning & Neural Networks',
        description: 'Architect artificial neural networks with PyTorch and TensorFlow.',
        subtopics: ['Perceptrons & Backpropagation', 'Convolutional Neural Networks (CNNs)', 'Recurrent Networks (RNNs, LSTMs)', 'Transformers & Self-Attention Mechanism'],
        resources: [{ name: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' }]
      },
      {
        id: 'ml-mlops',
        order: 4,
        title: 'MLOps & Model Deployment',
        description: 'Containerize models, set up automated retraining pipelines, and serve low-latency inferences.',
        subtopics: ['FastAPI Inference Services', 'Docker Containerization', 'MLflow & Experiment Tracking', 'Model Quantization & TensorRT'],
        resources: [{ name: 'MLflow Documentation', url: 'https://mlflow.org/docs/latest/index.html' }]
      }
    ]
  },

  'devops': {
    id: 'devops',
    title: 'DevOps & SRE Roadmap',
    description: 'Master infrastructure as code, continuous deployment, observability, and cloud platforms.',
    prerequisites: ['Linux terminal proficiency', 'Networking fundamentals', 'Git'],
    topics: [
      {
        id: 'do-linux',
        order: 1,
        title: 'Linux Systems & Shell Scripting',
        description: 'Master operating system internals, permissions, process monitoring, and Bash.',
        subtopics: ['Linux File Hierarchy & Permissions', 'Process Management (systemd, top, ps)', 'Bash Scripting & Automation', 'Networking (SSH, DNS, iptables)'],
        resources: [{ name: 'Linux Journey', url: 'https://linuxjourney.com/' }]
      },
      {
        id: 'do-containers',
        order: 2,
        title: 'Containers & Kubernetes',
        description: 'Orchestrate distributed workloads across clusters.',
        subtopics: ['Docker Architecture & Multi-Stage Builds', 'Kubernetes Architecture (Pods, Services, Deployments)', 'Ingress Controllers & ConfigMaps', 'Helm Charts & Package Management'],
        resources: [{ name: 'Kubernetes Official Documentation', url: 'https://kubernetes.io/docs/home/' }]
      },
      {
        id: 'do-iac',
        order: 3,
        title: 'Infrastructure as Code (IaC)',
        description: 'Provision reproducible cloud environments with Terraform.',
        subtopics: ['Terraform Syntax (HCL)', 'State Management & Remote Backends', 'Terraform Modules', 'Ansible Configuration Management'],
        resources: [{ name: 'HashiCorp Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials' }]
      },
      {
        id: 'do-observability',
        order: 4,
        title: 'Observability & Monitoring',
        description: 'Collect metrics, logs, and distributed traces to maintain 99.99% uptime.',
        subtopics: ['Prometheus Metrics Collection', 'Grafana Dashboards & Alerting', 'Centralized Logging (ELK / Loki)', 'SLIs, SLOs & Incident Management'],
        resources: [{ name: 'Prometheus Documentation', url: 'https://prometheus.io/docs/introduction/overview/' }]
      }
    ]
  },

  'cybersecurity': {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst Roadmap',
    description: 'Learn defensive security, network forensics, threat hunting, and secure architecture.',
    prerequisites: ['Networking fundamentals (TCP/IP, OSI Model)', 'Operating Systems concepts'],
    topics: [
      {
        id: 'cs-foundations',
        order: 1,
        title: 'Security Foundations & Networking',
        description: 'Understand the threat landscape, cryptography fundamentals, and protocol analysis.',
        subtopics: ['OSI Model & TCP/IP Handshake', 'Symmetric & Asymmetric Cryptography (RSA, AES, TLS)', 'Port Scanning with Nmap', 'Wireshark Packet Analysis'],
        resources: [{ name: 'Cybrary Free Security Training', url: 'https://www.cybrary.it/' }]
      },
      {
        id: 'cs-web-security',
        order: 2,
        title: 'Application & Web Security',
        description: 'Mitigate the most common application attack vectors.',
        subtopics: ['OWASP Top 10 Vulnerabilities', 'SQL Injection & Cross-Site Scripting (XSS)', 'Cross-Site Request Forgery (CSRF)', 'Burp Suite Testing Basics'],
        resources: [{ name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security' }]
      },
      {
        id: 'cs-soc',
        order: 3,
        title: 'SOC Operations & Threat Hunting',
        description: 'Analyze telemetry, detect unauthorized intrusion, and run playbooks.',
        subtopics: ['SIEM (Splunk, Elastic SIEM)', 'Log Analysis & Anomaly Detection', 'Incident Response Playbooks', 'Endpoint Detection & Response (EDR)'],
        resources: [{ name: 'SANS Institute Security Resources', url: 'https://www.sans.org/' }]
      }
    ]
  }
};

function getAllRoadmaps() {
  return Object.values(ROADMAPS_DATA).map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    topicCount: r.topics.length
  }));
}

function getRoadmapByRole(roleId) {
  const normalized = (roleId || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return ROADMAPS_DATA[normalized] || ROADMAPS_DATA['frontend'];
}

module.exports = {
  ROADMAPS_DATA,
  getAllRoadmaps,
  getRoadmapByRole
};
