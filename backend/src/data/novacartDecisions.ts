import { ArchitectureDecision } from '../models/decision';

export const novacartDecisions: ArchitectureDecision[] = [
    {
        id: "AD-001",
        title: "PostgreSQL for Transactional Order Data",
        status: "Accepted",
        date: "2024-01-15",
        context: "NovaCart's early platform needed a reliable database for customer orders, payments metadata, inventory transactions, order status, and transactional relationships.",
        problem: "Need reliable datastore ensuring order consistency without dropping transactions or facing partial writes.",
        alternatives: [
            {
                name: "MySQL",
                advantages: ["Mature", "Wide community"],
                disadvantages: ["Less rigorous JSON support natively at the time"],
                rejectionReason: "Team had more experience with PostgreSQL performance tuning and advanced indexing."
            },
            {
                name: "MongoDB",
                advantages: ["Schema flexibility", "Rapid iterations"],
                disadvantages: ["Lack of strict ACID compliance at scale for relational bounds", "Denormalization risk for orders"],
                rejectionReason: "Order workflows required strict ACID transactional guarantees and complex relationship mapping."
            }
        ],
        decision: "Adopt PostgreSQL",
        rationale: [
            "Strong relational consistency and transactional guarantees were important for order and inventory workflows."
        ],
        tradeoffs: [
            {
                category: "Data Integrity",
                benefit: "ACID transactions with relational constraints",
                cost: "Rigid data modeling with schema migrations needed"
            },
            {
                category: "Scaling",
                benefit: "Mature SQL ecosystem",
                cost: "Horizontal scaling requires additional planning compared to NoSQL"
            }
        ],
        implementation: "Provisioned AWS RDS PostgreSQL multi-AZ instances for production environments.",
        outcome: "PostgreSQL became the primary transactional datastore.",
        lesson: "Use a relational database when business workflows depend heavily on transactional integrity and relationships.",
        futureGuidance: "Do not replace PostgreSQL simply because a NoSQL database is popular. Re-evaluate only if workload characteristics or scalability requirements materially change.",
        technologies: ["PostgreSQL", "AWS RDS"],
        relatedDecisions: [
            {
                targetDecisionId: "AD-002",
                relationship: "followed_by",
                explanation: "To relieve read loads from PostgreSQL, a cache layer was evaluated."
            }
        ]
    },
    {
        id: "AD-002",
        title: "Redis for Application Caching",
        status: "Accepted",
        date: "2024-03-10",
        context: "As NovaCart traffic increased, frequently requested product/catalog data caused repeated database reads.",
        problem: "PostgreSQL database was hitting CPU capacity during traffic spikes solely from heavy catalog read queries.",
        alternatives: [
            {
                name: "Database-only reads",
                advantages: ["No extra infrastructure necessary"],
                disadvantages: ["Database overload", "High latency for end user"],
                rejectionReason: "Unacceptable performance during spikes."
            },
            {
                name: "In-process application cache",
                advantages: ["Extremely low latency", "No network overhead"],
                disadvantages: ["Inconsistent cache state between scaled containers", "Memory bloat per service"],
                rejectionReason: "Applications were being scaled up; local cache caused cache miss storms and inconsistencies globally."
            }
        ],
        decision: "Adopt Redis instance for distributed shared caching",
        rationale: [
            "Redis provided a shared low-latency cache across application instances."
        ],
        tradeoffs: [
            {
                category: "Performance",
                benefit: "Lower database load and fast reads via a shared in-memory layer",
                cost: "Risk of stale data and cache invalidation complexity"
            },
            {
                category: "Operations",
                benefit: "Shared distributed cache for all application layers",
                cost: "Additional infrastructure burden to monitor and provision"
            }
        ],
        implementation: "Provisioned AWS ElastiCache for Redis caching catalog responses.",
        outcome: "Redis was introduced for frequently accessed, non-critical data.",
        lesson: "Caching should reduce expensive repeated work without becoming the source of truth.",
        futureGuidance: "Never make Redis the authoritative store for transactional business data.",
        technologies: ["Redis", "AWS ElastiCache"],
        relatedDecisions: [
            {
                targetDecisionId: "AD-004",
                relationship: "enabled",
                explanation: "Offloading state from App to Redis enabled easier containerization later."
            }
        ]
    },
    {
        id: "AD-003",
        title: "Amazon S3 for Product Images and Static Assets",
        status: "Accepted",
        date: "2024-05-02",
        context: "NovaCart initially stored product images on application servers.",
        problem: "Storage growth required massive EBS volumes, caused deployment complexity, utilized unnecessary application-server disk space, and blocked CDN optimization.",
        alternatives: [
            {
                name: "Application-server filesystem",
                advantages: ["Simple to implement for MVP"],
                disadvantages: ["Stateful servers prevent auto-scaling", "Asset serving blocks app compute threads"],
                rejectionReason: "Precluded modern auto-scaling groups and consumed compute cost for storage."
            },
            {
                name: "Database BLOB storage",
                advantages: ["Consolidated backups", "ACID guarantees for attachments"],
                disadvantages: ["Expensive relational storage", "Terrible streaming capability"],
                rejectionReason: "Would massively bloat PostgreSQL size unnecessarily."
            }
        ],
        decision: "Migrate all images and media assets to Amazon S3",
        rationale: [
            "S3 separated object storage from application compute."
        ],
        tradeoffs: [
            {
                category: "Scalability",
                benefit: "Durable object storage with independent scaling and easier app deployment",
                cost: "Object lifecycle management required and added latency on image write"
            },
            {
                category: "Integration",
                benefit: "Direct integration with CDN environments",
                cost: "Additional AWS service dependency and access-control configuration"
            }
        ],
        implementation: "Modified backend to upload assets directly to S3 via pre-signed URLs.",
        outcome: "Product images and static assets were moved to S3.",
        lesson: "Separate object storage from application compute when assets are large or independently scalable.",
        futureGuidance: "Application servers should not become the long-term source of truth for user-uploaded objects.",
        technologies: ["Amazon S3", "AWS"],
        relatedDecisions: [
            {
                targetDecisionId: "AD-005",
                relationship: "followed_by",
                explanation: "S3 enabled seamless integration with CloudFront for edge content distribution."
            }
        ]
    },
    {
        id: "AD-004",
        title: "Migration from EC2 to Kubernetes/EKS",
        status: "Accepted",
        date: "2024-08-20",
        context: "NovaCart's application had grown from a small deployment into multiple backend services. Managing scaling manually became tedious.",
        problem: "The team faced manual deployments, inconsistent environments, scaling complexity, and service-management overhead.",
        alternatives: [
            {
                name: "Continue managing EC2 manually",
                advantages: ["No migration effort", "Familiarity"],
                disadvantages: ["Slow deployments", "Maintenance nightmare during outages"],
                rejectionReason: "Does not scale with team velocity or traffic spikes."
            },
            {
                name: "EC2 with Docker Native/ECS",
                advantages: ["Docker standardization without heavy Kubernetes overhead"],
                disadvantages: ["Vendor lock-in", "Less industry flexibility for specific open-source mesh integrations"],
                rejectionReason: "Team wanted Kubernetes ecosystem primitives for advanced orchestration."
            }
        ],
        decision: "Adopt Kubernetes on EKS",
        rationale: [
            "Kubernetes provided standardized container orchestration, service discovery, scaling, and deployment primitives."
        ],
        tradeoffs: [
            {
                category: "Capabilities",
                benefit: "Declarative deployments, auto-scaling, and self-healing orchestration",
                cost: "Added operational complexity and Kubernetes learning curve"
            },
            {
                category: "Operations",
                benefit: "Standardized service management",
                cost: "Additional AWS infrastructure needed and steep observability requirements"
            }
        ],
        implementation: "Provisioned an Amazon EKS cluster with managed Node Groups.",
        outcome: "NovaCart migrated its containerized workloads to Amazon EKS.",
        lesson: "Kubernetes becomes valuable when operational complexity and service count justify the platform overhead.",
        futureGuidance: "Do not introduce Kubernetes solely because it is popular. Evaluate operational complexity, team maturity, workload count, and scaling requirements.",
        technologies: ["Kubernetes", "Amazon EKS", "Docker"],
        relatedDecisions: [
            {
                targetDecisionId: "AD-006",
                relationship: "enabled",
                explanation: "EKS deployment naturally supported spinning up async worker pods."
            },
            {
                targetDecisionId: "AD-007",
                relationship: "enabled",
                explanation: "EKS standard deployment specs permitted seamless integration with GitHub Actions deployments."
            },
            {
                targetDecisionId: "AD-008",
                relationship: "followed_by",
                explanation: "Observability upgrades were mandated due to EKS microservice sprawling."
            }
        ]
    },
    {
        id: "AD-005",
        title: "CloudFront for Global Content Delivery",
        status: "Accepted",
        date: "2024-10-15",
        context: "NovaCart had customers geographically distributed across multiple regions. Static assets and product images were repeatedly fetched from origin S3 infrastructure.",
        problem: "Users far from origin region experienced high image load latency, degrading browsing UX.",
        alternatives: [
            {
                name: "Direct origin access",
                advantages: ["Simple, cost mainly rests on S3 bandwidth"],
                disadvantages: ["High international latency", "Bandwidth costs pile up"],
                rejectionReason: "Performance hit was deemed unacceptable globally."
            },
            {
                name: "Regional Caching Nodes",
                advantages: ["More control over servers"],
                disadvantages: ["High management overhead", "No edge proximity"],
                rejectionReason: "We do not wish to manage global HTTP cache clusters manually."
            }
        ],
        decision: "Adopt CloudFront CDN",
        rationale: [
            "CloudFront could cache content closer to users and significantly reduce origin load."
        ],
        tradeoffs: [
            {
                category: "Performance",
                benefit: "Substantially lower latency via edge caching; reduced origin traffic bandwidth limits",
                cost: "Cache invalidation delays and strict TTL management"
            },
            {
                category: "Architecture",
                benefit: "Seamlessly bolts onto S3",
                cost: "CDN specific routing configurations and DNS tweaks required"
            }
        ],
        implementation: "Configured CloudFront distribution pointing to application ALBs and S3 Buckets.",
        outcome: "CloudFront was introduced for globally distributed static content.",
        lesson: "Use edge caching when users are geographically distributed and content can safely be cached.",
        futureGuidance: "Do not cache data that requires strict per-request freshness unless the caching strategy explicitly supports it.",
        technologies: ["Amazon CloudFront", "CDN"],
        relatedDecisions: []
    },
    {
        id: "AD-006",
        title: "Asynchronous Order Processing",
        status: "Accepted",
        date: "2025-01-10",
        context: "Some order operations became slow because downstream tasks such as email notifications, inventory synchronization, and analytics events did not need to block the customer request.",
        problem: "Customer clicks 'Buy' and waits multiple seconds while 8 third-party APIs process synchronously, causing timeouts.",
        alternatives: [
            {
                name: "Synchronous processing",
                advantages: ["Simple failure model", "No added infrastructure"],
                disadvantages: ["Poor latency", "Any 3rd-party outage breaks checkout entirely"],
                rejectionReason: "Unacceptable customer experience constraints."
            },
            {
                name: "Background worker threads",
                advantages: ["No external message broker needed"],
                disadvantages: ["Data loss if instance is terminated before thread finishes", "Hard to scale workers independently"],
                rejectionReason: "Kubernetes pod scale-down could terminate pending tasks."
            }
        ],
        decision: "Adopt Message-Based Asynchronous Processing",
        rationale: [
            "Asynchronous processing allowed customer-facing requests to complete without waiting for non-critical downstream work."
        ],
        tradeoffs: [
            {
                category: "Resilience",
                benefit: "Lower request latency, better workload isolation, and independent worker scaling",
                cost: "Forces architecture toward eventual consistency"
            },
            {
                category: "Complexity",
                benefit: "Decoupled logic",
                cost: "Required building explicit retry handling, dead-letter queues, and duplicate-event handling"
            }
        ],
        implementation: "Delegated non-critical checkout hooks to message buses consumed by background workers.",
        outcome: "Non-critical downstream order tasks were moved to asynchronous processing.",
        lesson: "Separate customer-critical operations from work that can safely happen asynchronously.",
        futureGuidance: "Do not introduce asynchronous processing when immediate consistency is required.",
        technologies: ["Message Queue", "Background Workers"],
        relatedDecisions: []
    },
    {
        id: "AD-007",
        title: "GitHub Actions for CI/CD",
        status: "Accepted",
        date: "2025-04-05",
        context: "Manual deployments to Kubernetes caused inconsistent release procedures and blind spots during deploy incidents.",
        problem: "Deploy steps lived locally on engineering laptops, leading to configuration drift.",
        alternatives: [
            {
                name: "Manual deployments",
                advantages: ["Flexible during emergencies"],
                disadvantages: ["Human error", "No audit trace"],
                rejectionReason: "Unscalable and insecure."
            },
            {
                name: "Jenkins",
                advantages: ["Extremely customizable"],
                disadvantages: ["Requires managing Jenkins master/slave nodes", "Cumbersome plugin ecosystem"],
                rejectionReason: "Too much overhead. We prefer a managed service."
            }
        ],
        decision: "Adopt GitHub Actions",
        rationale: [
            "The source code already lived in GitHub, so GitHub Actions provided repository-integrated automation to orchestrate code push -> build -> test -> container image -> deployment."
        ],
        tradeoffs: [
            {
                category: "Velocity",
                benefit: "Strong automation, reproducibility, and GitHub UX integration",
                cost: "Workflow maintenance YAML configuration drift"
            },
            {
                category: "Security",
                benefit: "Easier auditability of deployments",
                cost: "Strict secrets management required so tokens stay off logs"
            }
        ],
        implementation: "Configured OIDC roles and GitHub Action YAML flows for EKS deployments.",
        outcome: "GitHub Actions became the primary CI/CD platform.",
        lesson: "Use automated pipelines to make deployments reproducible and auditable.",
        futureGuidance: "Keep deployment credentials outside source code and use controlled secrets.",
        technologies: ["GitHub Actions", "CI/CD"],
        relatedDecisions: []
    },
    {
        id: "AD-008",
        title: "Centralized Logging and Observability",
        status: "Accepted",
        date: "2025-06-22",
        context: "After moving to multiple services and Kubernetes, troubleshooting became difficult because logs were distributed across a constantly recycling pool of pods.",
        problem: "Engineers spent 45 minutes manually tailing distinct pods just to trace a single 500 API error.",
        alternatives: [
            {
                name: "Individual container logs (kubectl tail)",
                advantages: ["No cost"],
                disadvantages: ["Logs vanish if pod dies", "Cannot search centrally"],
                rejectionReason: "Practically useless for production incident response."
            },
            {
                name: "Manually inspecting servers",
                advantages: [""],
                disadvantages: ["EKS abstracts servers anyway"],
                rejectionReason: "Not viable on clustered orchestration."
            }
        ],
        decision: "Adopt Centralized Logging and Metrics",
        rationale: [
            "Centralized observability made cross-service troubleshooting easier by unifying logs and indexing them."
        ],
        tradeoffs: [
            {
                category: "Operations",
                benefit: "Real-time insight and centralized tracing for microservices",
                cost: "Significant ingest volume costs based on log retention policies"
            }
        ],
        implementation: "Deployed log shippers via DaemonSet to export cluster logs to centralized dashboards.",
        outcome: "NovaCart adopted centralized logging and metrics.",
        lesson: "Distributed systems require observability as part of the architecture, not as an afterthought.",
        futureGuidance: "Every new production service should expose useful logs, metrics, and health information continuously.",
        technologies: ["Centralized Logging", "Observability", "Metrics"],
        relatedDecisions: []
    }
];
