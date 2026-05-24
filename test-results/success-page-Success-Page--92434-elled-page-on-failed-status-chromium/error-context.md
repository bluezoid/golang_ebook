# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: success-page.spec.ts >> Success Page >> redirects to cancelled page on failed status
- Location: tests/e2e/success-page.spec.ts:38:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3000/products/deep-dive-into-go/success?order_id=BLZ-FAILED01"
  navigated to "http://localhost:3000/products/deep-dive-into-go?payment=failed&order_id=BLZ-FAILED01"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]: Deep Dive Into Go — Production-Ready Systems | Bluezoid
  - main [ref=e12]:
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: First Edition — 2025 · Go 1.22+
        - generic [ref=e19]:
          - heading "Deep Dive Into Go" [level=1] [ref=e20]:
            - text: Deep Dive
            - text: Into Go
          - paragraph [ref=e21]: Building Production-Ready Systems. A comprehensive Golang engineering handbook covering 102 chapters, 10 capstone projects, and 315 runnable programs.
        - paragraph [ref=e22]: From zero to production-grade distributed systems. Master goroutines, channels, REST APIs, PostgreSQL, MongoDB, Redis, Docker, microservices architecture, and real-world interview preparation — with 300+ interview Q&A and a Go Spec appendix.
        - generic [ref=e23]:
          - generic [ref=e24]:
            - generic [ref=e25]: Linear Path
            - generic [ref=e26]: ·
            - generic [ref=e27]: 4–6 months
          - generic [ref=e28]:
            - generic [ref=e29]: Bridge Path
            - generic [ref=e30]: ·
            - generic [ref=e31]: 4–6 weeks
          - generic [ref=e32]:
            - generic [ref=e33]: Interview Path
            - generic [ref=e34]: ·
            - generic [ref=e35]: 2–3 weeks
        - generic [ref=e36]:
          - button "Buy Now — ₹149" [ref=e37]:
            - img [ref=e38]
            - text: Buy Now — ₹149
            - img [ref=e41]
          - button "Preview Book" [ref=e43]:
            - img [ref=e44]
            - text: Preview Book
        - generic [ref=e47]:
          - generic [ref=e48]:
            - img [ref=e49]
            - text: 315 Runnable Programs
          - generic [ref=e53]:
            - img [ref=e54]
            - text: 102 Chapters · 7 Parts
          - generic [ref=e56]:
            - img [ref=e57]
            - text: Go 1.22+ · 2025 Edition
          - generic [ref=e59]:
            - img [ref=e60]
            - text: Lifetime Access
          - generic [ref=e62]:
            - img [ref=e63]
            - text: 10 Capstone Projects
          - generic [ref=e68]:
            - img [ref=e69]
            - text: Interview Q&A Appendix
      - generic [ref=e71]:
        - generic [ref=e73]:
          - img "Deep Dive Into Go — book cover" [ref=e75]
          - generic [ref=e76]: ₹149
        - generic [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]: ₹149
            - generic [ref=e80]: ₹999
            - generic [ref=e81]: 85% OFF
          - list [ref=e82]:
            - listitem [ref=e83]:
              - img [ref=e85]
              - text: Instant PDF delivery to your email
            - listitem [ref=e87]:
              - img [ref=e89]
              - text: Lifetime access — no expiry
            - listitem [ref=e91]:
              - img [ref=e93]
              - text: 100-page free sample before buying
            - listitem [ref=e95]:
              - img [ref=e97]
              - text: 102 chapters · 7 structured parts
            - listitem [ref=e99]:
              - img [ref=e101]
              - text: 10 real-world capstone projects
            - listitem [ref=e103]:
              - img [ref=e105]
              - text: 315 runnable Go 1.22+ programs
            - listitem [ref=e107]:
              - img [ref=e109]
              - text: 300+ interview Q&A appendix
          - button "Buy Now — ₹149" [ref=e111]:
            - img [ref=e112]
            - text: Buy Now — ₹149
          - paragraph [ref=e115]: Secure checkout · One-time payment · No subscription
    - generic [ref=e117]:
      - generic [ref=e118]:
        - generic [ref=e119]: What's Inside
        - heading "A structured path from zero to production" [level=2] [ref=e120]:
          - text: A structured path from
          - text: zero to production
        - paragraph [ref=e121]: 102 chapters across 7 parts — from Go syntax to distributed systems — with 10 end-to-end capstone projects and 315 runnable programs that you can run locally.
      - generic [ref=e122]:
        - generic [ref=e123]:
          - generic [ref=e125]: "1"
          - generic [ref=e126]: Foundations
          - generic [ref=e127]: Types, syntax, tools
        - generic [ref=e128]:
          - generic [ref=e130]: "2"
          - generic [ref=e131]: Core Lang
          - generic [ref=e132]: Structs, interfaces, generics
        - generic [ref=e133]:
          - generic [ref=e135]: "3"
          - generic [ref=e136]: Design
          - generic [ref=e137]: Clean arch, DDD, testing
        - generic [ref=e138]:
          - generic [ref=e140]: "4"
          - generic [ref=e141]: Concurrency
          - generic [ref=e142]: Goroutines, channels, sync
        - generic [ref=e143]:
          - generic [ref=e145]: "5"
          - generic [ref=e146]: Backends
          - generic [ref=e147]: HTTP, REST, databases
        - generic [ref=e148]:
          - generic [ref=e150]: "6"
          - generic [ref=e151]: Production
          - generic [ref=e152]: Docker, gRPC, observability
        - generic [ref=e153]:
          - generic [ref=e155]: "7"
          - generic [ref=e156]: Capstones
          - generic [ref=e157]: 10 real-world projects
      - generic [ref=e158]:
        - generic [ref=e159]:
          - generic [ref=e161]:
            - generic [ref=e162]: Part I
            - heading "Foundations" [level=3] [ref=e163]
            - generic [ref=e164]: 15 chapters
          - list [ref=e166]:
            - listitem [ref=e167]: Go philosophy & toolchain setup
            - listitem [ref=e169]: Variables, types & zero values
            - listitem [ref=e171]: Control flow & functions
            - listitem [ref=e173]: Arrays, slices & maps
            - listitem [ref=e175]: Error handling patterns
        - generic [ref=e177]:
          - generic [ref=e179]:
            - generic [ref=e180]: Part II
            - heading "Core Language" [level=3] [ref=e181]
            - generic [ref=e182]: 16 chapters
          - list [ref=e184]:
            - listitem [ref=e185]: Structs, methods & embedding
            - listitem [ref=e187]: Interfaces & composition
            - listitem [ref=e189]: Generics (Go 1.18+)
            - listitem [ref=e191]: Pointers & memory model
            - listitem [ref=e193]: Packages & modules
        - generic [ref=e195]:
          - generic [ref=e197]:
            - generic [ref=e198]: Part III
            - heading "Designing Software in Go" [level=3] [ref=e199]
            - generic [ref=e200]: 14 chapters
          - list [ref=e202]:
            - listitem [ref=e203]: Clean architecture patterns
            - listitem [ref=e205]: Dependency injection
            - listitem [ref=e207]: Domain-driven design
            - listitem [ref=e209]: Testing strategies
            - listitem [ref=e211]: Code organization at scale
        - generic [ref=e213]:
          - generic [ref=e215]:
            - generic [ref=e216]: Part IV
            - heading "Concurrency & Systems" [level=3] [ref=e217]
            - generic [ref=e218]: 18 chapters
          - list [ref=e220]:
            - listitem [ref=e221]: Goroutines internals
            - listitem [ref=e223]: Channels & select
            - listitem [ref=e225]: sync package deep dive
            - listitem [ref=e227]: Context & cancellation
            - listitem [ref=e229]: Race conditions & detection
        - generic [ref=e231]:
          - generic [ref=e233]:
            - generic [ref=e234]: Part V
            - heading "Building Backends" [level=3] [ref=e235]
            - generic [ref=e236]: 17 chapters
          - list [ref=e238]:
            - listitem [ref=e239]: HTTP server & routing
            - listitem [ref=e241]: REST API design
            - listitem [ref=e243]: JWT authentication
            - listitem [ref=e245]: PostgreSQL & MongoDB
            - listitem [ref=e247]: Redis caching patterns
        - generic [ref=e249]:
          - generic [ref=e251]:
            - generic [ref=e252]: Part VI
            - heading "Production Engineering" [level=3] [ref=e253]
            - generic [ref=e254]: 14 chapters
          - list [ref=e256]:
            - listitem [ref=e257]: Docker & containers
            - listitem [ref=e259]: Observability & tracing
            - listitem [ref=e261]: gRPC & microservices
            - listitem [ref=e263]: CI/CD pipelines
            - listitem [ref=e265]: Performance profiling
        - generic [ref=e267]:
          - generic [ref=e269]:
            - generic [ref=e270]: Part VII
            - heading "Capstone Projects" [level=3] [ref=e271]
            - generic [ref=e272]: 8 chapters
          - list [ref=e274]:
            - listitem [ref=e275]: 10 production-grade projects
            - listitem [ref=e277]: URL Shortener & Auth Service
            - listitem [ref=e279]: Real-Time Chat & Job Queue
            - listitem [ref=e281]: API Gateway & File Upload
            - listitem [ref=e283]: Distributed Task Scheduler
        - generic [ref=e285]:
          - generic [ref=e286]:
            - generic [ref=e287]: "102"
            - generic [ref=e288]: chapters
          - generic [ref=e290]:
            - generic [ref=e291]:
              - generic [ref=e292]: "315"
              - generic [ref=e293]: programs
            - generic [ref=e294]:
              - generic [ref=e295]: "10"
              - generic [ref=e296]: projects
            - generic [ref=e297]:
              - generic [ref=e298]: 300+
              - generic [ref=e299]: interview Q&A
            - generic [ref=e300]:
              - generic [ref=e301]: "7"
              - generic [ref=e302]: parts
    - generic [ref=e304]:
      - generic [ref=e305]:
        - generic [ref=e306]: Why This Book
        - heading "Built for engineers who ship real code" [level=2] [ref=e307]:
          - text: Built for engineers who
          - text: ship real code
        - paragraph [ref=e308]: Not another syntax tour. Every chapter is written from production experience — from zero-allocation patterns to distributed system design.
      - generic [ref=e309]:
        - generic [ref=e310]:
          - img [ref=e312]
          - generic [ref=e316]:
            - heading "315 Runnable Programs" [level=3] [ref=e317]
            - paragraph [ref=e318]: Every concept is backed by a complete, working Go program you can run locally — from Hello World to distributed task schedulers.
        - generic [ref=e319]:
          - img [ref=e321]
          - generic [ref=e325]:
            - heading "3 Reading Paths" [level=3] [ref=e326]
            - paragraph [ref=e327]: Linear path (4–6 months), Bridge path for experienced engineers (4–6 weeks), and Interview-prep path (2–3 weeks). Read your way.
        - generic [ref=e328]:
          - img [ref=e330]
          - generic [ref=e333]:
            - heading "Concurrency Internals" [level=3] [ref=e334]
            - paragraph [ref=e335]: Deep dive into the Go scheduler, goroutine internals, channel mechanics, sync primitives, and real-world concurrency patterns used in production.
        - generic [ref=e336]:
          - img [ref=e338]
          - generic [ref=e342]:
            - heading "Real Database Integration" [level=3] [ref=e343]
            - paragraph [ref=e344]: PostgreSQL with sqlx, MongoDB with the official driver, Redis caching — complete with query optimization, connection pooling, and migration patterns.
        - generic [ref=e345]:
          - img [ref=e347]
          - generic [ref=e351]:
            - heading "10 Capstone Projects" [level=3] [ref=e352]
            - paragraph [ref=e353]: URL Shortener, Auth Service, E-commerce Backend, Real-Time Chat, Notification Service, Job Queue, File Upload Service, API Gateway, Task Scheduler, Microservices Platform.
        - generic [ref=e354]:
          - img [ref=e356]
          - generic [ref=e359]:
            - heading "Testing from Chapter 1" [level=3] [ref=e360]
            - paragraph [ref=e361]: Unit tests, table-driven tests, benchmarks, race detection, integration tests, and mocking strategies — testing is a first-class citizen throughout.
        - generic [ref=e362]:
          - img [ref=e364]
          - generic [ref=e368]:
            - heading "Generics & Modern Go" [level=3] [ref=e369]
            - paragraph [ref=e370]: Complete coverage of Go 1.18+ generics, type constraints, type inference, and how to use generics without over-engineering your codebase.
        - generic [ref=e371]:
          - img [ref=e373]
          - generic [ref=e376]:
            - heading "300+ Interview Q&A" [level=3] [ref=e377]
            - paragraph [ref=e378]: A dedicated appendix with 300+ Go interview questions and answers covering runtime internals, concurrency, APIs, and system design.
    - generic [ref=e380]:
      - generic [ref=e381]:
        - generic [ref=e382]: Who Is This For
        - heading "Built for engineers at every stage" [level=2] [ref=e383]:
          - text: Built for engineers
          - text: at every stage
        - paragraph [ref=e384]: Whether you're just starting with Go or architecting distributed systems — this handbook has something that levels you up.
      - generic [ref=e385]:
        - generic [ref=e386]:
          - img [ref=e388]
          - generic [ref=e391]:
            - heading "Students & Beginners" [level=3] [ref=e392]
            - paragraph [ref=e393]: Building your first backend in Go? This handbook takes you from zero syntax knowledge to building real APIs with solid foundations.
          - generic [ref=e394]:
            - generic [ref=e395]: Start from scratch
            - generic [ref=e396]: Structured learning
        - generic [ref=e397]:
          - img [ref=e399]
          - generic [ref=e403]:
            - heading "Backend Developers" [level=3] [ref=e404]
            - paragraph [ref=e405]: Already building backends in Node, Python, or Java? Level up with Go's concurrency model and type system to write faster, safer services.
          - generic [ref=e406]:
            - generic [ref=e407]: Language migration
            - generic [ref=e408]: Production patterns
        - generic [ref=e409]:
          - img [ref=e411]
          - generic [ref=e414]:
            - heading "Working Engineers" [level=3] [ref=e415]
            - paragraph [ref=e416]: Mid-level engineers looking to sharpen their Go skills, understand internals, and adopt senior-level architectural patterns.
          - generic [ref=e417]:
            - generic [ref=e418]: Deep internals
            - generic [ref=e419]: Architecture patterns
        - generic [ref=e420]:
          - img [ref=e422]
          - generic [ref=e427]:
            - heading "Switching to Go" [level=3] [ref=e428]
            - paragraph [ref=e429]: Migrating your team or personal stack to Go? Get up to speed with Go-specific idioms, tooling, and ecosystem best practices.
          - generic [ref=e430]:
            - generic [ref=e431]: Idiomatic Go
            - generic [ref=e432]: Ecosystem tooling
        - generic [ref=e433]:
          - img [ref=e435]
          - generic [ref=e440]:
            - heading "Startup Engineers" [level=3] [ref=e441]
            - paragraph [ref=e442]: Building fast at a startup? Learn how to design Go services that scale without premature complexity — practical and pragmatic.
          - generic [ref=e443]:
            - generic [ref=e444]: Move fast
            - generic [ref=e445]: Scalable architecture
        - generic [ref=e446]:
          - img [ref=e448]
          - generic [ref=e453]:
            - heading "Systems Design Learners" [level=3] [ref=e454]
            - paragraph [ref=e455]: Understand how Go powers real distributed systems — microservices, message queues, service meshes, and more.
          - generic [ref=e456]:
            - generic [ref=e457]: Distributed systems
            - generic [ref=e458]: Microservices
        - generic [ref=e459]:
          - img [ref=e461]
          - generic [ref=e467]:
            - heading "Interview Prep" [level=3] [ref=e468]
            - paragraph [ref=e469]: Preparing for senior backend or SWE interviews? Go is increasingly preferred — master it with depth that impresses interviewers.
          - generic [ref=e470]:
            - generic [ref=e471]: Interview mastery
            - generic [ref=e472]: Senior engineering
    - generic [ref=e475]:
      - generic [ref=e476]:
        - generic [ref=e477]:
          - generic [ref=e478]: Free Preview
          - heading "Read 100 pages before you buy" [level=2] [ref=e479]:
            - text: Read 100 pages
            - text: before you buy
          - paragraph [ref=e480]: The free sample includes the complete table of contents, all of Chapter 1 in full, and chapter previews from all 7 parts. No registration. No email.
        - list [ref=e481]:
          - listitem [ref=e482]:
            - img [ref=e484]
            - text: Complete table of contents — all 102 chapters
          - listitem [ref=e486]:
            - img [ref=e488]
            - text: "Full Chapter 1: Why Go? Philosophy & Toolchain"
          - listitem [ref=e490]:
            - img [ref=e492]
            - text: Chapter previews from all 7 parts
          - listitem [ref=e494]:
            - img [ref=e496]
            - text: 315 runnable programs sample included
          - listitem [ref=e498]:
            - img [ref=e500]
            - text: No email or registration required
        - generic [ref=e502]:
          - button "Preview Book" [ref=e503]:
            - img [ref=e504]
            - text: Preview Book
          - generic [ref=e507]:
            - img [ref=e508]
            - text: 2.7 MB · 100 pages
      - generic [ref=e511]:
        - generic [ref=e513]:
          - img "Deep Dive Into Go — book cover" [ref=e517]
          - generic [ref=e518]: ₹149
          - generic [ref=e519]:
            - img [ref=e520]
            - text: 100-page free sample
        - generic [ref=e522]:
          - generic [ref=e525]:
            - generic [ref=e526]: Chapter 1
            - generic [ref=e527]: Why Go? Philosophy & Toolchain
          - generic [ref=e547]:
            - generic [ref=e548]: Chapter 19
            - generic [ref=e549]: Goroutines & the Scheduler
          - generic [ref=e569]:
            - generic [ref=e570]: Chapter 47
            - generic [ref=e571]: REST APIs with net/http
    - generic [ref=e590]:
      - generic [ref=e591]:
        - generic [ref=e592]: Pricing
        - heading "One-time. Forever yours." [level=2] [ref=e593]
        - paragraph [ref=e594]: No subscriptions. No recurring fees. Pay once, own it permanently.
      - generic [ref=e598]:
        - generic [ref=e599]:
          - generic [ref=e600]:
            - generic [ref=e601]: Deep Dive Into Go
            - generic [ref=e602]: Complete Ebook
          - generic [ref=e603]: Launch Price
        - generic [ref=e604]:
          - generic [ref=e605]: ₹149
          - generic [ref=e606]:
            - generic [ref=e607]: ₹999
            - generic [ref=e608]: 85% OFF
        - list [ref=e610]:
          - listitem [ref=e611]:
            - img [ref=e613]
            - text: Instant PDF delivery to your email
          - listitem [ref=e616]:
            - img [ref=e618]
            - text: Lifetime access — no expiry
          - listitem [ref=e620]:
            - img [ref=e622]
            - text: Free future edition updates
          - listitem [ref=e627]:
            - img [ref=e629]
            - text: 102 chapters · 315 runnable programs
          - listitem [ref=e632]:
            - img [ref=e634]
            - text: Email support included
          - listitem [ref=e637]:
            - img [ref=e639]
            - text: Secure one-time payment
        - button "Buy Now — ₹149" [ref=e641]:
          - img [ref=e642]
          - text: Buy Now — ₹149
        - generic [ref=e645]:
          - generic [ref=e646]:
            - img [ref=e647]
            - text: Secure checkout
          - generic [ref=e649]: ·
          - generic [ref=e650]: One-time payment
          - generic [ref=e651]: ·
          - generic [ref=e652]: Instant delivery
        - generic [ref=e653]:
          - generic [ref=e654]: UPI
          - generic [ref=e655]: Cards
          - generic [ref=e656]: Net Banking
          - generic [ref=e657]: Wallets
    - generic [ref=e659]:
      - generic [ref=e660]:
        - generic [ref=e661]: Testimonials
        - heading "What engineers are saying" [level=2] [ref=e662]
        - paragraph [ref=e663]: From students to senior engineers at top Indian tech companies — here's what readers think.
      - generic [ref=e664]:
        - generic [ref=e665]:
          - generic [ref=e666]:
            - img [ref=e667]
            - img [ref=e669]
            - img [ref=e671]
            - img [ref=e673]
            - img [ref=e675]
          - generic [ref=e677]:
            - paragraph [ref=e678]: “The concurrency chapters alone are worth the price. Finally a resource that explains goroutine scheduling, channel semantics, and select patterns in a way that actually sticks. Exactly the depth I needed as someone who was already "using" Go but not really understanding it.”
            - paragraph [ref=e679]: “The concurrency chapters alone are worth the price.”
          - generic [ref=e680]:
            - generic [ref=e682]: AM
            - generic [ref=e683]:
              - generic [ref=e684]: Arjun Mehta
              - generic [ref=e685]: Senior Backend Engineer · Razorpay
        - generic [ref=e686]:
          - generic [ref=e687]:
            - img [ref=e688]
            - img [ref=e690]
            - img [ref=e692]
            - img [ref=e694]
            - img [ref=e696]
          - generic [ref=e698]:
            - paragraph [ref=e699]: “I came from a Node.js background and was struggling with how to think in Go. This ebook doesn't just show you syntax — it shows you the Go way. The clean architecture section changed how I structure my services. Shipped my first production Go API two weeks after reading.”
            - paragraph [ref=e700]: “It shows you the Go way.”
          - generic [ref=e701]:
            - generic [ref=e703]: PN
            - generic [ref=e704]:
              - generic [ref=e705]: Priya Nair
              - generic [ref=e706]: Full Stack Developer · Startup — Bangalore
        - generic [ref=e707]:
          - generic [ref=e708]:
            - img [ref=e709]
            - img [ref=e711]
            - img [ref=e713]
            - img [ref=e715]
            - img [ref=e717]
          - generic [ref=e719]:
            - paragraph [ref=e720]: “Used this to prepare for my L5 backend interviews. The PostgreSQL, Redis, and microservices chapters gave me exactly the talking points and code patterns I needed. Got the offer. The price-to-value ratio here is insane — ₹149 for this quality of content.”
            - paragraph [ref=e721]: “Got the offer. Price-to-value ratio is insane.”
          - generic [ref=e722]:
            - generic [ref=e724]: RS
            - generic [ref=e725]:
              - generic [ref=e726]: Rohit Sharma
              - generic [ref=e727]: SDE-2 · Zomato
        - generic [ref=e728]:
          - generic [ref=e729]:
            - img [ref=e730]
            - img [ref=e732]
            - img [ref=e734]
            - img [ref=e736]
            - img [ref=e738]
          - generic [ref=e740]:
            - paragraph [ref=e741]: “The memory management and escape analysis section in Part II is something I've never seen covered this well in any free resource. If you care about performance and actually understanding what the Go runtime is doing — this is essential reading.”
            - paragraph [ref=e742]: “Essential reading if you care about performance.”
          - generic [ref=e743]:
            - generic [ref=e745]: KR
            - generic [ref=e746]:
              - generic [ref=e747]: Kavya Reddy
              - generic [ref=e748]: Systems Engineer · CRED
        - generic [ref=e749]:
          - generic [ref=e750]:
            - img [ref=e751]
            - img [ref=e753]
            - img [ref=e755]
            - img [ref=e757]
            - img [ref=e759]
          - generic [ref=e761]:
            - paragraph [ref=e762]: “Clear, dense, no fluff. Every chapter respects your time and gets straight to the engineering substance. The Docker and deployment chapters are production-accurate — not the hello-world nonsense you find on blogs. Recommended for any Go developer who's serious.”
            - paragraph [ref=e763]: “Clear, dense, no fluff.”
          - generic [ref=e764]:
            - generic [ref=e766]: NV
            - generic [ref=e767]:
              - generic [ref=e768]: Nikhil Verma
              - generic [ref=e769]: Backend Developer · Freshworks
        - generic [ref=e770]:
          - generic [ref=e771]:
            - img [ref=e772]
            - img [ref=e774]
            - img [ref=e776]
            - img [ref=e778]
            - img [ref=e780]
          - generic [ref=e782]:
            - paragraph [ref=e783]: “As a student learning backend for the first time, I was intimidated. But this ebook walks you through Go fundamentals so cleanly, and by Part IV I was building my own REST API with JWT auth. Now preparing for placement interviews with the concurrency and system design sections.”
            - paragraph [ref=e784]: “By Part IV I was building my own REST API.”
          - generic [ref=e785]:
            - generic [ref=e787]: AI
            - generic [ref=e788]:
              - generic [ref=e789]: Ananya Iyer
              - generic [ref=e790]: CS Student · IIT Bombay
    - generic [ref=e793]:
      - generic [ref=e794]:
        - generic [ref=e795]: FAQ
        - heading "Common questions" [level=2] [ref=e796]:
          - text: Common
          - text: questions
        - paragraph [ref=e797]:
          - text: Everything you need to know before purchasing. Still have questions? Email
          - link "support@bluezoid.in" [ref=e798] [cursor=pointer]:
            - /url: mailto:support@bluezoid.in
      - generic [ref=e799]:
        - button "Is this ebook beginner friendly?" [ref=e801]:
          - generic [ref=e802]: Is this ebook beginner friendly?
          - img [ref=e804]
        - button "Is this a physical book?" [ref=e806]:
          - generic [ref=e807]: Is this a physical book?
          - img [ref=e809]
        - button "How do I receive the ebook after purchase?" [ref=e811]:
          - generic [ref=e812]: How do I receive the ebook after purchase?
          - img [ref=e814]
        - button "How long do I get access?" [ref=e816]:
          - generic [ref=e817]: How long do I get access?
          - img [ref=e819]
        - button "Are future updates included?" [ref=e821]:
          - generic [ref=e822]: Are future updates included?
          - img [ref=e824]
        - button "Can I read this on mobile or tablet?" [ref=e826]:
          - generic [ref=e827]: Can I read this on mobile or tablet?
          - img [ref=e829]
        - button "What payment methods are supported?" [ref=e831]:
          - generic [ref=e832]: What payment methods are supported?
          - img [ref=e834]
        - button "Do you provide refunds?" [ref=e836]:
          - generic [ref=e837]: Do you provide refunds?
          - img [ref=e839]
    - generic [ref=e842]:
      - generic [ref=e843]:
        - generic [ref=e844]: Get Started Today
        - heading "Stop watching tutorials. Start shipping Go." [level=2] [ref=e845]:
          - text: Stop watching tutorials.
          - text: Start shipping Go.
        - paragraph [ref=e846]: The gap between knowing Go syntax and building production-grade systems is what this ebook closes. Join hundreds of engineers who made the leap.
      - generic [ref=e847]:
        - button "Get the Ebook — ₹149" [ref=e848]:
          - img [ref=e849]
          - text: Get the Ebook — ₹149
          - img [ref=e852]
        - paragraph [ref=e854]: One-time · Instant delivery · Lifetime access
      - generic [ref=e855]:
        - generic [ref=e856]:
          - generic [ref=e857]:
            - generic [ref=e859]: AM
            - generic [ref=e861]: PR
            - generic [ref=e863]: RS
            - generic [ref=e865]: KV
            - generic [ref=e867]: NI
          - generic [ref=e868]: 500+ engineers reading
        - generic [ref=e869]:
          - generic [ref=e870]: ★★★★★
          - generic [ref=e871]: 5.0 rating
  - contentinfo [ref=e872]:
    - generic [ref=e873]:
      - generic [ref=e874]:
        - generic [ref=e875]:
          - generic [ref=e876]:
            - generic [ref=e878]: B
            - generic [ref=e879]: Bluezoid
          - paragraph [ref=e880]: Premium engineering products for modern developers.
          - link "support@bluezoid.in" [ref=e881] [cursor=pointer]:
            - /url: mailto:support@bluezoid.in
        - navigation [ref=e882]:
          - link "Privacy Policy" [ref=e883] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e884] [cursor=pointer]:
            - /url: /terms
          - link "Refund & Cancellation" [ref=e885] [cursor=pointer]:
            - /url: /refund
      - generic [ref=e886]:
        - paragraph [ref=e887]: © 2026 Bluezoid. All rights reserved.
        - paragraph [ref=e888]: Deep Dive Into Go · Digital Product
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Success Page', () => {
  4  |   function mockVerifyPayment(page: Parameters<typeof test>[1]['page'], response: Record<string, unknown>) {
  5  |     return page.route('/api/verify-payment', (route) => {
  6  |       route.fulfill({
  7  |         status: 200,
  8  |         contentType: 'application/json',
  9  |         body: JSON.stringify(response),
  10 |       });
  11 |     });
  12 |   }
  13 | 
  14 |   test('shows verifying spinner while loading', async ({ page }) => {
  15 |     // Route that never responds — simulate loading
  16 |     await page.route('/api/verify-payment', () => {}); // never fulfills
  17 | 
  18 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');
  19 | 
  20 |     await expect(page.getByText(/verifying your payment/i)).toBeVisible();
  21 |   });
  22 | 
  23 |   test('shows success card on fulfilled status', async ({ page }) => {
  24 |     await mockVerifyPayment(page, { status: 'fulfilled', email: 'customer@gmail.com' });
  25 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');
  26 | 
  27 |     await expect(page.getByText(/payment successful/i)).toBeVisible();
  28 |     await expect(page.getByText(/customer@gmail\.com/i)).toBeVisible();
  29 |   });
  30 | 
  31 |   test('shows already_fulfilled message', async ({ page }) => {
  32 |     await mockVerifyPayment(page, { status: 'already_fulfilled' });
  33 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-ALREADY01');
  34 | 
  35 |     await expect(page.getByText(/already processed/i)).toBeVisible();
  36 |   });
  37 | 
  38 |   test('redirects to cancelled page on failed status', async ({ page }) => {
  39 |     await mockVerifyPayment(page, { status: 'failed' });
  40 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-FAILED01');
  41 | 
> 42 |     await page.waitForURL(/\/cancelled/, { timeout: 5000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
  43 |     expect(page.url()).toContain('/cancelled');
  44 |   });
  45 | 
  46 |   test('shows pending card on pending status', async ({ page }) => {
  47 |     await mockVerifyPayment(page, { status: 'pending' });
  48 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-PENDING01');
  49 | 
  50 |     await expect(page.getByText(/payment is processing/i)).toBeVisible();
  51 |   });
  52 | 
  53 |   test('shows error card on network failure', async ({ page }) => {
  54 |     await page.route('/api/verify-payment', (route) => route.abort());
  55 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-NETERR01');
  56 | 
  57 |     await expect(page.getByText(/something went wrong/i)).toBeVisible();
  58 |   });
  59 | 
  60 |   test('"Back to product page" link works', async ({ page }) => {
  61 |     await mockVerifyPayment(page, { status: 'fulfilled', email: 'x@gmail.com' });
  62 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-OK001');
  63 | 
  64 |     await expect(page.getByText(/payment successful/i)).toBeVisible();
  65 | 
  66 |     const backLink = page.getByRole('link', { name: /back to product/i });
  67 |     await expect(backLink).toHaveAttribute('href', '/products/deep-dive-into-go');
  68 |   });
  69 | });
  70 | 
```