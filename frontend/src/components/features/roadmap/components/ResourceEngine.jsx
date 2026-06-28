import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Award, BookOpen, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'courses', label: 'Courses', title: 'Top Video Courses' },
  { id: 'books', label: 'Books', title: 'Recommended Textbooks' },
  { id: 'repos', label: 'Repos', title: 'Featured Open Source Repos' },
  { id: 'certs', label: 'Certifications', title: 'Industry Valued Certifications' }
];

const TRACK_RESOURCES = {
  'web-dev': {
    'courses': [
      { title: "Sigma Web Development Boot Camp", provider: "CodeWithHarry", type: "Playlists", rate: "4.8", cost: "Free", duration: "80 hrs", difficulty: "Beginner", link: "https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w", desc: "Complete HTML, CSS, JS and server-side deployment guide.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" },
      { title: "Chai aur React Backend Masterclass", provider: "Chai aur Code", type: "Playlists", rate: "4.9", cost: "Free", duration: "50 hrs", difficulty: "Intermediate", link: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW", desc: "Advanced engineering design patterns, routing & JWT authentications.", thumbnail: "linear-gradient(135deg, #a855f7 0%, #db2777 100%)" },
      { title: "Namaste React Series", provider: "Namaste Dev / Akshay Saini", type: "Tutorials", rate: "4.9", cost: "Paid", duration: "40 hrs", difficulty: "Intermediate", link: "https://namastedev.com/", desc: "Deep conceptual React core components, reconciliation, Fiber architecture, and custom hooks.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" },
      { title: "The Complete Web Development Bootcamp", provider: "Angela Yu", type: "Bootcamp", rate: "4.8", cost: "Paid", duration: "65 hrs", difficulty: "Beginner", link: "https://www.udemy.com/course/the-complete-web-development-bootcamp/", desc: "Comprehensive step-by-step fullstack developer introduction including Node and SQL database architectures.", thumbnail: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" }
    ],
    'books': [
      { title: "Clean Architecture", author: "Robert C. Martin", type: "Architectures", rate: "4.7", cost: "Paid", duration: "15 hrs", difficulty: "Intermediate", link: "https://www.pearson.com/en-us/subject-catalog/p/clean-architecture-a-craftsmans-guide-to-software-structure-and-design/P200000000378/9780134494166", desc: "Covers SOLID components, dependency rules, and database decoupling interfaces.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
      { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", type: "System Design", rate: "5.0", cost: "Paid", duration: "25 hrs", difficulty: "Advanced", link: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/", desc: "Detailed explanations of replication, partition, storage engines, transactions, and distributed systems consensus.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)" },
      { title: "Eloquent JavaScript", author: "Marijn Haverbeke", type: "JS Deep Dive", rate: "4.8", cost: "Free", duration: "20 hrs", difficulty: "Intermediate", link: "https://eloquentjavascript.net/", desc: "Covers functional programming, asynchronous scopes, web security, and core browser environment APIs.", thumbnail: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
      { title: "You Don't Know JS Yet", author: "Kyle Simpson", type: "JS Internals", rate: "4.9", cost: "Free", duration: "30 hrs", difficulty: "Advanced", link: "https://github.com/getify/You-Dont-Know-JS", desc: "Essential series explaining scopes, closures, objects, prototype delegation, and type coercion mechanics.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" }
    ],
    'repos': [
      { title: "developer-roadmap", author: "kamranahmedse", type: "Sitemap Hub", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/kamranahmedse/developer-roadmap", desc: "Interactive developer career paths and technology ecosystem maps.", thumbnail: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
      { title: "public-apis", author: "public-apis", type: "API Directory", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/public-apis/public-apis", desc: "Collective registry of free public APIs for development integration tests.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
      { title: "front-end-interview-handbook", author: "yangshun", type: "Interview Prep", rate: "4.9", cost: "Free", duration: "30 hrs", difficulty: "All Levels", link: "https://github.com/yangshun/front-end-interview-handbook", desc: "Detailed interview question answers, CSS templates, performance specs, and quiz tips.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" },
      { title: "html5-boilerplate", author: "h5bp", type: "Templates", rate: "4.7", cost: "Free", duration: "Ongoing", difficulty: "Beginner", link: "https://github.com/h5bp/html5-boilerplate", desc: "Professional front-end template for fast, robust, and responsive web projects.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
    ],
    'certs': [
      { title: "Docker Certified Associate (DCA)", provider: "Docker / Mirantis", type: "DevOps", rate: "4.8", cost: "$195", duration: "45 hrs", difficulty: "Intermediate", link: "https://www.mirantis.com/training/docker-certification-associate-exam/", desc: "Tests container build instructions, volume storage hooks, and Swarm clusters.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" },
      { title: "Meta Front-End Developer Certificate", provider: "Meta / Coursera", type: "Frontend", rate: "4.8", cost: "Subscription", duration: "80 hrs", difficulty: "Beginner", link: "https://www.coursera.org/professional-certificates/meta-front-end-developer", desc: "Includes HTML, CSS, Javascript, React basics, UX design templates, and Capstones.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)" },
      { title: "freeCodeCamp Responsive Design", provider: "freeCodeCamp Portal", type: "Web Design", rate: "4.9", cost: "Free", duration: "300 hrs", difficulty: "Beginner", link: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", desc: "HTML5/CSS3 projects verifying layout flexibility, typography metrics, and grids.", thumbnail: "linear-gradient(135deg, #10b981 0%, #047857 100%)" }
    ]
  },
  'dsa': {
    'courses': [
      { title: "take U forward DSA Sheet A-Z", provider: "take U forward / Striver", type: "Playlists", rate: "4.9", cost: "Free", duration: "120 hrs", difficulty: "All Levels", link: "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", desc: "Structured conceptual guides to competitive programming topics.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)" },
      { title: "Mastering DSA in Java/C++", provider: "Abdul Bari", type: "Tutorials", rate: "4.9", cost: "Paid", duration: "60 hrs", difficulty: "Beginner-to-Adv", link: "https://www.udemy.com/course/datastructurescncpp/", desc: "Deep analytical dive into algorithms analysis and memory pointers.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
      { title: "Algorithms, Part I & II", provider: "Princeton / Coursera", type: "Specialization", rate: "4.9", cost: "Free", duration: "50 hrs", difficulty: "Advanced", link: "https://www.coursera.org/learn/algorithms-part1", desc: "Core algorithms and data structures with emphasis on applications and scientific performance analysis.", thumbnail: "linear-gradient(135deg, #a855f7 0%, #db2777 100%)" },
      { title: "Placement Preparation Series", provider: "Love Babbar", type: "Playlists", rate: "4.8", cost: "Free", duration: "90 hrs", difficulty: "All Levels", link: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTrytFrKBlokbWYbDYvKAJg2", desc: "Popular algorithms lectures covering basic recursions to complex graph topologies.", thumbnail: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" }
    ],
    'books': [
      { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", type: "FAANG Preparation", rate: "4.8", cost: "Paid", duration: "40 hrs", difficulty: "Intermediate", link: "https://www.careercup.com/book", desc: "189 programming questions and solutions spanning trees, dynamic programming, and heaps.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
      { title: "Grokking Algorithms", author: "Aditya Bhargava", type: "Visual Book", rate: "4.8", cost: "Paid", duration: "10 hrs", difficulty: "Beginner", link: "https://www.manning.com/books/grokking-algorithms", desc: "An illustrated, user-friendly guide to sorting, searching, and graph pathways.", thumbnail: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
      { title: "Introduction to Algorithms (CLRS)", author: "Thomas H. Cormen et al.", type: "Algorithms", rate: "4.9", cost: "Paid", duration: "80 hrs", difficulty: "Advanced", link: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", desc: "The definitive mathematical treatment of algorithms, complexity analyses, and runtime proofs.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" },
      { title: "Elements of Programming Interviews", author: "Adnan Aziz et al.", type: "Interview Prep", rate: "4.8", cost: "Paid", duration: "30 hrs", difficulty: "Intermediate", link: "https://elementsofprogramminginterviews.com/", desc: "Systematic algorithm templates and code solutions for Java, C++, and Python languages.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)" }
    ],
    'repos': [
      { title: "javascript-algorithms", author: "trekhleb", type: "Code Library", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/trekhleb/javascript-algorithms", desc: "Algorithms and data structures implemented in JavaScript with explanations.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
      { title: "coding-interview-university", author: "jwasham", type: "Study Plan", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/jwasham/coding-interview-university", desc: "A complete study plan to become a software engineer at target companies.", thumbnail: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
      { title: "system-design-primer", author: "donnemartin", type: "System Design", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "Advanced", link: "https://github.com/donnemartin/system-design-primer", desc: "Comprehensive guides to scaling servers, key-value stores, and microservice caches.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" },
      { title: "TheAlgorithms", author: "TheAlgorithms", type: "Code Directory", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/TheAlgorithms", desc: "Open source resource for algorithmic implementations in multiple programming languages.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" }
    ],
    'certs': [
      { title: "LeetCode Dynamic badges", provider: "LeetCode Portal", type: "Challenges", rate: "4.7", cost: "Free", duration: "Flexible", difficulty: "Advanced", link: "https://leetcode.com/problemset/all/", desc: "Earn verified badges by completing monthly algorithms challenges.", thumbnail: "linear-gradient(135deg, #a855f7 0%, #db2777 100%)" },
      { title: "HackerRank Problem Solving Badge", provider: "HackerRank", type: "Problem Solving", rate: "4.8", cost: "Free", duration: "Flexible", difficulty: "Intermediate", link: "https://www.hackerrank.com/domains/algorithms", desc: "Earn certificates verifying basic, intermediate, and advanced algorithm problem solving.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)" },
      { title: "Codeforces Specialist Rating", provider: "Codeforces Platform", type: "Competitive", rate: "4.9", cost: "Free", duration: "Flexible", difficulty: "Advanced", link: "https://codeforces.com/", desc: "Earn competitive ranks by solving runtime-constrained programming problems.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
    ]
  },
  'devops': {
    'courses': [
      { title: "DevOps Bootcamp", provider: "TechWorld with Nana", type: "Bootcamp", rate: "4.9", cost: "Paid", duration: "80 hrs", difficulty: "Beginner-to-Adv", link: "https://www.techworldwithnana.com/devops-bootcamp", desc: "Covers Docker, Kubernetes, CI/CD pipelines, Ansible, and Terraform.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #10b981 100%)" },
      { title: "Docker & Kubernetes Guide", provider: "Maximilian Schwarzmüller", type: "Tutorials", rate: "4.8", cost: "Paid", duration: "45 hrs", difficulty: "Intermediate", link: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", desc: "Practical hands-on setup of microservice containers and scaling Kubernetes clusters.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)" },
      { title: "Ansible for DevOps Course", provider: "Jeff Geerling", type: "Playlists", rate: "4.9", cost: "Free", duration: "25 hrs", difficulty: "Intermediate", link: "https://www.youtube.com/playlist?list=PL2_OBreMn7FqZkv3t1II5MKyaeIMj3ny1", desc: "Infrastructure automation, server setups, and playbook declarations.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" }
    ],
    'books': [
      { title: "The Phoenix Project", author: "Gene Kim et al.", type: "Novel", rate: "4.8", cost: "Paid", duration: "18 hrs", difficulty: "Beginner", link: "https://itrevolution.com/book/the-phoenix-project/", desc: "A novel about IT, DevOps, and helping your business win.", thumbnail: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
      { title: "Site Reliability Engineering", author: "Google Team / O'Reilly", type: "Manual", rate: "4.9", cost: "Free", duration: "30 hrs", difficulty: "Advanced", link: "https://sre.google/sre-book/table-of-contents/", desc: "Google's operational guidelines for service health, SLO/SLA metrics, and alert setups.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" },
      { title: "Terraform Up & Running", author: "Yevgeniy Brikman", type: "IaC Manual", rate: "4.8", cost: "Paid", duration: "16 hrs", difficulty: "Intermediate", link: "https://www.terraformupandrunning.com/", desc: "Practical configurations for deploying infrastructure as code across cloud targets.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" },
      { title: "The DevOps Handbook", author: "Gene Kim et al.", type: "Handbook", rate: "4.8", cost: "Paid", duration: "22 hrs", difficulty: "Beginner", link: "https://itrevolution.com/book/the-devops-handbook/", desc: "Increasing agility, accelerating feedback loops, and ensuring deployment safety.", thumbnail: "linear-gradient(135deg, #10b981 0%, #047857 100%)" }
    ],
    'repos': [
      { title: "devops-exercises", author: "bregman-arie", type: "Exercises", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "Intermediate", link: "https://github.com/bregman-arie/devops-exercises", desc: "Linux, Jenkins, Git, Docker, Kubernetes, Ansible, and system queries.", thumbnail: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
      { title: "awesome-scalability", author: "dzharii", type: "Index Hub", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "Advanced", link: "https://github.com/dzharii/awesome-scalability", desc: "A curated list of architectural patterns scaling large-scale websites.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
      { title: "kubernetes-the-hard-way", author: "kelseyhightower", type: "Manual", rate: "4.9", cost: "Free", duration: "12 hrs", difficulty: "Advanced", link: "https://github.com/kelseyhightower/kubernetes-the-hard-way", desc: "Bootstrap Kubernetes the hard way on GCP/local without scripts.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" }
    ],
    'certs': [
      { title: "AWS Solutions Architect", provider: "Amazon Web Services", type: "Cloud", rate: "4.9", cost: "$150", duration: "80 hrs", difficulty: "Advanced", link: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", desc: "Validates distributed cloud design, IAM policies, and VPC layouts.", thumbnail: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
      { title: "Certified Kubernetes Administrator", provider: "CNCF / Linux Foundation", type: "Kubernetes", rate: "4.9", cost: "$395", duration: "70 hrs", difficulty: "Advanced", link: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", desc: "Validates cluster setup, network paths, storage nodes, and resource scheduling.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
      { title: "Terraform Associate Certification", provider: "HashiCorp Portal", type: "IaC Cert", rate: "4.8", cost: "$70", duration: "30 hrs", difficulty: "Intermediate", link: "https://www.hashicorp.com/certification/terraform-associate", desc: "Tests IaC variables, resources lifecycle management, and modules integration.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
    ]
  },
  'ai-ml': {
    'courses': [
      { title: "Machine Learning Specialization", provider: "Andrew Ng / Stanford", type: "Specialization", rate: "4.9", cost: "Free", duration: "60 hrs", difficulty: "Beginner", link: "https://www.coursera.org/specializations/machine-learning-introduction", desc: "Supervised and unsupervised learning, neural nets, and recommendation filters.", thumbnail: "linear-gradient(135deg, #a855f7 0%, #db2777 100%)" },
      { title: "Deep Learning Specialization", provider: "DeepLearning.AI", type: "Specialization", rate: "4.9", cost: "Paid", duration: "80 hrs", difficulty: "Advanced", link: "https://www.coursera.org/specializations/deep-learning", desc: "Covers CNNs, RNNs, LSTMs, Transformers, and optimizing hyperparameter structures.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" },
      { title: "Practical Deep Learning for Coders", provider: "Fast.ai", type: "Tutorials", rate: "4.8", cost: "Free", duration: "40 hrs", difficulty: "Beginner-to-Adv", link: "https://course.fast.ai/", desc: "Top-down approach to training models, NLP processing, image classifications, and dataset setups.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)" }
    ],
    'books': [
      { title: "Hands-On Machine Learning", author: "Aurélien Géron", type: "Handbook", rate: "4.8", cost: "Paid", duration: "35 hrs", difficulty: "Intermediate", link: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", desc: "Scikit-Learn, Keras, and TensorFlow models setup guide.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
      { title: "Deep Learning Book", author: "Ian Goodfellow et al.", type: "Theoretical", rate: "4.9", cost: "Free", duration: "50 hrs", difficulty: "Advanced", link: "https://www.deeplearningbook.org/", desc: "Mathematical background (linear algebra, probability) and deep neural architectures.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" },
      { title: "Pattern Recognition and Machine Learning", author: "Christopher Bishop", type: "Math Science", rate: "4.8", cost: "Paid", duration: "45 hrs", difficulty: "Advanced", link: "https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf", desc: "Detailed probability-based machine learning methods, Bayesian estimation, and regression models.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" }
    ],
    'repos': [
      { title: "transformers", author: "huggingface", type: "NLP Library", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "Advanced", link: "https://github.com/huggingface/transformers", desc: "State-of-the-art machine learning models for PyTorch and TensorFlow.", thumbnail: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
      { title: "scikit-learn", author: "scikit-learn", type: "ML Library", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "Intermediate", link: "https://github.com/scikit-learn/scikit-learn", desc: "Simple and efficient tools for predictive data analysis built on NumPy, SciPy.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
      { title: "pytorch", author: "pytorch", type: "Framework", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "Advanced", link: "https://github.com/pytorch/pytorch", desc: "Tensors and Dynamic neural networks in Python with strong GPU acceleration.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" }
    ],
    'certs': [
      { title: "Google Cloud ML Engineer", provider: "Google Cloud", type: "Cloud AI", rate: "4.7", cost: "$200", duration: "50 hrs", difficulty: "Advanced", link: "https://cloud.google.com/learn/certification/machine-learning-engineer", desc: "Validates model creation, training, tuning, and monitoring on GCP.", thumbnail: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
      { title: "TensorFlow Developer Certificate", provider: "Google / TensorFlow", type: "ML Cert", rate: "4.8", cost: "$100", duration: "30 hrs", difficulty: "Intermediate", link: "https://www.tensorflow.org/certificate", desc: "Verifies basic regression, image recognition models, and NLP setups using TensorFlow.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)" },
      { title: "AWS Machine Learning Speciality", provider: "Amazon Web Services", type: "Cloud AI", rate: "4.9", cost: "$300", duration: "60 hrs", difficulty: "Advanced", link: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", desc: "Checks data engineering pipelines, AI model setups, and VPC hosting security.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
    ]
  },
  'mobile': {
    'courses': [
      { title: "Android Jetpack Compose Guide", provider: "Philipp Lackner", type: "Playlists", rate: "4.8", cost: "Free", duration: "30 hrs", difficulty: "All Levels", link: "https://www.youtube.com/playlist?list=PLQkwcJG4YTCSpJ2HpBGGDWyWYsJJ-yZdM", desc: "Modern Android layouts, states, modifiers, and architectural scopes.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" },
      { title: "iOS & Swift Bootcamp", provider: "Angela Yu", type: "Bootcamp", rate: "4.9", cost: "Paid", duration: "60 hrs", difficulty: "Beginner", link: "https://www.udemy.com/course/ios-13-app-development-bootcamp/", desc: "Complete Swift programming and SwiftUI/UIKit layout development from scratch.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
      { title: "Flutter Complete Guide", provider: "Maximilian Schwarzmüller", type: "Tutorials", rate: "4.8", cost: "Paid", duration: "45 hrs", difficulty: "All Levels", link: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", desc: "Cross-platform mobile engineering with Dart, widgets, state management, and maps.", thumbnail: "linear-gradient(135deg, #10b981 0%, #064e3b 100%)" }
    ],
    'books': [
      { title: "Kotlin in Action", author: "Dmitry Jemerov", type: "Technical", rate: "4.7", cost: "Paid", duration: "16 hrs", difficulty: "Beginner-to-Int", link: "https://www.manning.com/books/kotlin-in-action", desc: "Syntax, null safety, OOP paradigms, and co-routine setups.", thumbnail: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
      { title: "Swift Programming: Big Nerd Ranch Guide", author: "Mikey Ward", type: "Manual", rate: "4.8", cost: "Paid", duration: "18 hrs", difficulty: "Beginner", link: "https://www.bignerdranch.com/books/swift-programming/", desc: "Detailed guide to Swift fundamentals, standard library collections, and memory management.", thumbnail: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)" },
      { title: "Clean Mobile Architecture", author: "S. L. McMichael", type: "Architecture", rate: "4.7", cost: "Paid", duration: "20 hrs", difficulty: "Advanced", link: "https://www.apress.com/gp/book/9781484260388", desc: "Detailed architectures on VIPER, MVVM, database repository boundaries, and modular test suits.", thumbnail: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
    ],
    'repos': [
      { title: "awesome-android", author: "snowdream", type: "Index Hub", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "Beginner", link: "https://github.com/snowdream/awesome-android", desc: "A curated list of awesome Android libraries and resources.", thumbnail: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
      { title: "awesome-ios", author: "vsouza", type: "Index Hub", rate: "4.8", cost: "Free", duration: "Ongoing", difficulty: "All Levels", link: "https://github.com/vsouza/awesome-ios", desc: "Curated collection of awesome iOS libraries, frameworks, tools, and plugins.", thumbnail: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
      { title: "awesome-flutter", author: "Solido", type: "Index Hub", rate: "4.9", cost: "Free", duration: "Ongoing", difficulty: "Beginner", link: "https://github.com/Solido/awesome-flutter", desc: "Curated collection of dynamic resources, libraries, articles, and apps for Flutter.", thumbnail: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" }
    ],
    'certs': [
      { title: "Associate Android Developer", provider: "Google", type: "Android Cert", rate: "4.9", cost: "$149", duration: "40 hrs", difficulty: "Intermediate", link: "https://developers.google.com/certification/associate-android-developer", desc: "Google-certified exam testing layout design, system bounds, and SQLite room logic.", thumbnail: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" },
      { title: "Meta iOS Developer Certificate", provider: "Meta / Coursera", type: "iOS Cert", rate: "4.8", cost: "Subscription", duration: "75 hrs", difficulty: "Beginner", link: "https://www.coursera.org/professional-certificates/meta-ios-developer", desc: "Tests Swift syntax, mobile layouts, core database storage, and publishing on App Store.", thumbnail: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
      { title: "Meta Android Developer Certificate", provider: "Meta / Coursera", type: "Android Cert", rate: "4.8", cost: "Subscription", duration: "75 hrs", difficulty: "Beginner", link: "https://www.coursera.org/professional-certificates/meta-android-developer", desc: "Tests Kotlin, Jetpack Compose layouts, database storage, and app publishing on Play Store.", thumbnail: "linear-gradient(135deg, #10b981 0%, #047857 100%)" }
    ]
  }
}

export default function ResourceEngine({ trackId = 'web-dev' }) {
  const [activeCategory, setActiveCategory] = useState('courses');
  const scrollContainerRef = useRef(null);

  const getMappedTrackId = (id) => {
    if (id === 'web-dev' || id === 'dsa' || id === 'devops' || id === 'ai-ml' || id === 'mobile') return id;
    return 'web-dev';
  };

  const currentTrackId = getMappedTrackId(trackId);
  const trackResources = TRACK_RESOURCES[currentTrackId] || TRACK_RESOURCES['web-dev'];
  const activeResources = trackResources[activeCategory] || [];

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 space-y-6 flex flex-col flex-1 relative overflow-hidden group/resources">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 z-10">
        <div>
          <h4 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Award size={18} className="text-emerald-400" />
            Netflix-Style Resource Hub
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Browse through courses, textbooks, source code repositories, and certification paths.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none self-start md:self-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeCategory === cat.id
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-transparent text-slate-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center z-10">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-[-12px] z-20 w-10 h-10 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-all opacity-0 group-hover/resources:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrolling Resource Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-none py-4 px-2 w-full snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {activeResources.map((item, idx) => (
            <motion.a
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-80 bg-slate-950/80 border border-white/5 hover:border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl transition-all relative snap-start"
            >
              {/* Thumbnail Container */}
              <div 
                className="h-32 w-full flex flex-col justify-between p-4 relative"
                style={{ background: item.thumbnail || 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}
              >
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-slate-950/20 mix-blend-overlay" />

                <div className="flex justify-between items-start z-10">
                  <span className="text-[10px] bg-slate-950/60 border border-white/10 px-2 py-0.5 rounded-full text-slate-300 font-medium">
                    {item.type}
                  </span>
                  
                  <span className="text-xs bg-slate-950/60 border border-white/10 px-2 py-0.5 rounded-full text-amber-400 font-bold flex items-center gap-0.5">
                    <Star size={11} className="fill-current" /> {item.rate}
                  </span>
                </div>

                <div className="z-10">
                  <p className="text-[10px] text-white/80 font-mono uppercase tracking-wider">
                    {item.author || item.provider}
                  </p>
                  <h5 className="text-sm font-bold text-white leading-snug mt-0.5 drop-shadow-md truncate">
                    {item.title}
                  </h5>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-4 space-y-4">
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-sans min-h-[54px]">
                  {item.desc}
                </p>

                {/* Metadata Row */}
                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>Duration: {item.duration}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">{item.difficulty}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[9px] uppercase">
                    Cost: {item.cost}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
          {activeResources.length === 0 && (
            <div className="w-full text-center py-16 text-slate-500 text-xs font-mono">
              No recommended {activeCategory} documented for this track.
            </div>
          )}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-[-12px] z-20 w-10 h-10 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-all opacity-0 group-hover/resources:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
}
