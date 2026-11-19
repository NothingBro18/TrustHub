# Architecture Diagram

TrustHub is a React and Express web application backed by MongoDB. The diagrams summarize the deployed application layers and the principal interactions between frontend, API, and persistence components.

## Application Architecture

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart TD
    subgraph Client["Client Layer"]
        Browser["Web Browser"]
        React["React 19 and Vite"]
    end
    subgraph App["Application Layer"]
        API["Node.js and Express API"]
        Auth["JWT and role middleware"]
        Controllers["Controllers and booking policy"]
    end
    subgraph Data["Data Layer"]
        Models["Mongoose models"]
        DB[("MongoDB")]
        Uploads[("Server upload files")]
    end
    subgraph External["Optional Integrations"]
        OAuth["Google and GitHub OAuth"]
        SMTP["SMTP email"]
    end

    Browser -->|"uses"| React
    React -->|"HTTP requests"| API
    API -->|"authenticates protected requests"| Auth
    API -->|"routes requests"| Controllers
    Controllers -->|"queries and updates"| Models
    Models -->|"CRUD operations"| DB
    Controllers -->|"stores and serves images"| Uploads
    API -->|"sign in when configured"| OAuth
    Controllers -->|"password reset email"| SMTP
```

### Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---:|---|
| Client | React | 19 | User interface and role-specific experiences |
| Client tooling | Vite | 8 | Development server and production build |
| API | Node.js | 20.19+ or 22.12+ | JavaScript runtime |
| API framework | Express | 4 | REST endpoints and middleware |
| Data access | Mongoose | 8 | MongoDB models and validation |
| Database | MongoDB | Not specified | Persistent application data |
| Authentication | JWT and bcryptjs | Package versions in manifests | Authenticated sessions and password hashing |

### Data Storage & External Services

MongoDB stores users, provider profiles, service listings, bookings, reviews, messages, notifications, and flagged activities. Uploaded booking images are served from server-side upload storage. Google/GitHub OAuth and SMTP email are optional integrations that require deployment-specific credentials and callback/configuration.

### Key Architectural Decisions

- The application separates the React client from the Express API.
- Backend routes, controllers, Mongoose models, middleware, and utilities are organized by responsibility.
- Customer, provider, and administrator access is protected by authentication, role checks, and resource ownership rules.

## Component Relationships

<!-- mermaid-checked: no \n, no em-dash/en-dash, no {} in labels, subgraphs are id["label"], arrows are -->|"label"|, all subgraphs closed by end, ids unique -->
```mermaid
flowchart LR
    subgraph Presentation["Presentation Layer"]
        cPages["React pages"]
        cRoutes["Router and protected routes"]
        cAuth["Authentication context"]
    end
    subgraph ApiLayer["API Layer"]
        cRoutesApi["Express routes"]
        cAuthMw["Authentication middleware"]
        cController["Feature controllers"]
        cBooking["Booking policy"]
    end
    subgraph Persistence["Persistence Layer"]
        cModels["Mongoose models"]
        cDatabase[("MongoDB")]
    end
    subgraph Crosscut["Cross Cutting Components"]
        cNotify["Notification utility"]
        cUpload["Upload middleware"]
        cError["Error handler"]
    end

    cPages -->|"renders user flows"| cRoutes
    cRoutes -->|"requests API data"| cRoutesApi
    cRoutesApi -->|"protects private routes"| cAuthMw
    cAuthMw -->|"authorizes request"| cController
    cController -->|"checks state transitions"| cBooking
    cController -->|"reads and writes"| cModels
    cModels -->|"persists documents"| cDatabase
    cController -->|"creates alerts"| cNotify
    cRoutesApi -->|"handles image uploads"| cUpload
    cController -.->|"forwards errors"| cError
```

### Component Inventory

| Component | Layer | Type | Responsibility |
|---|---|---|---|
| React pages | Presentation | Pages | Render public and role-specific workflows |
| Router and protected routes | Presentation | Routing | Map URLs to pages and restrict frontend routes by role |
| Authentication context | Presentation | State context | Provide the active user/session to client pages |
| Express routes | API | Routes | Map HTTP paths to controller operations |
| Authentication middleware | API | Middleware | Authenticate requests and enforce access roles |
| Feature controllers | API | Controllers | Validate requests and apply feature behavior |
| Booking policy | API | Utility | Validate booking transitions, appointment details, and payment amount rules |
| Mongoose models | Persistence | Data models | Define document schemas, references, and validation |
| MongoDB | Persistence | Database | Store application records |
| Notification utility | Cross-cutting | Utility | Create notifications for application events |
| Upload middleware | Cross-cutting | Middleware | Accept and store uploaded images |
| Error handler | Cross-cutting | Middleware | Convert propagated errors into API responses |
