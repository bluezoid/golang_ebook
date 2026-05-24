# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-page.spec.ts >> Landing Page >> FAQ item expands on click
- Location: tests/e2e/landing-page.spec.ts:88:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText(/frequently asked/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: First Edition — 2025 · Go 1.22+
        - generic [ref=e9]:
          - heading "Deep Dive Into Go" [level=1] [ref=e10]:
            - text: Deep Dive
            - text: Into Go
          - paragraph [ref=e11]: Building Production-Ready Systems. A comprehensive Golang engineering handbook covering 102 chapters, 10 capstone projects, and 315 runnable programs.
        - paragraph [ref=e12]: From zero to production-grade distributed systems. Master goroutines, channels, REST APIs, PostgreSQL, MongoDB, Redis, Docker, microservices architecture, and real-world interview preparation — with 300+ interview Q&A and a Go Spec appendix.
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: Linear Path
            - generic [ref=e16]: ·
            - generic [ref=e17]: 4–6 months
          - generic [ref=e18]:
            - generic [ref=e19]: Bridge Path
            - generic [ref=e20]: ·
            - generic [ref=e21]: 4–6 weeks
          - generic [ref=e22]:
            - generic [ref=e23]: Interview Path
            - generic [ref=e24]: ·
            - generic [ref=e25]: 2–3 weeks
        - generic [ref=e26]:
          - button "Buy Now — ₹149" [ref=e27]:
            - img [ref=e28]
            - text: Buy Now — ₹149
            - img [ref=e31]
          - button "Preview Book" [ref=e33]:
            - img [ref=e34]
            - text: Preview Book
        - generic [ref=e37]:
          - generic [ref=e38]:
            - img [ref=e39]
            - text: 315 Runnable Programs
          - generic [ref=e43]:
            - img [ref=e44]
            - text: 102 Chapters · 7 Parts
          - generic [ref=e46]:
            - img [ref=e47]
            - text: Go 1.22+ · 2025 Edition
          - generic [ref=e49]:
            - img [ref=e50]
            - text: Lifetime Access
          - generic [ref=e52]:
            - img [ref=e53]
            - text: 10 Capstone Projects
          - generic [ref=e58]:
            - img [ref=e59]
            - text: Interview Q&A Appendix
      - generic [ref=e61]:
        - generic [ref=e63]:
          - img "Deep Dive Into Go — book cover" [ref=e65]
          - generic [ref=e66]: ₹149
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]: ₹149
            - generic [ref=e70]: ₹999
            - generic [ref=e71]: 85% OFF
          - list [ref=e72]:
            - listitem [ref=e73]:
              - img [ref=e75]
              - text: Instant PDF delivery to your email
            - listitem [ref=e77]:
              - img [ref=e79]
              - text: Lifetime access — no expiry
            - listitem [ref=e81]:
              - img [ref=e83]
              - text: 100-page free sample before buying
            - listitem [ref=e85]:
              - img [ref=e87]
              - text: 102 chapters · 7 structured parts
            - listitem [ref=e89]:
              - img [ref=e91]
              - text: 10 real-world capstone projects
            - listitem [ref=e93]:
              - img [ref=e95]
              - text: 315 runnable Go 1.22+ programs
            - listitem [ref=e97]:
              - img [ref=e99]
              - text: 300+ interview Q&A appendix
          - button "Buy Now — ₹149" [ref=e101]:
            - img [ref=e102]
            - text: Buy Now — ₹149
          - paragraph [ref=e105]: Secure checkout · One-time payment · No subscription
    - generic [ref=e107]:
      - generic [ref=e108]:
        - generic [ref=e109]: What's Inside
        - heading "A structured path from zero to production" [level=2] [ref=e110]:
          - text: A structured path from
          - text: zero to production
        - paragraph [ref=e111]: 102 chapters across 7 parts — from Go syntax to distributed systems — with 10 end-to-end capstone projects and 315 runnable programs that you can run locally.
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e115]: "1"
          - generic [ref=e116]: Foundations
          - generic [ref=e117]: Types, syntax, tools
        - generic [ref=e118]:
          - generic [ref=e120]: "2"
          - generic [ref=e121]: Core Lang
          - generic [ref=e122]: Structs, interfaces, generics
        - generic [ref=e123]:
          - generic [ref=e125]: "3"
          - generic [ref=e126]: Design
          - generic [ref=e127]: Clean arch, DDD, testing
        - generic [ref=e128]:
          - generic [ref=e130]: "4"
          - generic [ref=e131]: Concurrency
          - generic [ref=e132]: Goroutines, channels, sync
        - generic [ref=e133]:
          - generic [ref=e135]: "5"
          - generic [ref=e136]: Backends
          - generic [ref=e137]: HTTP, REST, databases
        - generic [ref=e138]:
          - generic [ref=e140]: "6"
          - generic [ref=e141]: Production
          - generic [ref=e142]: Docker, gRPC, observability
        - generic [ref=e143]:
          - generic [ref=e145]: "7"
          - generic [ref=e146]: Capstones
          - generic [ref=e147]: 10 real-world projects
      - generic [ref=e148]:
        - generic [ref=e149]:
          - generic [ref=e151]:
            - generic [ref=e152]: Part I
            - heading "Foundations" [level=3] [ref=e153]
            - generic [ref=e154]: 15 chapters
          - list [ref=e156]:
            - listitem [ref=e157]: Go philosophy & toolchain setup
            - listitem [ref=e159]: Variables, types & zero values
            - listitem [ref=e161]: Control flow & functions
            - listitem [ref=e163]: Arrays, slices & maps
            - listitem [ref=e165]: Error handling patterns
        - generic [ref=e167]:
          - generic [ref=e169]:
            - generic [ref=e170]: Part II
            - heading "Core Language" [level=3] [ref=e171]
            - generic [ref=e172]: 16 chapters
          - list [ref=e174]:
            - listitem [ref=e175]: Structs, methods & embedding
            - listitem [ref=e177]: Interfaces & composition
            - listitem [ref=e179]: Generics (Go 1.18+)
            - listitem [ref=e181]: Pointers & memory model
            - listitem [ref=e183]: Packages & modules
        - generic [ref=e185]:
          - generic [ref=e187]:
            - generic [ref=e188]: Part III
            - heading "Designing Software in Go" [level=3] [ref=e189]
            - generic [ref=e190]: 14 chapters
          - list [ref=e192]:
            - listitem [ref=e193]: Clean architecture patterns
            - listitem [ref=e195]: Dependency injection
            - listitem [ref=e197]: Domain-driven design
            - listitem [ref=e199]: Testing strategies
            - listitem [ref=e201]: Code organization at scale
        - generic [ref=e203]:
          - generic [ref=e205]:
            - generic [ref=e206]: Part IV
            - heading "Concurrency & Systems" [level=3] [ref=e207]
            - generic [ref=e208]: 18 chapters
          - list [ref=e210]:
            - listitem [ref=e211]: Goroutines internals
            - listitem [ref=e213]: Channels & select
            - listitem [ref=e215]: sync package deep dive
            - listitem [ref=e217]: Context & cancellation
            - listitem [ref=e219]: Race conditions & detection
        - generic [ref=e221]:
          - generic [ref=e223]:
            - generic [ref=e224]: Part V
            - heading "Building Backends" [level=3] [ref=e225]
            - generic [ref=e226]: 17 chapters
          - list [ref=e228]:
            - listitem [ref=e229]: HTTP server & routing
            - listitem [ref=e231]: REST API design
            - listitem [ref=e233]: JWT authentication
            - listitem [ref=e235]: PostgreSQL & MongoDB
            - listitem [ref=e237]: Redis caching patterns
        - generic [ref=e239]:
          - generic [ref=e241]:
            - generic [ref=e242]: Part VI
            - heading "Production Engineering" [level=3] [ref=e243]
            - generic [ref=e244]: 14 chapters
          - list [ref=e246]:
            - listitem [ref=e247]: Docker & containers
            - listitem [ref=e249]: Observability & tracing
            - listitem [ref=e251]: gRPC & microservices
            - listitem [ref=e253]: CI/CD pipelines
            - listitem [ref=e255]: Performance profiling
        - generic [ref=e257]:
          - generic [ref=e259]:
            - generic [ref=e260]: Part VII
            - heading "Capstone Projects" [level=3] [ref=e261]
            - generic [ref=e262]: 8 chapters
          - list [ref=e264]:
            - listitem [ref=e265]: 10 production-grade projects
            - listitem [ref=e267]: URL Shortener & Auth Service
            - listitem [ref=e269]: Real-Time Chat & Job Queue
            - listitem [ref=e271]: API Gateway & File Upload
            - listitem [ref=e273]: Distributed Task Scheduler
        - generic [ref=e275]:
          - generic [ref=e276]:
            - generic [ref=e277]: "102"
            - generic [ref=e278]: chapters
          - generic [ref=e280]:
            - generic [ref=e281]:
              - generic [ref=e282]: "315"
              - generic [ref=e283]: programs
            - generic [ref=e284]:
              - generic [ref=e285]: "10"
              - generic [ref=e286]: projects
            - generic [ref=e287]:
              - generic [ref=e288]: 300+
              - generic [ref=e289]: interview Q&A
            - generic [ref=e290]:
              - generic [ref=e291]: "7"
              - generic [ref=e292]: parts
    - generic [ref=e294]:
      - generic [ref=e295]:
        - generic [ref=e296]: Why This Book
        - heading "Built for engineers who ship real code" [level=2] [ref=e297]:
          - text: Built for engineers who
          - text: ship real code
        - paragraph [ref=e298]: Not another syntax tour. Every chapter is written from production experience — from zero-allocation patterns to distributed system design.
      - generic [ref=e299]:
        - generic [ref=e300]:
          - img [ref=e302]
          - generic [ref=e306]:
            - heading "315 Runnable Programs" [level=3] [ref=e307]
            - paragraph [ref=e308]: Every concept is backed by a complete, working Go program you can run locally — from Hello World to distributed task schedulers.
        - generic [ref=e309]:
          - img [ref=e311]
          - generic [ref=e315]:
            - heading "3 Reading Paths" [level=3] [ref=e316]
            - paragraph [ref=e317]: Linear path (4–6 months), Bridge path for experienced engineers (4–6 weeks), and Interview-prep path (2–3 weeks). Read your way.
        - generic [ref=e318]:
          - img [ref=e320]
          - generic [ref=e323]:
            - heading "Concurrency Internals" [level=3] [ref=e324]
            - paragraph [ref=e325]: Deep dive into the Go scheduler, goroutine internals, channel mechanics, sync primitives, and real-world concurrency patterns used in production.
        - generic [ref=e326]:
          - img [ref=e328]
          - generic [ref=e332]:
            - heading "Real Database Integration" [level=3] [ref=e333]
            - paragraph [ref=e334]: PostgreSQL with sqlx, MongoDB with the official driver, Redis caching — complete with query optimization, connection pooling, and migration patterns.
        - generic [ref=e335]:
          - img [ref=e337]
          - generic [ref=e341]:
            - heading "10 Capstone Projects" [level=3] [ref=e342]
            - paragraph [ref=e343]: URL Shortener, Auth Service, E-commerce Backend, Real-Time Chat, Notification Service, Job Queue, File Upload Service, API Gateway, Task Scheduler, Microservices Platform.
        - generic [ref=e344]:
          - img [ref=e346]
          - generic [ref=e349]:
            - heading "Testing from Chapter 1" [level=3] [ref=e350]
            - paragraph [ref=e351]: Unit tests, table-driven tests, benchmarks, race detection, integration tests, and mocking strategies — testing is a first-class citizen throughout.
        - generic [ref=e352]:
          - img [ref=e354]
          - generic [ref=e358]:
            - heading "Generics & Modern Go" [level=3] [ref=e359]
            - paragraph [ref=e360]: Complete coverage of Go 1.18+ generics, type constraints, type inference, and how to use generics without over-engineering your codebase.
        - generic [ref=e361]:
          - img [ref=e363]
          - generic [ref=e366]:
            - heading "300+ Interview Q&A" [level=3] [ref=e367]
            - paragraph [ref=e368]: A dedicated appendix with 300+ Go interview questions and answers covering runtime internals, concurrency, APIs, and system design.
    - generic [ref=e370]:
      - generic [ref=e371]:
        - generic [ref=e372]: Who Is This For
        - heading "Built for engineers at every stage" [level=2] [ref=e373]:
          - text: Built for engineers
          - text: at every stage
        - paragraph [ref=e374]: Whether you're just starting with Go or architecting distributed systems — this handbook has something that levels you up.
      - generic [ref=e375]:
        - generic [ref=e376]:
          - img [ref=e378]
          - generic [ref=e381]:
            - heading "Students & Beginners" [level=3] [ref=e382]
            - paragraph [ref=e383]: Building your first backend in Go? This handbook takes you from zero syntax knowledge to building real APIs with solid foundations.
          - generic [ref=e384]:
            - generic [ref=e385]: Start from scratch
            - generic [ref=e386]: Structured learning
        - generic [ref=e387]:
          - img [ref=e389]
          - generic [ref=e393]:
            - heading "Backend Developers" [level=3] [ref=e394]
            - paragraph [ref=e395]: Already building backends in Node, Python, or Java? Level up with Go's concurrency model and type system to write faster, safer services.
          - generic [ref=e396]:
            - generic [ref=e397]: Language migration
            - generic [ref=e398]: Production patterns
        - generic [ref=e399]:
          - img [ref=e401]
          - generic [ref=e404]:
            - heading "Working Engineers" [level=3] [ref=e405]
            - paragraph [ref=e406]: Mid-level engineers looking to sharpen their Go skills, understand internals, and adopt senior-level architectural patterns.
          - generic [ref=e407]:
            - generic [ref=e408]: Deep internals
            - generic [ref=e409]: Architecture patterns
        - generic [ref=e410]:
          - img [ref=e412]
          - generic [ref=e417]:
            - heading "Switching to Go" [level=3] [ref=e418]
            - paragraph [ref=e419]: Migrating your team or personal stack to Go? Get up to speed with Go-specific idioms, tooling, and ecosystem best practices.
          - generic [ref=e420]:
            - generic [ref=e421]: Idiomatic Go
            - generic [ref=e422]: Ecosystem tooling
        - generic [ref=e423]:
          - img [ref=e425]
          - generic [ref=e430]:
            - heading "Startup Engineers" [level=3] [ref=e431]
            - paragraph [ref=e432]: Building fast at a startup? Learn how to design Go services that scale without premature complexity — practical and pragmatic.
          - generic [ref=e433]:
            - generic [ref=e434]: Move fast
            - generic [ref=e435]: Scalable architecture
        - generic [ref=e436]:
          - img [ref=e438]
          - generic [ref=e443]:
            - heading "Systems Design Learners" [level=3] [ref=e444]
            - paragraph [ref=e445]: Understand how Go powers real distributed systems — microservices, message queues, service meshes, and more.
          - generic [ref=e446]:
            - generic [ref=e447]: Distributed systems
            - generic [ref=e448]: Microservices
        - generic [ref=e449]:
          - img [ref=e451]
          - generic [ref=e457]:
            - heading "Interview Prep" [level=3] [ref=e458]
            - paragraph [ref=e459]: Preparing for senior backend or SWE interviews? Go is increasingly preferred — master it with depth that impresses interviewers.
          - generic [ref=e460]:
            - generic [ref=e461]: Interview mastery
            - generic [ref=e462]: Senior engineering
    - generic [ref=e465]:
      - generic [ref=e466]:
        - generic [ref=e467]:
          - generic [ref=e468]: Free Preview
          - heading "Read 100 pages before you buy" [level=2] [ref=e469]:
            - text: Read 100 pages
            - text: before you buy
          - paragraph [ref=e470]: The free sample includes the complete table of contents, all of Chapter 1 in full, and chapter previews from all 7 parts. No registration. No email.
        - list [ref=e471]:
          - listitem [ref=e472]:
            - img [ref=e474]
            - text: Complete table of contents — all 102 chapters
          - listitem [ref=e476]:
            - img [ref=e478]
            - text: "Full Chapter 1: Why Go? Philosophy & Toolchain"
          - listitem [ref=e480]:
            - img [ref=e482]
            - text: Chapter previews from all 7 parts
          - listitem [ref=e484]:
            - img [ref=e486]
            - text: 315 runnable programs sample included
          - listitem [ref=e488]:
            - img [ref=e490]
            - text: No email or registration required
        - generic [ref=e492]:
          - button "Preview Book" [ref=e493]:
            - img [ref=e494]
            - text: Preview Book
          - generic [ref=e497]:
            - img [ref=e498]
            - text: 2.7 MB · 100 pages
      - generic [ref=e501]:
        - generic [ref=e503]:
          - img "Deep Dive Into Go — book cover" [ref=e507]
          - generic [ref=e508]: ₹149
          - generic [ref=e509]:
            - img [ref=e510]
            - text: 100-page free sample
        - generic [ref=e512]:
          - generic [ref=e515]:
            - generic [ref=e516]: Chapter 1
            - generic [ref=e517]: Why Go? Philosophy & Toolchain
          - generic [ref=e537]:
            - generic [ref=e538]: Chapter 19
            - generic [ref=e539]: Goroutines & the Scheduler
          - generic [ref=e559]:
            - generic [ref=e560]: Chapter 47
            - generic [ref=e561]: REST APIs with net/http
    - generic [ref=e580]:
      - generic [ref=e581]:
        - generic [ref=e582]: Pricing
        - heading "One-time. Forever yours." [level=2] [ref=e583]
        - paragraph [ref=e584]: No subscriptions. No recurring fees. Pay once, own it permanently.
      - generic [ref=e588]:
        - generic [ref=e589]:
          - generic [ref=e590]:
            - generic [ref=e591]: Deep Dive Into Go
            - generic [ref=e592]: Complete Ebook
          - generic [ref=e593]: Launch Price
        - generic [ref=e594]:
          - generic [ref=e595]: ₹149
          - generic [ref=e596]:
            - generic [ref=e597]: ₹999
            - generic [ref=e598]: 85% OFF
        - list [ref=e600]:
          - listitem [ref=e601]:
            - img [ref=e603]
            - text: Instant PDF delivery to your email
          - listitem [ref=e606]:
            - img [ref=e608]
            - text: Lifetime access — no expiry
          - listitem [ref=e610]:
            - img [ref=e612]
            - text: Free future edition updates
          - listitem [ref=e617]:
            - img [ref=e619]
            - text: 102 chapters · 315 runnable programs
          - listitem [ref=e622]:
            - img [ref=e624]
            - text: Email support included
          - listitem [ref=e627]:
            - img [ref=e629]
            - text: Secure one-time payment
        - button "Buy Now — ₹149" [ref=e631]:
          - img [ref=e632]
          - text: Buy Now — ₹149
        - generic [ref=e635]:
          - generic [ref=e636]:
            - img [ref=e637]
            - text: Secure checkout
          - generic [ref=e639]: ·
          - generic [ref=e640]: One-time payment
          - generic [ref=e641]: ·
          - generic [ref=e642]: Instant delivery
        - generic [ref=e643]:
          - generic [ref=e644]: UPI
          - generic [ref=e645]: Cards
          - generic [ref=e646]: Net Banking
          - generic [ref=e647]: Wallets
    - generic [ref=e649]:
      - generic [ref=e650]:
        - generic [ref=e651]: Testimonials
        - heading "What engineers are saying" [level=2] [ref=e652]
        - paragraph [ref=e653]: From students to senior engineers at top Indian tech companies — here's what readers think.
      - generic [ref=e654]:
        - generic [ref=e655]:
          - generic [ref=e656]:
            - img [ref=e657]
            - img [ref=e659]
            - img [ref=e661]
            - img [ref=e663]
            - img [ref=e665]
          - generic [ref=e667]:
            - paragraph [ref=e668]: “The concurrency chapters alone are worth the price. Finally a resource that explains goroutine scheduling, channel semantics, and select patterns in a way that actually sticks. Exactly the depth I needed as someone who was already "using" Go but not really understanding it.”
            - paragraph [ref=e669]: “The concurrency chapters alone are worth the price.”
          - generic [ref=e670]:
            - generic [ref=e672]: AM
            - generic [ref=e673]:
              - generic [ref=e674]: Arjun Mehta
              - generic [ref=e675]: Senior Backend Engineer · Razorpay
        - generic [ref=e676]:
          - generic [ref=e677]:
            - img [ref=e678]
            - img [ref=e680]
            - img [ref=e682]
            - img [ref=e684]
            - img [ref=e686]
          - generic [ref=e688]:
            - paragraph [ref=e689]: “I came from a Node.js background and was struggling with how to think in Go. This ebook doesn't just show you syntax — it shows you the Go way. The clean architecture section changed how I structure my services. Shipped my first production Go API two weeks after reading.”
            - paragraph [ref=e690]: “It shows you the Go way.”
          - generic [ref=e691]:
            - generic [ref=e693]: PN
            - generic [ref=e694]:
              - generic [ref=e695]: Priya Nair
              - generic [ref=e696]: Full Stack Developer · Startup — Bangalore
        - generic [ref=e697]:
          - generic [ref=e698]:
            - img [ref=e699]
            - img [ref=e701]
            - img [ref=e703]
            - img [ref=e705]
            - img [ref=e707]
          - generic [ref=e709]:
            - paragraph [ref=e710]: “Used this to prepare for my L5 backend interviews. The PostgreSQL, Redis, and microservices chapters gave me exactly the talking points and code patterns I needed. Got the offer. The price-to-value ratio here is insane — ₹149 for this quality of content.”
            - paragraph [ref=e711]: “Got the offer. Price-to-value ratio is insane.”
          - generic [ref=e712]:
            - generic [ref=e714]: RS
            - generic [ref=e715]:
              - generic [ref=e716]: Rohit Sharma
              - generic [ref=e717]: SDE-2 · Zomato
        - generic [ref=e718]:
          - generic [ref=e719]:
            - img [ref=e720]
            - img [ref=e722]
            - img [ref=e724]
            - img [ref=e726]
            - img [ref=e728]
          - generic [ref=e730]:
            - paragraph [ref=e731]: “The memory management and escape analysis section in Part II is something I've never seen covered this well in any free resource. If you care about performance and actually understanding what the Go runtime is doing — this is essential reading.”
            - paragraph [ref=e732]: “Essential reading if you care about performance.”
          - generic [ref=e733]:
            - generic [ref=e735]: KR
            - generic [ref=e736]:
              - generic [ref=e737]: Kavya Reddy
              - generic [ref=e738]: Systems Engineer · CRED
        - generic [ref=e739]:
          - generic [ref=e740]:
            - img [ref=e741]
            - img [ref=e743]
            - img [ref=e745]
            - img [ref=e747]
            - img [ref=e749]
          - generic [ref=e751]:
            - paragraph [ref=e752]: “Clear, dense, no fluff. Every chapter respects your time and gets straight to the engineering substance. The Docker and deployment chapters are production-accurate — not the hello-world nonsense you find on blogs. Recommended for any Go developer who's serious.”
            - paragraph [ref=e753]: “Clear, dense, no fluff.”
          - generic [ref=e754]:
            - generic [ref=e756]: NV
            - generic [ref=e757]:
              - generic [ref=e758]: Nikhil Verma
              - generic [ref=e759]: Backend Developer · Freshworks
        - generic [ref=e760]:
          - generic [ref=e761]:
            - img [ref=e762]
            - img [ref=e764]
            - img [ref=e766]
            - img [ref=e768]
            - img [ref=e770]
          - generic [ref=e772]:
            - paragraph [ref=e773]: “As a student learning backend for the first time, I was intimidated. But this ebook walks you through Go fundamentals so cleanly, and by Part IV I was building my own REST API with JWT auth. Now preparing for placement interviews with the concurrency and system design sections.”
            - paragraph [ref=e774]: “By Part IV I was building my own REST API.”
          - generic [ref=e775]:
            - generic [ref=e777]: AI
            - generic [ref=e778]:
              - generic [ref=e779]: Ananya Iyer
              - generic [ref=e780]: CS Student · IIT Bombay
    - generic [ref=e783]:
      - generic [ref=e784]:
        - generic [ref=e785]: FAQ
        - heading "Common questions" [level=2] [ref=e786]:
          - text: Common
          - text: questions
        - paragraph [ref=e787]:
          - text: Everything you need to know before purchasing. Still have questions? Email
          - link "support@bluezoid.in" [ref=e788] [cursor=pointer]:
            - /url: mailto:support@bluezoid.in
      - generic [ref=e789]:
        - button "Is this ebook beginner friendly?" [ref=e791]:
          - generic [ref=e792]: Is this ebook beginner friendly?
          - img [ref=e794]
        - button "Is this a physical book?" [ref=e796]:
          - generic [ref=e797]: Is this a physical book?
          - img [ref=e799]
        - button "How do I receive the ebook after purchase?" [ref=e801]:
          - generic [ref=e802]: How do I receive the ebook after purchase?
          - img [ref=e804]
        - button "How long do I get access?" [ref=e806]:
          - generic [ref=e807]: How long do I get access?
          - img [ref=e809]
        - button "Are future updates included?" [ref=e811]:
          - generic [ref=e812]: Are future updates included?
          - img [ref=e814]
        - button "Can I read this on mobile or tablet?" [ref=e816]:
          - generic [ref=e817]: Can I read this on mobile or tablet?
          - img [ref=e819]
        - button "What payment methods are supported?" [ref=e821]:
          - generic [ref=e822]: What payment methods are supported?
          - img [ref=e824]
        - button "Do you provide refunds?" [ref=e826]:
          - generic [ref=e827]: Do you provide refunds?
          - img [ref=e829]
    - generic [ref=e832]:
      - generic [ref=e833]:
        - generic [ref=e834]: Get Started Today
        - heading "Stop watching tutorials. Start shipping Go." [level=2] [ref=e835]:
          - text: Stop watching tutorials.
          - text: Start shipping Go.
        - paragraph [ref=e836]: The gap between knowing Go syntax and building production-grade systems is what this ebook closes. Join hundreds of engineers who made the leap.
      - generic [ref=e837]:
        - button "Get the Ebook — ₹149" [ref=e838]:
          - img [ref=e839]
          - text: Get the Ebook — ₹149
          - img [ref=e842]
        - paragraph [ref=e844]: One-time · Instant delivery · Lifetime access
      - generic [ref=e845]:
        - generic [ref=e846]:
          - generic [ref=e847]:
            - generic [ref=e849]: AM
            - generic [ref=e851]: PR
            - generic [ref=e853]: RS
            - generic [ref=e855]: KV
            - generic [ref=e857]: NI
          - generic [ref=e858]: 500+ engineers reading
        - generic [ref=e859]:
          - generic [ref=e860]: ★★★★★
          - generic [ref=e861]: 5.0 rating
  - contentinfo [ref=e862]:
    - generic [ref=e863]:
      - generic [ref=e864]:
        - generic [ref=e865]:
          - generic [ref=e866]:
            - generic [ref=e868]: B
            - generic [ref=e869]: Bluezoid
          - paragraph [ref=e870]: Premium engineering products for modern developers.
          - link "support@bluezoid.in" [ref=e871] [cursor=pointer]:
            - /url: mailto:support@bluezoid.in
        - navigation [ref=e872]:
          - link "Privacy Policy" [ref=e873] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Service" [ref=e874] [cursor=pointer]:
            - /url: /terms
          - link "Refund & Cancellation" [ref=e875] [cursor=pointer]:
            - /url: /refund
      - generic [ref=e876]:
        - paragraph [ref=e877]: © 2026 Bluezoid. All rights reserved.
        - paragraph [ref=e878]: Deep Dive Into Go · Digital Product
  - button "Open Next.js Dev Tools" [ref=e884] [cursor=pointer]:
    - img [ref=e885]
  - alert [ref=e888]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { LandingPage } from '../page-objects/LandingPage';
  3   | 
  4   | test.describe('Landing Page', () => {
  5   |   test('loads and shows the hero heading', async ({ page }) => {
  6   |     const lp = new LandingPage(page);
  7   |     await lp.goto();
  8   | 
  9   |     await expect(lp.heroHeading).toBeVisible();
  10  |     await expect(page.getByText('Deep Dive')).toBeVisible();
  11  |     await expect(page.getByText('Into Go')).toBeVisible();
  12  |   });
  13  | 
  14  |   test('page title contains the book name', async ({ page }) => {
  15  |     await page.goto('/products/deep-dive-into-go');
  16  |     await expect(page).toHaveTitle(/deep dive into go/i);
  17  |   });
  18  | 
  19  |   test('book cover image loads without error', async ({ page }) => {
  20  |     const lp = new LandingPage(page);
  21  |     await lp.goto();
  22  | 
  23  |     await expect(lp.coverImage).toBeVisible();
  24  |     // Verify the image actually loaded (naturalWidth > 0)
  25  |     const naturalWidth = await lp.coverImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
  26  |     expect(naturalWidth).toBeGreaterThan(0);
  27  |   });
  28  | 
  29  |   test('Buy Now button is visible and clickable', async ({ page }) => {
  30  |     const lp = new LandingPage(page);
  31  |     await lp.goto();
  32  |     await expect(lp.buyNowButton).toBeVisible();
  33  |     await expect(lp.buyNowButton).toBeEnabled();
  34  |   });
  35  | 
  36  |   test('Preview Book button is visible', async ({ page }) => {
  37  |     const lp = new LandingPage(page);
  38  |     await lp.goto();
  39  |     await expect(lp.previewBookButton).toBeVisible();
  40  |   });
  41  | 
  42  |   test('JSON-LD Product structured data is present in head', async ({ page }) => {
  43  |     await page.goto('/products/deep-dive-into-go');
  44  | 
  45  |     const jsonLd = await page.$eval(
  46  |       'script[type="application/ld+json"]',
  47  |       (el) => JSON.parse(el.textContent ?? '{}')
  48  |     );
  49  | 
  50  |     // May be an array of schemas or a single one
  51  |     const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  52  |     const product = schemas.find((s: { '@type': string }) => s['@type'] === 'Product');
  53  |     expect(product).toBeDefined();
  54  |     expect(product.name).toMatch(/deep dive into go/i);
  55  |   });
  56  | 
  57  |   test('OG meta tags are present', async ({ page }) => {
  58  |     await page.goto('/products/deep-dive-into-go');
  59  | 
  60  |     const ogTitle = await page.$eval(
  61  |       'meta[property="og:title"]',
  62  |       (el) => el.getAttribute('content')
  63  |     );
  64  |     expect(ogTitle).toMatch(/deep dive into go/i);
  65  |   });
  66  | 
  67  |   test('canonical link tag is present', async ({ page }) => {
  68  |     await page.goto('/products/deep-dive-into-go');
  69  | 
  70  |     const canonical = await page.$eval(
  71  |       'link[rel="canonical"]',
  72  |       (el) => el.getAttribute('href')
  73  |     );
  74  |     expect(canonical).toContain('/products/deep-dive-into-go');
  75  |   });
  76  | 
  77  |   test('FAQ section renders at least 6 questions', async ({ page }) => {
  78  |     await page.goto('/products/deep-dive-into-go');
  79  |     await page.getByText(/frequently asked/i).scrollIntoViewIfNeeded();
  80  | 
  81  |     const faqButtons = page.getByRole('button').filter({ hasText: /\?/ });
  82  |     await expect(faqButtons).toHaveCount({ minimum: 6 } as Parameters<typeof expect>[0] extends never ? never : never);
  83  |     // Simpler assertion
  84  |     const count = await page.getByRole('button').filter({ hasText: /\?/ }).count();
  85  |     expect(count).toBeGreaterThanOrEqual(6);
  86  |   });
  87  | 
  88  |   test('FAQ item expands on click', async ({ page }) => {
  89  |     await page.goto('/products/deep-dive-into-go');
> 90  |     await page.getByText(/frequently asked/i).scrollIntoViewIfNeeded();
      |                                               ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 30000ms exceeded.
  91  | 
  92  |     const firstFaqBtn = page.getByRole('button').filter({ hasText: /\?/ }).first();
  93  |     await firstFaqBtn.click();
  94  |     await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');
  95  |   });
  96  | 
  97  |   test('footer is present with support email', async ({ page }) => {
  98  |     await page.goto('/products/deep-dive-into-go');
  99  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  100 | 
  101 |     await expect(page.getByText(/support@bluezoid\.in/i).first()).toBeVisible();
  102 |   });
  103 | 
  104 |   test('pricing card shows ₹149 and 85% OFF', async ({ page }) => {
  105 |     await page.goto('/products/deep-dive-into-go');
  106 |     await expect(page.getByText('85% OFF').first()).toBeVisible();
  107 |   });
  108 | });
  109 | 
```