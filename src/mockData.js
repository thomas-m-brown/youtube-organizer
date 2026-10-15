// Realistic mock dataset of bulk playlists and video items for demo mode and portfolio showcase

const escapeXml = (unsafe) => {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

const makeThumb = (title, bg1, bg2, duration) => {
  const trimmed = title.length > 28 ? title.substring(0, 26) + '...' : title;
  const encodedTitle = escapeXml(trimmed);
  const encodedDuration = escapeXml(duration || '10:00');
  const gid = 'g_' + Math.random().toString(36).substring(2, 8);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <defs>
      <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#${gid})"/>
    <circle cx="160" cy="85" r="26" fill="rgba(0,0,0,0.6)"/>
    <polygon points="152,73 174,85 152,97" fill="#ffffff"/>
    <rect x="0" y="136" width="320" height="44" fill="rgba(10,10,10,0.85)"/>
    <text x="12" y="163" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#ffffff">${encodedTitle}</text>
    <rect x="264" y="146" width="48" height="24" rx="4" fill="#000000"/>
    <text x="272" y="162" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">${encodedDuration}</text>
  </svg>`;
  if (typeof window !== 'undefined' && typeof window.btoa !== 'undefined') {
    return 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg)));
  }
  if (typeof Buffer !== 'undefined') {
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const MOCK_PLAYLISTS = [
  {
    id: "pl_cs_algo",
    title: "Computer Science & Algorithms",
    description: "Core algorithms, data structures, Big-O analysis, and graph theory.",
    videos: 42,
    thumbnail: makeThumb("Algorithms & Big-O", "#1e3c72", "#2a5298", "42:15"),
    ignore: false,
    publishedAt: "2026-02-10T14:30:00Z",
    videoItems: [
      { title: "MIT 6.006: Introduction to Algorithms - Lecture 1", thumbnail: makeThumb("MIT 6.006 Lecture 1", "#0f2027", "#203a43", "48:12") },
      { title: "Dijkstra's & A* Shortest Path Algorithms Visualized", thumbnail: makeThumb("Pathfinding Visualizer", "#141e30", "#243b55", "18:45") },
      { title: "Dynamic Programming: Memoization and Tabulation", thumbnail: makeThumb("Dynamic Programming", "#2c3e50", "#3498db", "32:20") },
      { title: "B-Trees and Indexing in Database Engines", thumbnail: makeThumb("B-Tree Internals", "#1f4037", "#99f2c8", "24:10") },
      { title: "Graph Traversal: BFS vs DFS in Practice", thumbnail: makeThumb("Graph Traversal", "#000428", "#004e92", "15:30") },
      { title: "Cache Locality and Memory Hierarchy in C", thumbnail: makeThumb("Memory Hierarchy", "#373b44", "#4286f4", "27:50") }
    ]
  },
  {
    id: "pl_ai_arch",
    title: "AI & Neural Networks Architecture",
    description: "Transformer mechanics, backpropagation, and quantization fundamentals.",
    videos: 38,
    thumbnail: makeThumb("Neural Architecture", "#4b1248", "#f0c27b", "38:40"),
    ignore: false,
    publishedAt: "2026-03-15T09:15:00Z",
    videoItems: [
      { title: "Attention Is All You Need: Transformer Paper Walkthrough", thumbnail: makeThumb("Attention Mechanics", "#3a1c71", "#d76d77", "41:10") },
      { title: "Backpropagation from Scratch in Pure Python", thumbnail: makeThumb("Backprop Scratch", "#134e5e", "#71b280", "29:35") },
      { title: "Quantization Explained: GGUF, AWQ, and BitsAndBytes", thumbnail: makeThumb("Quantization Guide", "#200122", "#6f0000", "22:15") },
      { title: "vLLM: PagedAttention and High-Throughput Serving", thumbnail: makeThumb("vLLM Deep Dive", "#0b8793", "#360033", "34:50") },
      { title: "Fine-Tuning LoRA Adapters on Apple Silicon MLX", thumbnail: makeThumb("Apple Silicon MLX", "#1a2a6c", "#b21f1f", "19:40") }
    ]
  },
  {
    id: "pl_hermes",
    title: "Hermes Agent & Local AI Systems",
    description: "Self-hosted agents, tool-calling pipelines, and autonomous workflows.",
    videos: 19,
    thumbnail: makeThumb("Hermes Agent Workflows", "#000428", "#004e92", "19:10"),
    ignore: false,
    publishedAt: "2026-04-02T18:20:00Z",
    videoItems: [
      { title: "Hermes Agent 2.0: Multi-Step Autonomous Reasoning", thumbnail: makeThumb("Hermes 2.0 Overview", "#114357", "#f29492", "26:30") },
      { title: "Tool Calling & Function Execution via Functionary", thumbnail: makeThumb("Tool Calling Pipeline", "#16222f", "#3a6073", "21:15") },
      { title: "Context Window Guard: Sliding Compression Trajectories", thumbnail: makeThumb("Context Guard", "#1e130c", "#9a8478", "16:45") }
    ]
  },
  {
    id: "pl_web_dev",
    title: "Websites & React Full-Stack",
    description: "React 19, Vite, responsive UI architecture, and modern JavaScript.",
    videos: 27,
    thumbnail: makeThumb("React 19 & Vite", "#0f2027", "#2c5364", "27:00"),
    ignore: false,
    publishedAt: "2026-04-20T11:00:00Z",
    videoItems: [
      { title: "React 19 Server Components and Actions Crash Course", thumbnail: makeThumb("React 19 Actions", "#232526", "#414345", "35:10") },
      { title: "Building High-Performance Desktop Apps with Electron", thumbnail: makeThumb("Electron Desktop", "#1f1c2c", "#928dab", "28:40") },
      { title: "State Management & Optimistic Updates in 2026", thumbnail: makeThumb("Optimistic State", "#2c3e50", "#fd746c", "20:25") }
    ]
  },
  {
    id: "pl_sys_prog",
    title: "Technology & Systems Programming",
    description: "Memory safety, operating systems concepts, and low-level engineering.",
    videos: 15,
    thumbnail: makeThumb("Systems Programming", "#232526", "#414345", "15:20"),
    ignore: false,
    publishedAt: "2026-05-01T16:40:00Z",
    videoItems: [
      { title: "Operating System Architecture: Virtual Memory & Page Tables", thumbnail: makeThumb("Virtual Memory", "#0f2027", "#203a43", "37:50") },
      { title: "Linux Syscalls and Assembly Diagnostics with strace", thumbnail: makeThumb("strace & Syscalls", "#141e30", "#243b55", "19:10") }
    ]
  },
  {
    id: "pl_house_work",
    title: "House work & Electrical Wiring",
    description: "Residential electrical panels, 3-way switches, and code compliance.",
    videos: 31,
    thumbnail: makeThumb("Residential Electrical", "#ff4e50", "#f9d423", "31:00"),
    ignore: false,
    publishedAt: "2026-05-12T13:10:00Z",
    videoItems: [
      { title: "200A Electrical Service Panel Upgrade & Balancing", thumbnail: makeThumb("200A Service Panel", "#d31027", "#ea384d", "44:20") },
      { title: "Wiring 3-Way and 4-Way Switches Diagram & Build", thumbnail: makeThumb("3-Way Switch Wiring", "#603813", "#b29f94", "23:45") },
      { title: "PEX-A Expansion Plumbing: Complete Manifold Setup", thumbnail: makeThumb("PEX-A Plumbing", "#1e3c72", "#2a5298", "30:15") }
    ]
  },
  {
    id: "pl_home_ideas",
    title: "Home Ideas & CAD Design",
    description: "CAD modeling, structural framing, blueprints, and home renovation.",
    videos: 18,
    thumbnail: makeThumb("CAD & Home Framing", "#3a6073", "#3a7bd5", "18:30"),
    ignore: false,
    publishedAt: "2026-05-28T08:50:00Z",
    videoItems: [
      { title: "SolidWorks & AutoCAD 2D/3D Floor Plan Modeling", thumbnail: makeThumb("AutoCAD 3D Plans", "#141e30", "#243b55", "33:15") },
      { title: "Non-Load Bearing Partition Wall Framing Guide", thumbnail: makeThumb("Wall Framing Guide", "#4b1248", "#f0c27b", "17:40") }
    ]
  },
  {
    id: "pl_study_math",
    title: "Study & College Math",
    description: "Multivariable calculus, linear algebra, vector fields, and proofs.",
    videos: 26,
    thumbnail: makeThumb("Calculus 3 & Linear Alg", "#11998e", "#38ef7d", "26:45"),
    ignore: false,
    publishedAt: "2026-06-04T10:20:00Z",
    videoItems: [
      { title: "Calculus 3: Gradient Vectors & Directional Derivatives", thumbnail: makeThumb("Gradient Vectors", "#0f2027", "#2c5364", "28:10") },
      { title: "Eigenvalues and Eigenvectors: Visual Geometric Intuition", thumbnail: makeThumb("Eigenvectors Visual", "#1f4037", "#99f2c8", "21:30") },
      { title: "Second-Order Linear Homogeneous Differential Equations", thumbnail: makeThumb("Differential Equations", "#000428", "#004e92", "34:25") }
    ]
  },
  {
    id: "pl_physics",
    title: "Science & University Physics",
    description: "Classical mechanics, thermodynamics, and electromagnetism.",
    videos: 20,
    thumbnail: makeThumb("University Physics", "#2c3e50", "#3498db", "20:15"),
    ignore: false,
    publishedAt: "2026-06-18T15:00:00Z",
    videoItems: [
      { title: "Physics 1: Rotational Dynamics and Moment of Inertia", thumbnail: makeThumb("Rotational Dynamics", "#373b44", "#4286f4", "29:50") },
      { title: "Work-Energy Theorem and Conservative Forces", thumbnail: makeThumb("Work-Energy Theorem", "#141e30", "#243b55", "22:40") }
    ]
  },
  {
    id: "pl_mental",
    title: "Mental & Systems Thinking",
    description: "Quality control philosophies, failure-mode analysis, and cognitive models.",
    videos: 17,
    thumbnail: makeThumb("Systems Thinking", "#614385", "#516395", "17:35"),
    ignore: false,
    publishedAt: "2026-07-01T12:00:00Z",
    videoItems: [
      { title: "Failure Modes & Effects Analysis (FMEA) in Engineering", thumbnail: makeThumb("FMEA in Engineering", "#200122", "#6f0000", "25:10") },
      { title: "Root Cause Analysis: The 5 Whys & Ishikawa Diagrams", thumbnail: makeThumb("5 Whys Root Cause", "#0f2027", "#203a43", "18:45") }
    ]
  },
  {
    id: "pl_grind",
    title: "Grind & Focus Routines",
    description: "Deep work sessions, engineering study habits, and productivity.",
    videos: 14,
    thumbnail: makeThumb("Deep Work & Focus", "#ff8008", "#ffc837", "14:10"),
    ignore: false,
    publishedAt: "2026-07-15T07:30:00Z",
    videoItems: [
      { title: "Engineering Study Protocol: Active Recall & Spaced Repetition", thumbnail: makeThumb("Active Recall Habits", "#114357", "#f29492", "20:40") },
      { title: "Cal Newport: Building Unbreakable Deep Work Blocks", thumbnail: makeThumb("Deep Work Blocks", "#16222f", "#3a6073", "16:20") }
    ]
  },
  {
    id: "pl_fitness",
    title: "Fitness & Health",
    description: "Strength training mechanics, recovery protocols, and biomechanics.",
    videos: 24,
    thumbnail: makeThumb("Strength Biomechanics", "#8e2de2", "#4a00e0", "24:50"),
    ignore: false,
    publishedAt: "2026-07-28T17:15:00Z",
    videoItems: [
      { title: "Squat and Deadlift Biomechanics: Bar Path Optimization", thumbnail: makeThumb("Bar Path Biomechanics", "#232526", "#414345", "26:15") },
      { title: "Hypertrophy Science: Volume, Frequency, and RPE", thumbnail: makeThumb("Hypertrophy Science", "#1f1c2c", "#928dab", "22:30") }
    ]
  },
  {
    id: "pl_fishing",
    title: "Fishing & Outdoor Skills",
    description: "Bass fishing tackle, kayak rigging, and water reading techniques.",
    videos: 16,
    thumbnail: makeThumb("Bass Fishing Tactics", "#134e5e", "#71b280", "16:40"),
    ignore: false,
    publishedAt: "2026-08-05T14:40:00Z",
    videoItems: [
      { title: "Locating Fall Bass: Drop-offs, Points, and Structure", thumbnail: makeThumb("Fall Bass Tactics", "#1f4037", "#99f2c8", "21:10") },
      { title: "Baitcaster Setup: Eliminating Backlashes Permanently", thumbnail: makeThumb("Baitcaster Setup", "#0f2027", "#2c5364", "14:55") }
    ]
  },
  {
    id: "pl_cs_gaming",
    title: "CS & Tactical Gaming",
    description: "Counter-Strike utility line-ups, crosshair placement, and demos.",
    videos: 22,
    thumbnail: makeThumb("CS2 Utility & Strategy", "#f12711", "#f5af19", "22:00"),
    ignore: false,
    publishedAt: "2026-08-14T20:10:00Z",
    videoItems: [
      { title: "CS2 Mirage Essential Smokes and Flashes (64/128 Tick)", thumbnail: makeThumb("Mirage Smokes CS2", "#2c3e50", "#fd746c", "18:20") },
      { title: "Pro Demo Review: Crosshair Placement & Angle Isolation", thumbnail: makeThumb("Pro Demo Review", "#141e30", "#243b55", "25:40") }
    ]
  },
  {
    id: "pl_protected_vinyl",
    title: "Rare Vinyl & Live Concerts",
    description: "Analog master pressings and rare live bootleg concerts.",
    videos: 54,
    thumbnail: makeThumb("Rare Vinyl Archives", "#434343", "#000000", "54:00"),
    ignore: true, // PROTECTED SAFE ZONE
    publishedAt: "2026-08-20T19:00:00Z",
    videoItems: [
      { title: "Pink Floyd - Live at Pompeii (Original 1972 Mix HD)", thumbnail: makeThumb("Pink Floyd Pompeii", "#1e130c", "#9a8478", "62:10") },
      { title: "Led Zeppelin - Royal Albert Hall 1970 4K Remaster", thumbnail: makeThumb("Led Zeppelin Live", "#200122", "#6f0000", "55:30") },
      { title: "Miles Davis - Kind of Blue (Original Mono Master Session)", thumbnail: makeThumb("Miles Davis Mono", "#0f2027", "#203a43", "45:00") }
    ]
  },
  {
    id: "pl_protected_music",
    title: "Liked Tracks & Rare Audio",
    description: "Protected collection of irreplaceable tracks and rare recordings.",
    videos: 128,
    thumbnail: makeThumb("Liked Tracks Vault", "#1a2a6c", "#b21f1f", "128:00"),
    ignore: true, // PROTECTED SAFE ZONE
    publishedAt: "2026-08-25T22:30:00Z",
    videoItems: [
      { title: "Dire Straits - Sultans of Swing (Alchemy Live 1983)", thumbnail: makeThumb("Sultans of Swing", "#114357", "#f29492", "11:40") },
      { title: "Stevie Ray Vaughan - Live at the El Mocambo 1983", thumbnail: makeThumb("SRV El Mocambo", "#16222f", "#3a6073", "58:20") }
    ]
  }
];

export const MOCK_BACKUP = {
  timestamp: "10/14/2026, 3:45:12 PM",
  createdPlaylists: [
    { id: "pl_master_tech", title: "Tech & Programming 💻" },
    { id: "pl_master_diy", title: "DIY & Home Construction 🔨" },
    { id: "pl_master_learn", title: "Learning & Education 📚" },
    { id: "pl_master_mindset", title: "Mindset & Philosophy 🧠" },
    { id: "pl_master_hobbies", title: "Hobbies & Gaming 🎣" }
  ],
  deletedPlaylists: ["pl_cs_algo", "pl_ai_arch", "pl_hermes", "pl_house_work", "pl_home_ideas"],
  restorationData: [
    { playlistId: "pl_cs_algo", title: "Computer Science & Algorithms", videoIds: ["v1","v2","v3","v4","v5","v6","v7","v8"] },
    { playlistId: "pl_ai_arch", title: "AI & Neural Networks Architecture", videoIds: ["v9","v10","v11","v12","v13"] },
    { playlistId: "pl_hermes", title: "Hermes Agent & Local AI Systems", videoIds: ["v14","v15","v16","v17"] },
    { playlistId: "pl_house_work", title: "House work & Electrical Wiring", videoIds: ["v18","v19","v20","v21","v22"] },
    { playlistId: "pl_home_ideas", title: "Home Ideas & CAD Design", videoIds: ["v23","v24","v25"] }
  ]
};
