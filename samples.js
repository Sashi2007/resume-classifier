/**
 * Preloaded Realistic Samples for AI Resume Classifier
 * Demonstrating High Match, Moderate Match, and Low Match scenarios.
 */
const SAMPLES = {
  highMatch: {
    name: "Senior Full-Stack & Cloud Engineer (High Match)",
    jobRole: "Senior Full-Stack Cloud Engineer",
    experienceLevel: "Senior (5+ years)",
    resume: `ALEXANDER WRIGHT
San Francisco, CA • alex.wright@email.com • (555) 234-5678 • linkedin.com/in/alexwright • github.com/alexwright

PROFESSIONAL SUMMARY
Results-driven Senior Full-Stack Engineer with 6 years of experience designing, deploying, and maintaining high-throughput web applications and microservices on AWS. Proven track record reducing API latency by 42% and scaling distributed systems to 1.5M daily active users.

TECHNICAL SKILLS
• Programming Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5, CSS3
• Frameworks & Libraries: React, Node.js, Next.js, Express, FastAPI, TailwindCSS, Redux Toolkit, Jest
• Cloud & DevOps: AWS (EC2, S3, Lambda, ECS, RDS, CloudFront), Docker, Kubernetes, Terraform, GitHub Actions, CI/CD
• Databases: PostgreSQL, MongoDB, Redis, DynamoDB
• Architecture & Tools: RESTful APIs, GraphQL, Microservices, Git, Kafka, WebSockets

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudScale Technologies | Austin, TX
July 2021 – Present (3 years, 2 months)
• Architected and migrated monolithic customer portal to microservices using Node.js, TypeScript, and AWS ECS, improving application availability to 99.98%.
• Designed real-time event-driven notification engine leveraging Apache Kafka and Redis, processing 15,000 events/sec with sub-50ms latency.
• Built automated CI/CD deployment pipelines using GitHub Actions and Terraform, decreasing release cycle times from 2 days to 30 minutes.
• Mentored 5 junior and mid-level developers in React best practices, test-driven development (TDD), and clean code standards.

Full-Stack Software Engineer | Apex Digital Solutions | Denver, CO
August 2018 – June 2021 (2 years, 10 months)
• Developed responsive SaaS analytics dashboard using React, TypeScript, and PostgreSQL serving 120,000+ enterprise users.
• Optimized PostgreSQL query execution plans and implemented Redis caching layer, decreasing p95 database response time by 44%.
• Authored 350+ unit and end-to-end integration tests using Jest and Cypress, achieving 88% overall code coverage.
• Implemented OAuth2 and JWT-based role authentication protocols ensuring SOC2 compliance.

KEY PROJECTS
Distributed Task Orchestrator (Personal Project | 2023)
• Technologies: Go, Docker, AWS SQS, Redis, PostgreSQL
• Problem Solved: High-load distributed worker pool to process long-running asynchronous data transformation jobs.
• Evidence: Open-source repository with 450+ GitHub stars; benchmarked to handle 25,000 concurrent queue tasks with zero data drop.

Enterprise Telemetry Dashboard (CloudScale Technologies | 2022)
• Technologies: React, Next.js, TypeScript, GraphQL, TailwindCSS
• Problem Solved: Replaced slow legacy reporting interface with a unified real-time telemetry visualizer.
• Evidence: Cut load time from 4.8s to 850ms; adopted by all 14 internal engineering squads.

EDUCATION
Bachelor of Science in Computer Science
University of Colorado Boulder | Graduated: May 2018

CERTIFICATIONS & ACHIEVEMENTS
• AWS Certified Solutions Architect – Associate (Issued: 2022, Valid thru 2025)
• Certified Kubernetes Application Developer (CKAD) (2023)
• 1st Place Winner – Regional FinTech Hackathon 2020`,

    jobDescription: `Job Title: Senior Full-Stack Cloud Engineer
Company: Apex Cloud Systems
Experience Required: 5+ years
Location: Remote / San Francisco, CA

About the Role:
We are seeking a talented Senior Full-Stack Cloud Engineer to design, build, and scale our core cloud platform. You will spearhead architectural decisions, build mission-critical full-stack features, and lead cloud infrastructure deployments.

Required Technical Skills:
• 5+ years of software engineering experience in full-stack web development.
• Strong proficiency in TypeScript or JavaScript, Node.js, and modern React.
• Hands-on experience with cloud platforms, specifically AWS (ECS, Lambda, RDS, S3).
• Solid experience with relational databases (PostgreSQL preferred) and caching solutions (Redis).
• Demonstrated experience designing and deploying Docker containers and CI/CD pipelines (GitHub Actions or GitLab CI).
• Experience designing scalable RESTful APIs and microservices.

Preferred Skills:
• Experience with Infrastructure as Code (Terraform).
• Familiarity with message brokers such as Apache Kafka or RabbitMQ.
• AWS Certification (Solutions Architect or Developer).
• Experience with Kubernetes.

Education & Experience Requirements:
• Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.
• 5+ years of relevant industry experience in production SaaS environments.

Role Responsibilities:
• Collaborate with cross-functional teams to define, design, and ship new architectural capabilities.
• Lead migrations toward event-driven microservice architectures.
• Maintain high code quality, security compliance, and comprehensive automated test coverage.`
  },

  moderateMatch: {
    name: "Python Backend Developer to ML Engineer (Moderate Match - Gaps)",
    jobRole: "Senior Machine Learning Engineer",
    experienceLevel: "Senior (4+ years)",
    resume: `PRIYA SHARMA
Seattle, WA • priya.sharma@email.com • (555) 345-6789 • github.com/priyasharma

SUMMARY
Backend Software Engineer with 4 years of experience building scalable backend APIs, web crawlers, and data pipelines in Python and Django. Experienced in SQL database optimization, Docker containerization, and basic PyTorch model experimentation.

TECHNICAL SKILLS
• Languages: Python, SQL, C++, Bash
• Web Frameworks: Django, Flask, FastAPI
• Data & Databases: PostgreSQL, SQLite, Pandas, NumPy, Scikit-Learn
• Tools & Platforms: Docker, Git, Linux, AWS S3, Redis, Celery

WORK EXPERIENCE
Backend Software Developer | DataStream Inc. | Seattle, WA
March 2021 – Present (3 years, 6 months)
• Designed and maintained 15+ REST APIs using FastAPI and Django REST framework handling 800,000 daily requests.
• Built distributed data scraping pipeline using Celery, Redis, and Beautiful Soup to ingest financial reports from 200+ public sources.
• Optimized PostgreSQL schemas and indexed complex queries, improving query speeds by 35%.
• Integrated third-party analytics services and handled data sanitization using Pandas and NumPy.

Software Engineering Intern | TechNova Labs | Portland, OR
June 2020 – December 2020 (6 months)
• Developed automated test suites in pytest, increasing backend coverage by 20%.
• Containerized internal development environments using Docker and Docker Compose.

PROJECTS
Customer Churn Prediction Service (2023)
• Technologies: Python, Scikit-Learn, Pandas, Flask
• Problem Solved: Trained a Random Forest classifier on customer transaction data to predict account churn with 81% precision.
• Evidence: Packaged model into a lightweight Flask API endpoint with unit test coverage.

Automated Stock Sentiment Scraper (2022)
• Technologies: Python, BeautifulSoup, SQLite
• Problem Solved: Aggregated financial forum discussions and analyzed keyword frequencies.

EDUCATION
Bachelor of Science in Information Technology
University of Washington | Graduated: June 2020

CERTIFICATIONS
• Python Professional Developer Certificate (Coursera / University of Michigan)`,

    jobDescription: `Job Title: Senior Machine Learning & MLOps Engineer
Company: Cognition AI Labs
Experience Required: 4+ years
Location: Seattle, WA

Role Overview:
We are looking for an experienced Senior Machine Learning Engineer to take computer vision and large language models (LLMs) from research prototypes into scalable production environments.

Required Technical Skills:
• 4+ years of industry experience deploying Machine Learning systems in production.
• Deep proficiency in Python and modern ML frameworks: PyTorch or TensorFlow.
• Experience building and maintaining MLOps pipelines using Kubeflow, MLflow, or TFX.
• Experience with distributed model training and GPU optimization (CUDA, Triton, or DeepSpeed).
• Experience with Large Language Model (LLM) fine-tuning, RAG architectures, and vector databases (Pinecone, Weaviate, Milvus).
• Production experience with Kubernetes and Docker in AWS or GCP environments.

Preferred Skills:
• Experience with Hugging Face Transformers and vLLM serving.
• Contributions to open-source machine learning libraries.
• Published research in top-tier conferences (NeurIPS, ICML, CVPR).

Education Requirements:
• Master's or Ph.D. in Computer Science, Machine Learning, Artificial Intelligence, or related quantitative field (or equivalent strong track record).

Responsibilities:
• Architect, train, and deploy production ML models at enterprise scale.
• Build automated continuous training and model monitoring pipelines.
• Optimize inference latency and GPU cluster utilization.`
  },

  lowMatch: {
    name: "Marketing & Operations Specialist to Frontend Dev (Low Match)",
    jobRole: "Lead Frontend Engineer",
    experienceLevel: "Lead / Staff (6+ years)",
    resume: `JORDAN CARTER
Chicago, IL • jordan.carter@email.com • (555) 789-0123

PROFESSIONAL SUMMARY
Dynamic Digital Marketing and Operations Coordinator with 4 years of experience orchestrating digital campaigns, email marketing automation, and content management systems. Basic familiarity with HTML email templates and WordPress styling.

SKILLS & TOOLS
• Marketing Tools: HubSpot, Google Analytics 4, Mailchimp, Hootsuite, SEMrush
• Content Management: WordPress, Webflow, Shopify
• Digital Skills: HTML/CSS (Basic), Copywriting, Social Media Strategy, A/B Testing
• Productivity: Asana, Slack, Microsoft Office Suite, Notion

WORK EXPERIENCE
Digital Marketing Coordinator | BrightPath Media | Chicago, IL
January 2021 – Present (3 years, 8 months)
• Managed multi-channel digital marketing campaigns generating $450K in inbound pipeline.
• Customized WordPress landing pages and updated marketing blog articles using HTML and CSS.
• Analyzed Google Analytics conversion funnels and optimized conversion rate by 18%.
• Directed weekly email newsletters sent to 45,000 subscribers using Mailchimp.

Marketing Assistant | Vanguard Logistics | Chicago, IL
June 2019 – December 2020 (1 year, 6 months)
• Coordinated collateral production for 6 trade shows across the Midwest.
• Managed social media calendar and customer inquiry responses.

EDUCATION
Bachelor of Arts in Communications and Marketing
Loyola University Chicago | Graduated: May 2019

CERTIFICATIONS
• HubSpot Inbound Marketing Certification (2021)
• Google Analytics Individual Qualification (2022)`,

    jobDescription: `Job Title: Lead Frontend Engineer
Company: FinTech Vanguard
Experience: 6+ years
Location: Chicago, IL / Remote

Job Summary:
We are seeking an exceptional Lead Frontend Engineer to drive the architectural evolution of our financial trading interfaces. You will be responsible for client-side state architecture, sub-millisecond rendering performance, and web security.

Required Technical Skills:
• 6+ years of specialized web frontend engineering experience.
• Mastery of modern JavaScript (ESNext), TypeScript, and React.
• Deep understanding of WebSockets, canvas/WebGL data visualization, and Web Workers.
• Experience architecting complex state management (Zustand, Redux Saga, or MobX).
• Mastery of automated testing (Jest, React Testing Library, Playwright).
• Solid understanding of browser security standards (CSP, CORS, XSS, CSRF).

Preferred Skills:
• Experience with WebAssembly (Wasm) or high-frequency trading UI systems.
• Experience managing design systems with Storybook and micro-frontends.

Education Requirements:
• Bachelor's or Master's degree in Computer Science or Software Engineering.

Responsibilities:
• Architect real-time trade execution dashboards with sub-100ms render budgets.
• Lead and mentor a squad of 8 frontend engineers.
• Enforce strict code quality, accessibility (WCAG 2.1 AA), and zero-defect deployments.`
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLES };
}
