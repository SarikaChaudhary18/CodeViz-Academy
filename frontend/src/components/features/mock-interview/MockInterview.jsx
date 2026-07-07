import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../hooks/useStore';
import { Terminal, Send, Play, RefreshCw, Award, User, Bot, AlertCircle } from 'lucide-react';
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from '../../../lib/utils';

// ==================== Popover Components ====================

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef(function PopoverContent(
  { className, align = "center", sideOffset = 4, ...props },
  ref
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border border-white/10 bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const keywordMatrix = {
  'Frontend Developer': ['memo', 'usememo', 'usecallback', 'virtual', 'window', 're-render', 'colocating state', 'debounce', 'clamp', 'fluid', 'rem', 'em', 'media query', 'calc', 'tailwind', 'font-size', 'useeffect', 'ref', 'websocket', 'backoff', 'reconnect', 'settimeout', 'cleanup', 'ws', 'v8', 'jit', 'microtask', 'macrotask', 'event loop', 'hydration', 'lighthouse', 'cls', 'fid', 'lcp', 'webrtc', 'multiplexing', 'http/2', 'fiber', 'ssr', 'csrf', 'xss', 'csp', 'shaking', 'splitting'],
  'Backend Developer': ['poolsize', 'connection pooling', 'indexing', 'explain', 'readpreference', 'replica set', 'sticky session', 'load balancer', 'websocket', 'handshake', 'redis', 'pub/sub', 'ip hash', 'socket.io', 'token bucket', 'sliding window', 'leaky bucket', 'rate limit', 'middleware', 'timestamp', 'profile', 'heap dump', 'bottleneck', 'query optimization', 'saga', 'consensus', 'raft', 'paxos', 'sharding', 'replica', 'deadlock', 'grpc', 'backpressure', 'stream', 'auth', 'cors', 'encryption', 'hashing'],
  'Full Stack Developer': ['server component', 'client component', 'rsc', 'ssr', 'dynamic', 'static', 'boundary', 'use client', 'broadcast channel', 'localstorage', 'websocket', 'transaction', 'isolation level', 'optimistic locking', 'synchronization', 'cache', 'redis', 'index', 'query', 'preload', 'lazy', 'ttfb', 'cdn', 'server-side rendering', 'csrf', 'xss', 'helmet', 'cors', 'cookie', 'httponly', 'samesite', 'sanitize', 'jwt'],
  'DevOps Engineer': ['sysctl', 'nofile', 'ulimit', 'tcp_tw_reuse', 'tcp_fin_timeout', 'socket', 'descriptor', 'secret', 'vault', 'env', 'rotation', 'kms', 'gitguardian', 'variables', 'github secrets', 'multi-stage', 'alpine', 'distroless', 'size', 'layer', 'cache', 'scan', 'security', 'volume', 'backup', 'restore', 'recovery', 'state', 'persistence', 'replica'],
  'AI Engineer': ['embedding', 'chunk', 'cosine', 'distance', 'similarity', 'vector', 'dot product', 'overlap', 'injection', 'json', 'schema', 'system prompt', 'parser', 'validation', 'pydantic', 'guardrails', 'rag', 'fine-tune', 'context', 'knowledge', 'parameter', 'hallucination', 'cost', 'retrieval', 'learning rate', 'batch size', 'gpu', 'deepspeed', 'lora', 'quantization', 'optimization'],
  'ML Engineer': ['transformer', 'rnn', 'parallel', 'attention', 'attention mechanism', 'sequence', 'recurrent', 'long-range', 'gradient clipping', 'resnet', 'residual', 'batch normalization', 'weight initialization', 'relu', 'drift', 'concept drift', 'data drift', 'ks test', 'psi', 'monitor', 'retrain', 'baseline', 'quantization', 'pruning', 'weight', 'float16', 'int8', 'edge', 'latency', 'size'],
  'AI/ML Engineer': ['redis', 'feature store', 'latency', 'feast', 'online', 'offline', 'cache', 'pipeline', 'concept drift', 'monitor', 'retrain', 'pipeline', 'scheduler', 'drift detection', 'airflow', 'bias', 'fairness', 'evaluation', 'toxicity', 'prompting', 'benchmark', 'red teaming', 'debug', 'degradation', 'performance', 'drift', 'pipeline', 'monitoring', 'metrics'],
  'Cybersecurity': ['stride', 'threat modeling', 'microservices', 'cloud', 'attack surface', 'trust boundary', 'iam', 'symmetric', 'asymmetric', 'public key', 'private key', 'tls', 'handshake', 'session key', 'certificate', 'sql injection', 'idor', 'parameterized', 'prepared statement', 'authorization', 'uuid', 'owasp', 'incident response', 'contain', 'mitigate', 'log', 'isolation', 'forensics', 'backup'],
  'Cybersecurcity': ['stride', 'threat modeling', 'microservices', 'cloud', 'attack surface', 'trust boundary', 'iam', 'symmetric', 'asymmetric', 'public key', 'private key', 'tls', 'handshake', 'session key', 'certificate', 'sql injection', 'idor', 'parameterized', 'prepared statement', 'authorization', 'uuid', 'owasp', 'incident response', 'contain', 'mitigate', 'log', 'isolation', 'forensics', 'backup']
};

export default function MockInterview() {
  const { user, logActivity } = useStore();
  
  const [role, setRole] = useState('Frontend Developer');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [scoreFeedback, setScoreFeedback] = useState(null);
  const chatEndRef = useRef(null);

  const interviewQuestions = {
    'Frontend Developer': [
      "How do you optimize React component re-renders under high metrics loads?",
      "When building design systems, how do you handle responsive typography without bloating utility variables?",
      "Design a custom hook that handles WebSocket connection states and reconnects with exponential backoff.",
      "Tell me about a time you had a technical disagreement with a team member regarding frontend structure. How did you align?",
      "How does V8 engine's JIT compilation optimize JavaScript dynamic property access?",
      "Describe the difference between progressive hydration, server-side rendering, and static site generation.",
      "Explain how the Microtask queue differs from the Macrotask queue in the JavaScript Event Loop.",
      "How do you offload CPU-heavy calculations to Web Workers without blocking the main execution thread?",
      "What is paint flashing, and how do you use CSS properties like will-change to create independent compositor layers?",
      "How do you debug heap allocations and identify memory leaks caused by JS closures?",
      "Explain the critical rendering path. How do you defer non-blocking resources to reduce Time to Interactive (TTI)?",
      "How do PWAs use service worker caching strategies (Cache First, Network First) to support offline states?",
      "What is Cumulative Layout Shift (CLS), and how do you prevent dynamic content from shifting elements?",
      "How do you optimize font delivery to prevent Flash of Unstyled Text (FOUT) and Flash of Invisible Text (FOIT)?",
      "Explain the encapsulation model of Shadow DOM. How does it affect layout style isolation?",
      "How does HTTP/2 multiplexing mitigate the head-of-line blocking problem in frontend asset loading?",
      "Explain the design of React Fiber. How does concurrent rendering pause and resume reconciliations?",
      "What are hydration mismatch errors in Next.js, and what are the debugging steps to trace them?",
      "How do you implement code-splitting and dynamic imports to reduce initial Javascript bundles?",
      "How does Content Security Policy (CSP) protect modern frontend SPAs from Cross-Site Scripting (XSS)?",
      "What is tree shaking, and how do you configure sideEffects in package.json to help bundlers shake unused exports?",
      "How do you build hardware-accelerated animations using CSS transitions and transform properties?",
      "When should you use requestIdleCallback instead of requestAnimationFrame for layout updates?",
      "How do you build accessible (A11y) interfaces using WAI-ARIA attributes and keyboard traversal flows?",
      "Compare the performance profile of Virtual DOM diffing against compiled templates (like Svelte's direct DOM updates).",
      "How does React's synthetic event delegation model work in React 17/18 compared to older versions?",
      "Explain resource hints (prefetch, preload, dns-prefetch) and their optimal use-cases.",
      "Describe the runtime styling performance overhead introduced by CSS-in-JS libraries.",
      "How do you profile a frontend bundle using Webpack Bundle Analyzer to identify duplicate dependency trees?",
      "What is First Input Delay (FID), and how does breaking up long tasks optimize main-thread responsiveness?",
      "How do you configure custom React Error Boundaries to catch async render exceptions in nested children?",
      "Explain dynamic module resolution in ES6. How does it handle circular dependencies?",
      "Implement debounce and throttle concepts. Explain their architectural differences in scroll event handling.",
      "How do you optimize media loading using modern formats (WebP, AVIF) and responsive picture elements?",
      "Explain the mechanics of CORS preflight OPTIONS requests. How does it impact API call latencies?",
      "How do you implement optimistic UI rendering to provide instant feedback for slow network transactions?",
      "How do CSS Container Queries differ from Media Queries, and how do they improve modular design systems?",
      "Describe V8's Generational Garbage Collector (Young generation Scavenge vs Old generation Mark-Sweep-Compact).",
      "How do you design a scalable state architecture in complex apps using Zustand or Redux Toolkit?",
      "What is the difference between client-side state managers and server-state caching engines like React Query?",
      "How do you implement strict type-safety boundaries at API response checkpoints using TypeScript?",
      "Describe SSR, SSG, and ISR (Incremental Static Regeneration) caching hierarchies.",
      "How do you resolve memory leaks in Single Page Application routers that cache historical DOM nodes?",
      "What JS operations trigger DOM reflows vs repaints, and how do you batch them?",
      "How do you securely store auth tokens on the client side to mitigate both XSS and CSRF risks?",
      "Explain how DNS prefetching and pre-rendering reduce subsequent navigation latencies.",
      "How do you manage complex multi-tab state sync using BroadcastChannel or SharedWorkers?",
      "Explain the impact of Layout Shifts on Search Engine Optimization (SEO) and Core Web Vitals.",
      "How do you profile runtime CPU cycles and performance bottlenecks using Chrome DevTools Performance tab?",
      "Finally, design an offline-first data sync engine that resolves conflicts when connecting back online."
    ],
    'Backend Developer': [
      "How do you manage MongoDB client connection pooling and optimize index usage for high-read collections?",
      "Explain sticky sessions in load balancers. Why is this critical when scaling WebSockets across a multi-server node cluster?",
      "If you had to build an IP rate limiter from scratch, what algorithm (e.g. Token Bucket, Sliding Window) would you implement and why?",
      "Describe a scenario where you had to debug a production memory leak or query bottleneck. What steps did you take?",
      "How do you implement distributed locks using Redis (Redlock) or ZooKeeper? What are the potential failure modes?",
      "Compare the Saga Pattern (Orchestration vs Choreography) against 2-Phase Commit for microservices database transactions.",
      "What is CORS, and how do backend middleware validate origin requests while preserving credential options?",
      "Explain CQRS (Command Query Responsibility Segregation). How do you synchronize read/write databases?",
      "How do you design database sharding strategies, and how do you resolve partition key hot-spotting?",
      "Compare Raft against Paxos consensus algorithms. How do distributed key-value stores use them for leader election?",
      "How do you mitigate PostgreSQL/MySQL master-slave replication lag in high-throughput write applications?",
      "How do consumer groups in message queues (like Kafka or RabbitMQ) scale horizontal packet delivery?",
      "How do you optimize Garbage Collection (GC) pauses in Java or Node.js backend runtimes?",
      "How do you configure reverse proxies (Nginx/HAProxy) for request buffering and keep-alive optimization?",
      "How do you identify socket descriptor exhaustion under extreme TCP connection loads, and what sysctl params do you tune?",
      "Explain TCP window auto-tuning and how packet fragmentation affects backend throughput.",
      "What are the security implications of JWTs for sessions? How do you implement secure blacklist revocation?",
      "Explain SQL Injection at the compilation level. How do prepared statements guarantee protection?",
      "How do you implement container isolation and resource allocation limits (CPU/Memory cgroups) for backend tasks?",
      "How do you construct an aggregated logging and metric collection pipeline using Loki, Prometheus, and Grafana?",
      "Explain the Circuit Breaker pattern. How do you determine fail-fast thresholds for microservices?",
      "How do you prevent cache stampedes (thundering herd problem) under heavy load spikes?",
      "How do you implement zero-downtime database schema migrations using the Expand and Contract pattern?",
      "How do you configure PostgreSQL read-replicas, and how does your application layer route read vs write queries?",
      "Explain ACID transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).",
      "How do you tune thread-pools and event-loops for optimal resource utilization in modern backend runtimes?",
      "Compare gRPC protocol serialization against REST JSON payloads. How does gRPC optimize network transport?",
      "How do you implement secure OAuth2 Authorization Code flow with PKCE on the backend?",
      "How do database deadlocks happen, and how does the database engine detect and resolve them?",
      "How do you scale distributed cron job schedulers across an active-active multi-instance deployment?",
      "What is backpressure in streaming APIs, and how does a reactive stream handle fast producers?",
      "Explain service discovery protocols (Consul, Eureka) in decentralized microservice architectures.",
      "How do you optimize slow database queries using query execution plans (EXPLAIN ANALYZE)?",
      "Describe the difference between stateful and stateless backend services, and how it impacts scaling.",
      "How do you securely handle sensitive data (PII) at rest and in transit in payment processing backends?",
      "How do you configure connection timeout thresholds and retry budgets in service-to-service calls?",
      "Explain the difference between WebSockets and Server-Sent Events (SSE). When is SSE the better choice?",
      "How do you debug DB connection pool exhaustion, and what metrics indicate pool starvation?",
      "How do you optimize backend memory layouts when processing large JSON datasets or file streams?",
      "Explain the DB transaction concurrency anomalies (Dirty Read, Non-Repeatable Read, Phantom Read, Serialization Anomaly).",
      "How do you implement rate limiting with Redis using Lua scripting to ensure atomic execution?",
      "Describe how database MVCC (Multi-Version Concurrency Control) implements non-blocking reads.",
      "Explain DNS resolution caching, and how to avoid cache poisoning on backend servers.",
      "How does Node's libuv thread pool handle file system read/write operations under the hood?",
      "How do you build a resilient message retry queue with Dead Letter Queues (DLQ) in RabbitMQ?",
      "Explain the difference between SQL and NoSQL databases regarding consistency models (BASE vs ACID).",
      "How do you secure server-to-server microservices communications using mutual TLS (mTLS)?",
      "What is database connection pool starvation, and how do you troubleshoot it?",
      "How do you log and aggregate system events without introducing performance delays in API controllers?",
      "Finally, how do you design a scalable notification service that handles millions of push messages concurrently?"
    ],
    'Full Stack Developer': [
      "How do you structure a high-performance Next.js application and draw boundaries between Client and Server Components?",
      "How do you manage global state synchronization between multiple client tabs and database transactions?",
      "What techniques do you use to optimize database queries and decrease Time to First Byte (TTFB) for complex layouts?",
      "Describe how you secure your API endpoints against CSRF and cross-site scripting vulnerabilities.",
      "Explain Server-Side Rendering (SSR) hydration mismatch errors, and how to debug them.",
      "How do you manage database connection counts when deploying full stack apps on serverless (Lambda) architectures?",
      "Explain the architectural differences between Next.js App Router and Pages Router regarding server layout layouts.",
      "How do you implement secure cookie-based session management across different subdomains?",
      "Describe how you structure a monorepo for shared code types between React frontend and Node backend.",
      "How do you implement optimistic UI updates for nested comment threads in real-time apps?",
      "What caching levels (Browser, CDN edge, Redis, DB query cache) do you build in complex e-commerce layouts?",
      "How do you handle JWT verification overhead on high-frequency API endpoints?",
      "Explain how you design RESTful routing schemas and support API version deprecations.",
      "How do you implement full stack web socket routing and load balance WS sessions across server instances?",
      "How do database transaction isolation levels affect concurrent writes on shared inventory stocks?",
      "Explain how GraphQL DataLoader resolves N+1 query problems in nested entity retrievals.",
      "How do you implement a secure File Upload pipeline that validates MIME-types and scans for malware?",
      "Explain the CSS-in-JS overhead on page rendering times in Server-Side Rendered projects.",
      "How do you build dynamic components with lazy loading in React to improve First Contentful Paint (FCP)?",
      "Explain how database indexing models (B-Trees, GIN, GiST) affect search speeds and insert delays.",
      "How do you configure Content Security Policy (CSP) headers to prevent unauthorized script executions?",
      "How do you handle background task queues (BullMQ, Celery) to process PDF reports without blocking HTTP threads?",
      "Explain dynamic imports in ES Modules. How do they affect bundler chunk splitting?",
      "How do you configure OAuth2 authentication with third-party identity providers (Google, GitHub)?",
      "Describe the difference between stateful server routing and stateless JSON Web Token (JWT) authorizations.",
      "How do you audit and resolve security alerts (e.g. npm audit) in full stack dependencies?",
      "Explain how to implement dual-write synchronizations between SQL and Elasticsearch engines.",
      "How do you optimize slow initial page loads using prefetching and connection hint tags?",
      "How do you implement atomic counter increments in Redis to track daily active user analytics?",
      "What is gRPC, and when would you choose it over standard HTTP REST APIs for backend integration?",
      "How do you prevent DB connection pool starvation during peak load spikes?",
      "Explain how the V8 engine garbage collector manages memory in full stack Node runtimes.",
      "How do you implement rate limiting using Token Bucket algorithm inside full stack gateways?",
      "Describe how layout reflows and repaints impact client performance on heavy data dashboards.",
      "How do you manage complex DB schema migrations without taking the application offline?",
      "What is WebRTC peer signaling, and how does it compare to standard client-server polling?",
      "How do you compile static pages in Next.js (SSG) and revalidate them dynamically (ISR)?",
      "How do you synchronize local state changes with server database logs using optimistic locking?",
      "Explain the CAP theorem choices in full stack distributed caching setups.",
      "How do you implement custom React Error Boundaries to catch render exceptions on dashboard grids?",
      "Explain the differences between WebSockets and Server-Sent Events (SSE) for real-time tickers.",
      "How do you secure API routes against IDOR (Insecure Direct Object Reference) vulnerabilities?",
      "How do you profile full stack bottlenecks using APM tools like Datadog or New Relic?",
      "Describe how to implement secure credential storage and encryption keys using HashiCorp Vault.",
      "How do you resolve memory leaks in Single Page Application routers that cache React component trees?",
      "Explain the benefits and downsides of micro-frontends architectures in enterprise dashboards.",
      "How do you configure reverse proxies to support compression (Gzip/Brotli) and keep-alive connections?",
      "How do you scale notification systems to handle millions of push events concurrently?",
      "Explain how database deadlocks happen, and how you design queries to avoid them.",
      "Finally, how do you build an offline-first data sync engine that resolves client-server merge conflicts?"
    ],
    'DevOps Engineer': [
      "What system network parameters do you configure in Linux kernels to scale socket descriptors for high-load TCP connections?",
      "When designing CI/CD pipelines, how do you handle secrets rotation and avoid storing build credentials inside Git logs?",
      "Describe your strategy for multi-stage Docker builds. How do you optimize Docker image size and ensure container security in production?",
      "Tell me about a time when a critical database container crashed. How did you restore services without losing state?",
      "Explain how Kubernetes ingress controllers manage traffic routing and TLS termination.",
      "How do you implement zero-downtime rolling updates in Kubernetes deployments?",
      "How do you detect and reconcile configuration drift in infrastructure defined by Terraform?",
      "Describe the difference between Blue-Green deployments and Canary deployments regarding traffic shaping.",
      "How do you configure Prometheus alerting rules to avoid alert fatigue during short spikes?",
      "Explain the Principle of Least Privilege in IAM. How do you structure role hierarchies in AWS/GCP?",
      "How do you design Kubernetes autoscaling (HPA) policies based on custom Prometheus metrics?",
      "Explain the storage driver difference between Docker bind mounts and named persistent volumes.",
      "How do you optimize Nginx reverse proxy buffering to handle large payloads without disk writes?",
      "What is a service mesh (Istio, Linkerd), and how does it manage mutual TLS (mTLS) service communication?",
      "How do you troubleshoot DNS propagation delays in high-traffic domain migrations?",
      "Describe how container runtime security scanners detect active vulnerabilities in running pods.",
      "How do you handle stateful databases inside Kubernetes? When would you use StatefulSets over Deployments?",
      "Explain how to configure distributed logging pipelines using Fluentd, Elasticsearch, and Kibana.",
      "How do you construct high-availability setups for PostgreSQL databases using Patroni or replication pools?",
      "Explain how SAST (Static Application Security Testing) is integrated into GitHub Actions pipelines.",
      "How do you design network security policies (NetworkPolicies) to isolate namespaces in Kubernetes?",
      "Explain the sidecar container pattern. How does it bootstrap proxies alongside application pods?",
      "How do you optimize CDN edge caching rules for dynamic versus static contents?",
      "Describe your disaster recovery (DR) testing workflow. How do you measure RTO and RPO?",
      "How do you handle database password rotations in application pods without restarting containers?",
      "Explain how Linux namespace isolation forms the basis of Docker container boundaries.",
      "How do you configure reverse proxies to handle WebSockets upgrades and HTTP/2 transport?",
      "Explain the benefits and downsides of GitOps deployments using tools like ArgoCD or Flux.",
      "How do you analyze system bottlenecks using tools like iostat, netstat, and htop under high IO loads?",
      "How do you secure the software supply chain (e.g. validating Docker image signatures using Cosign)?",
      "What is infrastructure-as-code configuration drift, and how does Terraform plan detect it?",
      "How do you scale Kubernetes clusters using Cluster Autoscaler across multiple availability zones?",
      "Explain how TLS handshakes work at the TCP level and how session tickets speed up handshakes.",
      "How do you configure reverse proxy load balancing policies (IP Hash, Least Connections, Round Robin)?",
      "How do you troubleshoot network packet loss in cloud-native virtual private networks (VPCs)?",
      "Explain how K8s readiness probes differ from liveness probes regarding routing and pod lifecycle.",
      "How do you implement centralized secrets management using HashiCorp Vault inside Kubernetes?",
      "How do you optimize Docker base image layers to speed up CI/CD pipeline builds?",
      "Explain the differences between REST APIs and gRPC regarding network overhead in service meshes.",
      "How do you configure file system storage layouts (RAID, NVMe) for write-intensive database containers?",
      "Explain DNS cache poisoning and what DNSSEC resolves in global domain configurations.",
      "How do you build a resilient auto-rollback pipeline that triggers on target threshold error rates?",
      "How does Docker networking (Bridge, Host, Overlay) manage packet routing between nodes?",
      "Explain how database connection pooling differs from HTTP connection reuse on reverse proxies.",
      "How do you troubleshoot storage class provisioning bottlenecks in Kubernetes volumes?",
      "Explain the difference between mutable and immutable infrastructure paradigms.",
      "How do you secure Docker daemons and configure rootless container executions?",
      "How do you aggregate system telemetry metrics using OpenTelemetry standards?",
      "Explain how Linux cgroups limit CPU shares and memory bounds for containerized workloads.",
      "Finally, design a highly available multi-region architecture that guarantees fast failover on region outages."
    ],
    'AI Engineer': [
      "How do you construct vector embeddings for long documents, and which search metrics (e.g., Cosine, Euclidean) do you recommend for semantic lookups?",
      "How do you handle LLM prompt injections and ensure that output APIs consistently return parsed JSON structures?",
      "When would you choose fine-tuning a model over context-based Retrieval-Augmented Generation (RAG)?",
      "Tell me about a time you optimized training parameters or resource usage to scale training models efficiently.",
      "Explain the differences between sparse vector indices (BM25) and dense vector embeddings in search.",
      "How do vector databases index embeddings using Hierarchical Navigable Small World (HNSW) graphs?",
      "Explain how context window limitations affect prompt design in multi-turn AI interactions.",
      "How do you implement semantic search pagination and handle duplicate embedding matches?",
      "Explain model quantization (FP16 to INT8). How does it impact execution latency and model accuracy?",
      "How do you design LLM guardrail APIs to prevent hallucinations and filter restricted topics?",
      "Explain agentic workflow loops. How do you design tool-use prompts that execute shell/API commands?",
      "How do you construct knowledge graphs to augment dense vector embeddings in hybrid RAG systems?",
      "Explain Tokenizer mechanics (Byte-Pair Encoding). How do special tokens affect API prompts?",
      "How do you handle rate-limit throttling in LLM API services using queuing and parallel requests?",
      "How do you design system prompt architectures that enforce JSON output formats?",
      "Explain how temperature, top_p, and top_k settings modify LLM next-token probability distributions.",
      "How do you trace and evaluate prompt engineering quality using metrics like ROUGE, BLEU, or LLM-as-a-judge?",
      "How do you host and run open-source LLMs (like Llama-3) locally using vLLM or Ollama?",
      "Explain multi-modal LLM mechanics. How are image coordinates parsed and mapped alongside token embeddings?",
      "How do you implement dynamic context retrieval chunking using sentence-window methods?",
      "Explain context drift in LLM conversations, and how you manage conversational memory blocks.",
      "How do you design a secure execution sandbox for AI models that execute generated code?",
      "How does semantic search ranking benefit from cross-encoder re-ranking models?",
      "Explain semantic caching pipelines. How do you cache LLM outputs based on prompt similarities?",
      "How do you evaluate vector search latency bottlenecks using QPS and latency metrics?",
      "How do you debug prompt instructions when LLMs consistently fail to follow negative constraints?",
      "Explain the difference between model parameter weights, activations, and KV cache sizes.",
      "How do you handle large file processing in AI pipelines using streaming text segmentations?",
      "Explain how model prompt compilation frameworks (like DSPy) optimize prompt inputs automatically.",
      "How do you configure vector index parameters to optimize recall rates vs index construction times?",
      "Explain the differences between RAG vector databases: Pgvector vs pinecone vs ChromaDB.",
      "How do you implement local document parsing pipelines that extract table layouts for AI processing?",
      "Explain how system prompts isolate user inputs from model output instructions.",
      "How do you build a semantic routing gateway that routes user queries to specialized agents?",
      "How do you handle bias and toxicity filtering in open-source model completions?",
      "Explain how LLM model inference speeds are calculated using Time-to-First-Token (TTFT) metrics.",
      "How do you implement auto-correction loops where LLMs validate and fix their own malformed JSON?",
      "Explain context window compression methods like LLMLingua to reduce token billing costs.",
      "How do you index and search source citations in RAG document citation flows?",
      "How do you handle streaming responses in frontend web apps using Server-Sent Events (SSE)?",
      "Explain how embeddings capture semantic context using multi-dimensional vector spaces.",
      "How do you structure parallel LLM queries using async Promise pools to minimize user latency?",
      "Explain how prompt template caching works on modern LLM API gateways.",
      "How do you audit AI agent decision-making paths using execution telemetry logs?",
      "Explain how database sharding impacts vector search indexing in global deployments.",
      "How do you resolve memory leaks in Node/Python background workers that parse massive embedding documents?",
      "Explain how dynamic temperature scales based on confidence scores in logical outputs.",
      "How do you securely configure API credentials for LLM endpoints inside serverless environments?",
      "Explain how system agent loops handle timeout limits in recursive tool-use loops.",
      "Finally, design a real-time conversational agent that handles context window limits without losing context."
    ],
    'ML Engineer': [
      "When do you prefer transformer-based architectures over traditional recurrent models?",
      "How do you handle vanishing or exploding gradients during training of deep neural networks?",
      "How do you detect and address dataset drift in production ML pipelines?",
      "Describe your approach to model quantization and pruning for edge device deployment.",
      "Explain backpropagation mathematics. How do derivative operations update neural layer weights?",
      "How do you address overfitting in deep models using L1/L2 regularization and dropout layers?",
      "Explain the math behind Adam optimizer compared to standard Stochastic Gradient Descent (SGD).",
      "How do you construct high-performance feature store pipelines using Feast or Redis?",
      "Explain the difference between data parallelism and model parallelism in distributed model training.",
      "How do you implement custom loss functions in PyTorch/TensorFlow to optimize target boundaries?",
      "Explain the mathematical differences between ReLU, GELU, and SwiGLU activation functions.",
      "How do you profile GPU utilization bottlenecks during model training using TensorBoard?",
      "Explain how model compilation frameworks (TensorRT, ONNX) optimize model graphs for target GPUs.",
      "How do you configure real-time feature aggregations (e.g. sliding window transactions) for ML predictions?",
      "Explain the mathematical concept of self-attention. How do Query, Key, and Value matrices interact?",
      "How do you manage model registries, versioning, and deploy models using MLflow or BentoML?",
      "How do you audit and correct training dataset imbalance using SMOTE or focal loss methods?",
      "Explain how ResNet connections resolve gradient degradation in extremely deep architectures.",
      "How do you construct data validation schemas to catch outliers before they trigger model inference?",
      "Explain how dynamic learning rate scheduling (cosine annealing) improves model convergence.",
      "How do you implement model pruning, and how does unstructured pruning differ from structured pruning?",
      "Explain the mathematical formulation of batch normalization and why it stabilizes training.",
      "How do you optimize hyperparameter optimization using Bayesian optimization vs random searches?",
      "Explain how convolutional neural networks (CNNs) capture spatial local patterns using kernel strides.",
      "How do you optimize GPU memory usage using mixed-precision training (FP16/BF16)?",
      "Explain the concept of cross-entropy loss and how it scales for multi-class classification.",
      "How do you build a real-time inference API that serves ML predictions under 10ms latency budgets?",
      "Explain how model checkpointing works, and how to recover training states after compute node crashes.",
      "How do you detect and resolve data leakage between training, validation, and test datasets?",
      "Explain how SHAP and LIME frameworks provide explainability for complex neural models.",
      "How do you implement feature normalization (MinMax vs Z-Score normalization) in data preparation?",
      "Explain how gradient clipping prevents gradient explosions in sequential LSTM networks.",
      "How do you configure cluster storage pipelines (S3, local SSD) to feed training data without starving GPUs?",
      "Explain the bias-variance tradeoff in machine learning algorithms.",
      "How do you monitor production models for prediction latency, throughput, and accuracy degradations?",
      "Explain how principal component analysis (PCA) reduces dataset dimensions while preserving variance.",
      "How do you design A/B testing frameworks to validate ML model updates against production baselines?",
      "Explain how weight initialization strategies (Xavier, He) prevent vanishing gradients at epoch start.",
      "How do you profile CPU-to-GPU data transfer latencies (PCIe bottlenecks) during training?",
      "Explain the difference between bagging and boosting ensemble learning techniques.",
      "How do you implement model profiling to optimize inference paths on target hardware edge nodes?",
      "Explain how contrastive loss functions optimize representation learning in Siamese networks.",
      "How do you implement automated model retraining triggers based on concept drift metrics?",
      "Explain the mathematical difference between L1 (Manhattan) and L2 (Euclidean) distance metrics.",
      "How do you write custom PyTorch Dataset loaders that optimize multi-threaded data loading?",
      "Explain how model caching layers reduce database load on real-time feature lookups.",
      "How do you resolve memory leaks in model inference runtimes under continuous load?",
      "Explain how learning rate warmup periods stabilize early model training phases.",
      "How do you secure ML endpoints against adversarial input injection attacks?",
      "Finally, design an automated ML pipeline that handles dataset ingestion, validation, training, and deployment."
    ],
    'AI/ML Engineer': [
      "How do you design feature store pipelines to serve features with sub-millisecond latency to online ML models?",
      "How do you monitor production ML models for concept drift and perform automated retraining?",
      "How do you evaluate the bias and fairness of a generative language model?",
      "Tell me about a time you had to debug a model performance degradation in production.",
      "Explain the differences between dense vector databases and relational databases for embedding lookups.",
      "How do vector databases index embeddings using Hierarchical Navigable Small World (HNSW) graphs?",
      "Explain how context window limitations affect prompt design in multi-turn AI interactions.",
      "How do you implement semantic search pagination and handle duplicate embedding matches?",
      "Explain model quantization (FP16 to INT8). How does it impact execution latency and model accuracy?",
      "How do you design LLM guardrail APIs to prevent hallucinations and filter restricted topics?",
      "Explain agentic workflow loops. How do you design tool-use prompts that execute shell/API commands?",
      "How do you construct knowledge graphs to augment dense vector embeddings in hybrid RAG systems?",
      "Explain Tokenizer mechanics (Byte-Pair Encoding). How do special tokens affect API prompts?",
      "How do you handle rate-limit throttling in LLM API services using queuing and parallel requests?",
      "How do you design system prompt architectures that enforce JSON output formats?",
      "Explain how temperature, top_p, and top_k settings modify LLM next-token probability distributions.",
      "How do you trace and evaluate prompt engineering quality using metrics like ROUGE, BLEU, or LLM-as-a-judge?",
      "How do you host and run open-source LLMs (like Llama-3) locally using vLLM or Ollama?",
      "Explain multi-modal LLM mechanics. How are image coordinates parsed and mapped alongside token embeddings?",
      "How do you implement dynamic context retrieval chunking using sentence-window methods?",
      "Explain context drift in LLM conversations, and how you manage conversational memory blocks.",
      "How do you design a secure execution sandbox for AI models that execute generated code?",
      "How does semantic search ranking benefit from cross-encoder re-ranking models?",
      "Explain semantic caching pipelines. How do you cache LLM outputs based on prompt similarities?",
      "How do you evaluate vector search latency bottlenecks using QPS and latency metrics?",
      "How do you debug prompt instructions when LLMs consistently fail to follow negative constraints?",
      "Explain the difference between model parameter weights, activations, and KV cache sizes.",
      "How do you handle large file processing in AI pipelines using streaming text segmentations?",
      "Explain how model prompt compilation frameworks (like DSPy) optimize prompt inputs automatically.",
      "How do you configure vector index parameters to optimize recall rates vs index construction times?",
      "Explain the differences between RAG vector databases: Pgvector vs pinecone vs ChromaDB.",
      "How do you implement local document parsing pipelines that extract table layouts for AI processing?",
      "Explain how system prompts isolate user inputs from model output instructions.",
      "How do you build a semantic routing gateway that routes user queries to specialized agents?",
      "How do you handle bias and toxicity filtering in open-source model completions?",
      "Explain how LLM model inference speeds are calculated using Time-to-First-Token (TTFT) metrics.",
      "How do you implement auto-correction loops where LLMs validate and fix their own malformed JSON?",
      "Explain context window compression methods like LLMLingua to reduce token billing costs.",
      "How do you index and search source citations in RAG document citation flows?",
      "How do you handle streaming responses in frontend web apps using Server-Sent Events (SSE)?",
      "Explain how embeddings capture semantic context using multi-dimensional vector spaces.",
      "How do you structure parallel LLM queries using async Promise pools to minimize user latency?",
      "Explain how prompt template caching works on modern LLM API gateways.",
      "How do you audit AI agent decision-making paths using execution telemetry logs?",
      "Explain how database sharding impacts vector search indexing in global deployments.",
      "How do you resolve memory leaks in Node/Python background workers that parse massive embedding documents?",
      "Explain how database connection pooling differs from HTTP connection reuse on reverse proxies.",
      "How do you troubleshoot storage class provisioning bottlenecks in Kubernetes volumes?",
      "Explain how Linux cgroups limit CPU shares and memory bounds for containerized workloads.",
      "Finally, design an automated ML pipeline that handles dataset ingestion, validation, training, and deployment."
    ],
    'Cybersecurity': [
      "How do you conduct threat modeling for a cloud-native microservices architecture using frameworks like STRIDE?",
      "Explain the difference between symmetric and asymmetric encryption, and how TLS uses both to establish secure connections.",
      "How do you protect API endpoints against SQL injection and insecure direct object references (IDOR)?",
      "Describe how you would respond to and mitigate an active security incident in your production environment.",
      "How do you implement secure microservices authentication using short-lived tokens and cryptographic signing?",
      "Explain zero-trust architectures and how you enforce identity verification at service boundaries.",
      "How do you implement secure network zoning and configure firewall security policies?",
      "Describe the difference between Static Application Security Testing (SAST) and Dynamic Testing (DAST).",
      "How do you secure OAuth2 authorization flows against authorization code intercept attacks?",
      "How do you implement database encryption at rest (TDE) and secure key rotation cycles?",
      "Explain how cross-site scripting (XSS) works, and how you sanitize input fields to prevent it.",
      "How do you defend server systems against distributed denial-of-service (DDoS) bandwidth saturation?",
      "What are CSRF tokens, and how does SameSite cookie configuration mitigate cross-site request forgery?",
      "How do you audit and configure Linux file system permissions to prevent local privilege escalations?",
      "Explain the cryptographic math behind RSA vs Elliptic Curve Cryptography (ECC) key exchanges.",
      "How do you secure CI/CD pipelines to prevent software supply chain injection attacks?",
      "Describe how to implement secure, sandboxed code compilation engines to prevent remote execution.",
      "How do you configure Web Application Firewalls (WAF) to detect and block SQLi and XSS scripts?",
      "Explain how secure multi-factor authentication (MFA) tokens are generated using TOTP algorithms.",
      "How do you conduct vulnerability scans on Docker container layers during image build workflows?",
      "Explain the difference between authorization validation and authentication checks in API routes.",
      "How do you mitigate brute force authentication attempts using rate limiting and IP locking?",
      "Describe how a Man-in-the-Middle (MITM) attack intercept TLS handshakes when certificate pinning is missing.",
      "How do you implement secure logging pipelines that scrub password fields and credit card details?",
      "Explain how secure boot sequences validate firmware signatures before loading the OS kernel.",
      "How do you design secure password hashing pipelines using Bcrypt, Argon2, or PBKDF2?",
      "Explain how cross-origin resource sharing (CORS) configurations protect users from unauthorized API requests.",
      "How do you identify and mitigate container escape vulnerabilities in Kubernetes cluster runtimes?",
      "Explain how DNS spoofing works, and how DNSSEC guarantees cryptographically authenticated records.",
      "How do you design incident response playbooks for ransomware containment and service restoration?",
      "Explain the security vulnerabilities associated with XML External Entity (XXE) parsers.",
      "How do you implement secure auditing protocols to trace user write operations inside production DBs?",
      "Explain how asymmetric key cryptosystems establish trust using Certificate Authorities (CA).",
      "How do you conduct automated dependency scanning to find known vulnerabilities in node modules?",
      "Explain how secure token storage (HttpOnly, Secure cookies) prevents Javascript token access.",
      "How do you configure AWS IAM policies to follow the principle of least privilege?",
      "Explain how a Buffer Overflow attack manipulates the instruction pointer to execute injected shellcode.",
      "How do you implement network isolation rules using Kubernetes NetworkPolicies?",
      "Explain how secure key exchanges like Diffie-Hellman establish shared secrets over insecure lines.",
      "How do you troubleshoot TLS certificate expiration alerts in automated domain setups?",
      "Explain how credential stuffing attacks operate, and how captcha systems reduce bot requests.",
      "How do you design resilient API rate limiting to prevent denial-of-service on authentication endpoints?",
      "Explain how database connection pooling differs from HTTP connection reuse on reverse proxies.",
      "How do you troubleshoot storage class provisioning bottlenecks in Kubernetes volumes?",
      "Explain how Linux cgroups limit CPU shares and memory bounds for containerized workloads.",
      "Explain the difference between mutable and immutable infrastructure paradigms.",
      "How do you secure Docker daemons and configure rootless container executions?",
      "How do you aggregate system telemetry metrics using OpenTelemetry standards?",
      "Explain how Linux cgroups limit CPU shares and memory bounds for containerized workloads.",
      "Finally, design a secure microservice authentication gateway that validates mTLS and OAuth2 tokens."
    ],
    'Cybersecurcity': [
      "How do you conduct threat modeling for a cloud-native microservices architecture using frameworks like STRIDE?",
      "Explain the difference between symmetric and asymmetric encryption, and how TLS uses both to establish secure connections.",
      "How do you protect API endpoints against SQL injection and insecure direct object references (IDOR)?",
      "Describe how you would respond to and mitigate an active security incident in your production environment.",
      "How do you implement secure microservices authentication using short-lived tokens and cryptographic signing?",
      "Explain zero-trust architectures and how you enforce identity verification at service boundaries.",
      "How do you implement secure network zoning and configure firewall security policies?",
      "Describe the difference between Static Application Security Testing (SAST) and Dynamic Testing (DAST).",
      "How do you secure OAuth2 authorization flows against authorization code intercept attacks?",
      "How do you implement database encryption at rest (TDE) and secure key rotation cycles?",
      "Explain how cross-site scripting (XSS) works, and how you sanitize input fields to prevent it.",
      "How do you defend server systems against distributed denial-of-service (DDoS) bandwidth saturation?",
      "What are CSRF tokens, and how does SameSite cookie configuration mitigate cross-site request forgery?",
      "How do you audit and configure Linux file system permissions to prevent local privilege escalations?",
      "Explain the cryptographic math behind RSA vs Elliptic Curve Cryptography (ECC) key exchanges.",
      "How do you secure CI/CD pipelines to prevent software supply chain injection attacks?",
      "Describe how to implement secure, sandboxed code compilation engines to prevent remote execution.",
      "How do you configure Web Application Firewalls (WAF) to detect and block SQLi and XSS scripts?",
      "Explain how secure multi-factor authentication (MFA) tokens are generated using TOTP algorithms.",
      "How do you conduct vulnerability scans on Docker container layers during image build workflows?",
      "Explain the difference between authorization validation and authentication checks in API routes.",
      "How do you mitigate brute force authentication attempts using rate limiting and IP locking?",
      "Describe how a Man-in-the-Middle (MITM) attack intercept TLS handshakes when certificate pinning is missing.",
      "How do you implement secure logging pipelines that scrub password fields and credit card details?",
      "Explain how secure boot sequences validate firmware signatures before loading the OS kernel.",
      "How do you design secure password hashing pipelines using Bcrypt, Argon2, or PBKDF2?",
      "Explain how cross-origin resource sharing (CORS) configurations protect users from unauthorized API requests.",
      "How do you identify and mitigate container escape vulnerabilities in Kubernetes cluster runtimes?",
      "Explain how DNS spoofing works, and how DNSSEC guarantees cryptographically authenticated records.",
      "How do you design incident response playbooks for ransomware containment and service restoration?",
      "Explain the security vulnerabilities associated with XML External Entity (XXE) parsers.",
      "How do you implement secure auditing protocols to trace user write operations inside production DBs?",
      "Explain how asymmetric key cryptosystems establish trust using Certificate Authorities (CA).",
      "How do you conduct automated dependency scanning to find known vulnerabilities in node modules?",
      "Explain how secure token storage (HttpOnly, Secure cookies) prevents Javascript token access.",
      "How do you configure AWS IAM policies to follow the principle of least privilege?",
      "Explain how a Buffer Overflow attack manipulates the instruction pointer to execute injected shellcode.",
      "How do you implement network isolation rules using Kubernetes NetworkPolicies?",
      "Explain how secure key exchanges like Diffie-Hellman establish shared secrets over insecure lines.",
      "How do you troubleshoot TLS certificate expiration alerts in automated domain setups?",
      "Explain how credential stuffing attacks operate, and how captcha systems reduce bot requests.",
      "How do you design resilient API rate limiting to prevent denial-of-service on authentication endpoints?",
      "Explain how database connection pooling differs from HTTP connection reuse on reverse proxies.",
      "How do you troubleshoot storage class provisioning bottlenecks in Kubernetes volumes?",
      "Explain how Linux cgroups limit CPU shares and memory bounds for containerized workloads.",
      "Explain the difference between mutable and immutable infrastructure paradigms.",
      "How do you secure Docker daemons and configure rootless container executions?",
      "How do you aggregate system telemetry metrics using OpenTelemetry standards?",
      "Explain how Linux cgroups limit CPU shares and memory bounds for containerized workloads.",
      "Finally, design a secure microservice authentication gateway that validates mTLS and OAuth2 tokens."
    ]
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  const startInterview = () => {
    setIsSessionActive(true);
    setChatLog([
      {
        sender: 'bot',
        text: `Aria (Google Technical Recruiter): Hello! I am Aria, and I will be conducting your technical screening today for the ${role} path. I will ask you ${interviewQuestions[role].length} questions. Let's begin!`
      },
      {
        sender: 'bot',
        text: interviewQuestions[role][0]
      }
    ]);
    setCurrentQuestionIndex(0);
    setInterviewFinished(false);
    setScoreFeedback(null);
    setUserInput('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Save user response
    const newUserLog = [
      ...chatLog,
      { sender: 'user', text: userInput }
    ];
    setChatLog(newUserLog);
    const savedInput = userInput;
    setUserInput('');

    // Advance question or finish
    const nextIdx = currentQuestionIndex + 1;
    const questionsList = interviewQuestions[role];

    // Compute contextual acknowledgement based on keyword matching
    const currentKeywords = (keywordMatrix[role] && keywordMatrix[role][currentQuestionIndex]) || [];
    const lowerAnswer = savedInput.toLowerCase();
    const matchedCount = currentKeywords.filter(word => lowerAnswer.includes(word)).length;

    let acknowledgement = "Got it. ";
    if (matchedCount >= 2) {
      acknowledgement = "Excellent explanation. ";
    } else if (matchedCount === 1) {
      acknowledgement = "Understood, good point. ";
    } else if (savedInput.split(/\s+/).length < 5) {
      acknowledgement = "Acknowledged. ";
    }

    setTimeout(() => {
      if (nextIdx < questionsList.length) {
        setChatLog(prev => [
          ...prev,
          { sender: 'bot', text: `${acknowledgement}${questionsList[nextIdx]}` }
        ]);
        setCurrentQuestionIndex(nextIdx);
      } else {
        // Complete interview
        setChatLog(prev => [
          ...prev,
          { sender: 'bot', text: `${acknowledgement}Thank you for your responses. I have compiled the grading matrices. Click "Compile Assessment & XP" to see your score!` }
        ]);
        setInterviewFinished(true);
      }
    }, 1000);
  };

  const evaluateInterview = async () => {
    // Generate evaluations based on user answers
    const userAnswers = chatLog.filter(log => log.sender === 'user').map(log => log.text);
    
    let totalScore = 0;
    let comments = [];
    const keywords = keywordMatrix[role] || [];

    for (let i = 0; i < userAnswers.length; i++) {
      const answer = userAnswers[i] || '';
      const lowerAnswer = answer.toLowerCase();

      // Check how many keywords were matched
      const matched = keywords.filter(word => lowerAnswer.includes(word));
      
      // Basic scoring for this answer
      let answerScore = 0;
      if (answer.trim().length > 0) {
        // Base score for writing something
        answerScore = 45;
        // Word count bonus
        const words = answer.trim().split(/\s+/).length;
        answerScore += Math.min(25, Math.floor(words / 2)); // up to +25 points for word count

        // Keyword matches bonus
        if (matched.length > 0) {
          answerScore += Math.min(30, matched.length * 10); // +10 per keyword, cap at +30
        }
      }

      answerScore = Math.min(100, answerScore);
      totalScore += answerScore;

      // Question specific feedback
      const questionNum = i + 1;
      if (matched.length >= 2) {
        comments.push(`Q${questionNum} Feedback: Strong answer alignment. Covered key concepts: ${matched.slice(0, 3).join(', ')}.`);
      } else if (answer.trim().length > 10) {
        comments.push(`Q${questionNum} Feedback: Answer received. Try adding more conceptual depth (e.g. ${keywords.slice(i % keywords.length, (i % keywords.length) + 2).join(', ')}).`);
      } else {
        comments.push(`Q${questionNum} Feedback: Answer was missing or too brief to grade.`);
      }
    }

    const averageScore = userAnswers.length > 0 ? Math.round(totalScore / userAnswers.length) : 0;

    setScoreFeedback({
      score: averageScore,
      comments: comments.slice(0, 15),
      rating: averageScore >= 85 ? 'Highly Recommended' : averageScore >= 70 ? 'Recommended with feedback' : 'Needs practice'
    });

    // Log Activity to Backend and Award XP
    try {
      await logActivity('quiz', 1);
    } catch (e) {
      console.log('Activity logging failed:', e.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header HUD */}
      <div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-wide">
          AI RECRUITER MOCK INTERVIEW
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
          SIMULATED VOICE-TEXT CHAT RECRUITER SCENARIO & REAL-TIME RESPONSE EVALUATION
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Setup Panel / Results */}
        <div>
          <div className="glassmorphism rounded-3xl p-8 border-white/10 box-glow-violet relative overflow-hidden h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={18} className="text-violet-400" />
                INTERVIEW SANDBOX
              </h3>

              <AnimatePresence mode="wait">
                {!isSessionActive && !scoreFeedback ? (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Initialize a simulated tech screening session. The AI agent will ask 50 role-relevant questions. Answer clearly; your responses are audited against communication criteria to grade your proficiency.
                    </p>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Target Discipline</label>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-300 focus:outline-none focus:border-violet-500/50 font-mono hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                          >
                            <span>{role}</span>
                            <span className="text-[10px] text-gray-500">&bull;&bull;&bull;</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-full min-w-[200px]">
                          <div className="space-y-1">
                            <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest pb-1 border-b border-white/5 mb-1.5">Select Skills Path</p>
                            {[
                              'AI Engineer',
                              'ML Engineer',
                              'AI/ML Engineer',
                              'Full Stack Developer',
                              'Frontend Developer',
                              'Backend Developer',
                              'Cybersecurcity',
                              'DevOps Engineer'
                            ].map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  setRole(skill);
                                  setIsPopoverOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all hover:bg-violet-600/30 hover:text-white cursor-pointer",
                                  role === skill 
                                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" 
                                    : "text-gray-400"
                                )}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <button
                      onClick={startInterview}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg box-glow-violet active:scale-[0.98] transition-all"
                    >
                      <Play size={14} /> Start Mock Interview
                    </button>
                  </motion.div>
                ) : scoreFeedback ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                      <Award size={32} />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">EVALUATION METRIC</h4>
                      <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest mt-0.5">{scoreFeedback.rating}</p>
                    </div>

                    <div className="py-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <span className="text-5xl font-extrabold text-glow-cyan text-emerald-400 font-mono">{scoreFeedback.score}%</span>
                    </div>

                    <div className="text-left space-y-2 max-h-48 overflow-y-auto p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <h5 className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Feedback Logs</h5>
                      {scoreFeedback.comments.map((c, i) => (
                        <p key={i} className="text-xs text-gray-300 leading-relaxed font-sans flex gap-2">
                          <span className="text-cyan-400 font-bold">&bull;</span>
                          {c}
                        </p>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setScoreFeedback(null);
                        setIsSessionActive(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-gray-300 font-bold text-xs rounded-xl transition-all"
                    >
                      <RefreshCw size={12} /> New Screening Session
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-violet-950/10 border border-violet-500/10 rounded-2xl flex gap-3 text-xs text-violet-300 leading-relaxed">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 animate-pulse" />
                      <span>Interview is active. Answer questions sequentially. Submit draft to unlock the evaluation logs.</span>
                    </div>

                    {interviewFinished ? (
                      <button
                        onClick={evaluateInterview}
                        className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm rounded-xl cursor-pointer shadow-md shadow-cyan-500/10 active:scale-[0.98] transition-all"
                      >
                        Compile Assessment & XP
                      </button>
                    ) : (
                      <div className="py-2.5 text-center bg-white/[0.01] border border-white/5 rounded-xl text-xs text-gray-500 font-mono">
                        QUESTION {currentQuestionIndex + 1} OF {interviewQuestions[role]?.length || 50}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-[9px] text-gray-500 text-center font-mono mt-6">ALIGNED WITH SENIOR SCREENING CRITERIA</p>
          </div>
        </div>

        {/* Right Side: Chat Window Interface */}
        <div className="lg:col-span-2">
          <div className="glassmorphism rounded-3xl border-white/10 box-glow-cyan flex flex-col h-[520px] overflow-hidden relative">
            
            {/* Chat Header Status */}
            <div className="h-16 border-b border-white/5 px-6 flex items-center gap-3 bg-white/[0.01]">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-white font-bold tracking-wider font-mono">RECRUITER FEED CHAT</span>
            </div>

            {/* Message feed log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatLog.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono uppercase tracking-widest animate-pulse">
                  System awaiting activation command...
                </div>
              ) : (
                chatLog.map((log, index) => {
                  const isBot = log.sender === 'bot';
                  const senderName = isBot ? 'Aria (Google Recruiter)' : (user?.username || 'You');
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} mb-2`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-mono text-gray-500">
                        <span className="font-semibold text-gray-400">{senderName}</span>
                        {isBot ? (
                          <span className="px-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded">AI AGENT</span>
                        ) : (
                          <span className="px-1.5 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 rounded">CANDIDATE</span>
                        )}
                      </div>
                      
                      <div className={`flex gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                        {isBot && (
                          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-violet-400" />
                          </div>
                        )}
                        
                        <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isBot 
                            ? 'bg-white/[0.02] border border-white/5 text-gray-200' 
                            : 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 border border-violet-500/25 text-white'
                        }`}>
                          {log.text}
                        </div>

                        {!isBot && (
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
                            <User size={14} className="text-cyan-400" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input action footer */}
            <form onSubmit={handleSendMessage} className="h-20 border-t border-white/5 px-6 flex items-center gap-3 bg-white/[0.005]">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!isSessionActive || interviewFinished}
                placeholder={
                  !isSessionActive 
                    ? 'Activate interview session first...' 
                    : interviewFinished 
                    ? 'Screening complete. Compile score.' 
                    : 'Type your technical answer here...'
                }
                className="flex-1 bg-white/[0.02] border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isSessionActive || interviewFinished || !userInput.trim()}
                className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/5 text-black disabled:text-gray-500 rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-[0.98]"
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
