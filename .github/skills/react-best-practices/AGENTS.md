# React Best Practices

**Version 1.0.0**  
Vercel Engineering  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring React and Next.js codebases. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive performance optimization guide for React and Next.js applications,
designed for AI agents and LLMs. Contains 40+ rules across 8 categories,
prioritized by impact from critical (eliminating waterfalls, reducing bundle size)
to incremental (advanced patterns). Each rule includes detailed explanations,
real-world examples comparing incorrect vs. correct implementations, and specific
impact metrics to guide automated refactoring and code generation.

---

## Table of Contents

1. [Eliminating Waterfalls](#1-eliminating-waterfalls) — **CRITICAL**
   - 1.1 [Check Cheap Conditions Before Async Flags](#11-check-cheap-conditions-before-async-flags)
   - 1.2 [Defer Await Until Needed](#12-defer-await-until-needed)
   - 1.3 [Dependency-Based Parallelization](#13-dependency-based-parallelization)
   - 1.4 [Prevent Waterfall Chains in API Routes](#14-prevent-waterfall-chains-in-api-routes)
   - 1.5 [Promise.all() for Independent Operations](#15-promiseall-for-independent-operations)
   - 1.6 [Strategic Suspense Boundaries](#16-strategic-suspense-boundaries)
2. [Bundle Size Optimization](#2-bundle-size-optimization) — **CRITICAL**
   - 2.1 [Avoid Barrel File Imports](#21-avoid-barrel-file-imports)
   - 2.2 [Conditional Module Loading](#22-conditional-module-loading)
   - 2.3 [Defer Non-Critical Third-Party Libraries](#23-defer-non-critical-third-party-libraries)
   - 2.4 [Dynamic Imports for Heavy Components](#24-dynamic-imports-for-heavy-components)
   - 2.5 [Prefer Statically Analyzable Paths](#25-prefer-statically-analyzable-paths)
   - 2.6 [Preload Based on User Intent](#26-preload-based-on-user-intent)
3. [Server-Side Performance](#3-server-side-performance) — **HIGH**
   - 3.1 [Authenticate Server Actions Like API Routes](#31-authenticate-server-actions-like-api-routes)
   - 3.2 [Avoid Duplicate Serialization in RSC Props](#32-avoid-duplicate-serialization-in-rsc-props)
   - 3.3 [Avoid Shared Module State for Request Data](#33-avoid-shared-module-state-for-request-data)
   - 3.4 [Cross-Request LRU Caching](#34-cross-request-lru-caching)
   - 3.5 [Hoist Static I/O to Module Level](#35-hoist-static-io-to-module-level)
   - 3.6 [Minimize Serialization at RSC Boundaries](#36-minimize-serialization-at-rsc-boundaries)
   - 3.7 [Parallel Data Fetching with Component Composition](#37-parallel-data-fetching-with-component-composition)
   - 3.8 [Parallel Nested Data Fetching](#38-parallel-nested-data-fetching)
   - 3.9 [Per-Request Deduplication with React.cache()](#39-per-request-deduplication-with-reactcache)
   - 3.10 [Use after() for Non-Blocking Operations](#310-use-after-for-non-blocking-operations)
4. [Client-Side Data Fetching](#4-client-side-data-fetching) — **MEDIUM-HIGH**
   - 4.1 [Deduplicate Global Event Listeners](#41-deduplicate-global-event-listeners)
   - 4.2 [Use Passive Event Listeners for Scrolling Performance](#42-use-passive-event-listeners-for-scrolling-performance)
   - 4.3 [Use SWR for Automatic Deduplication](#43-use-swr-for-automatic-deduplication)
   - 4.4 [Version and Minimize localStorage Data](#44-version-and-minimize-localstorage-data)
5. [Re-render Optimization](#5-re-render-optimization) — **MEDIUM**
   - 5.1 [Calculate Derived State During Rendering](#51-calculate-derived-state-during-rendering)
   - 5.2 [Defer State Reads to Usage Point](#52-defer-state-reads-to-usage-point)
   - 5.3 [Do not wrap a simple expression with a primitive result type in useMemo](#53-do-not-wrap-a-simple-expression-with-a-primitive-result-type-in-usememo)
   - 5.4 [Don't Define Components Inside Components](#54-dont-define-components-inside-components)
   - 5.5 [Extract Default Non-primitive Parameter Value from Memoized Component to Constant](#55-extract-default-non-primitive-parameter-value-from-memoized-component-to-constant)
   - 5.6 [Extract to Memoized Components](#56-extract-to-memoized-components)
   - 5.7 [Narrow Effect Dependencies](#57-narrow-effect-dependencies)
   - 5.8 [Put Interaction Logic in Event Handlers](#58-put-interaction-logic-in-event-handlers)
   - 5.9 [Split Combined Hook Computations](#59-split-combined-hook-computations)
   - 5.10 [Subscribe to Derived State](#510-subscribe-to-derived-state)
   - 5.11 [Use Functional setState Updates](#511-use-functional-setstate-updates)
   - 5.12 [Use Lazy State Initialization](#512-use-lazy-state-initialization)
   - 5.13 [Use Transitions for Non-Urgent Updates](#513-use-transitions-for-non-urgent-updates)
   - 5.14 [Use useDeferredValue for Expensive Derived Renders](#514-use-usedeferredvalue-for-expensive-derived-renders)
   - 5.15 [Use useRef for Transient Values](#515-use-useref-for-transient-values)
6. [Rendering Performance](#6-rendering-performance) — **MEDIUM**
   - 6.1 [Animate SVG Wrapper Instead of SVG Element](#61-animate-svg-wrapper-instead-of-svg-element)
   - 6.2 [CSS content-visibility for Long Lists](#62-css-content-visibility-for-long-lists)
   - 6.3 [Hoist Static JSX Elements](#63-hoist-static-jsx-elements)
   - 6.4 [Optimize SVG Precision](#64-optimize-svg-precision)
   - 6.5 [Prevent Hydration Mismatch Without Flickering](#65-prevent-hydration-mismatch-without-flickering)
   - 6.6 [Suppress Expected Hydration Mismatches](#66-suppress-expected-hydration-mismatches)
   - 6.7 [Use Activity Component for Show/Hide](#67-use-activity-component-for-showhide)
   - 6.8 [Use defer or async on Script Tags](#68-use-defer-or-async-on-script-tags)
   - 6.9 [Use Explicit Conditional Rendering](#69-use-explicit-conditional-rendering)
   - 6.10 [Use React DOM Resource Hints](#610-use-react-dom-resource-hints)
   - 6.11 [Use useTransition Over Manual Loading States](#611-use-usetransition-over-manual-loading-states)
7. [JavaScript Performance](#7-javascript-performance) — **LOW-MEDIUM**
   - 7.1 [Avoid Layout Thrashing](#71-avoid-layout-thrashing)
   - 7.2 [Build Index Maps for Repeated Lookups](#72-build-index-maps-for-repeated-lookups)
   - 7.3 [Cache Property Access in Loops](#73-cache-property-access-in-loops)
   - 7.4 [Cache Repeated Function Calls](#74-cache-repeated-function-calls)
   - 7.5 [Cache Storage API Calls](#75-cache-storage-api-calls)
   - 7.6 [Combine Multiple Array Iterations](#76-combine-multiple-array-iterations)
   - 7.7 [Defer Non-Critical Work with requestIdleCallback](#77-defer-non-critical-work-with-requestidlecallback)
   - 7.8 [Early Length Check for Array Comparisons](#78-early-length-check-for-array-comparisons)
   - 7.9 [Early Return from Functions](#79-early-return-from-functions)
   - 7.10 [Hoist RegExp Creation](#710-hoist-regexp-creation)
   - 7.11 [Use flatMap to Map and Filter in One Pass](#711-use-flatmap-to-map-and-filter-in-one-pass)
   - 7.12 [Use Loop for Min/Max Instead of Sort](#712-use-loop-for-minmax-instead-of-sort)
   - 7.13 [Use Set/Map for O(1) Lookups](#713-use-setmap-for-o1-lookups)
   - 7.14 [Use toSorted() Instead of sort() for Immutability](#714-use-tosorted-instead-of-sort-for-immutability)
8. [Advanced Patterns](#8-advanced-patterns) — **LOW**
   - 8.1 [Do Not Put Effect Events in Dependency Arrays](#81-do-not-put-effect-events-in-dependency-arrays)
   - 8.2 [Initialize App Once, Not Per Mount](#82-initialize-app-once-not-per-mount)
   - 8.3 [Store Event Handlers in Refs](#83-store-event-handlers-in-refs)
   - 8.4 [useEffectEvent for Stable Callback Refs](#84-useeffectevent-for-stable-callback-refs)

---

## 1. Eliminating Waterfalls

**Impact: CRITICAL**

Waterfalls are the #1 performance killer. Each sequential await adds full network latency. Eliminating them yields the largest gains.

### 1.1 Check Cheap Conditions Before Async Flags

**Impact: HIGH (avoids unnecessary async work when a synchronous guard already fails)**

When a branch uses `await` for a flag or remote value and also requires a **cheap synchronous** condition (local props, request metadata, already-loaded state), evaluate the cheap condition **first**. Otherwise you pay for the async call even when the compound condition can never be true.

**Incorrect:**

```typescript
const someFlag = await getFlag()

if (someFlag && someCondition) {
  // ...
}
```

**Correct:**

```typescript
if (someCondition) {
  const someFlag = await getFlag()
  if (someFlag) {
    // ...
  }
}
```

---

### 1.2 Defer Await Until Needed

**Impact: HIGH (avoids blocking unused code paths)**

Move `await` operations into the branches where they're actually used to avoid blocking code paths that don't need them.

**Incorrect: blocks both branches**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // Returns immediately but still waited for userData
    return { skipped: true }
  }

  // Only this branch uses userData
  return processUserData(userData)
}
```

**Correct: only blocks when needed**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Returns immediately without waiting
    return { skipped: true }
  }

  // Fetch only when needed
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

---

### 1.3 Dependency-Based Parallelization

**Impact: CRITICAL (2-10× improvement)**

For operations with partial dependencies, start independent operations immediately without awaiting.

**Incorrect: profile waits for config unnecessarily**

```typescript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)
```

**Correct: config and profile run in parallel**

```typescript
const userPromise = fetchUser()
const profilePromise = userPromise.then(user => fetchProfile(user.id))
const [user, config, profile] = await Promise.all([
  userPromise,
  fetchConfig(),
  profilePromise
])
```

---

### 1.4 Prevent Waterfall Chains in API Routes

**Impact: CRITICAL (2-10× improvement)**

In API routes, start independent operations immediately, even if you don't await them yet.

**Incorrect: config waits for auth, data waits for both**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**Correct: auth and config start immediately**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

---

### 1.5 Promise.all() for Independent Operations

**Impact: CRITICAL (2-10× improvement)**

When async operations have no interdependencies, execute them concurrently using `Promise.all()`.

**Incorrect: sequential execution, 3 round trips**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Correct: parallel execution, 1 round trip**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

---

### 1.6 Strategic Suspense Boundaries

**Impact: HIGH (faster initial paint)**

Instead of awaiting data in async components before returning JSX, use Suspense boundaries to show the wrapper UI faster while data loads.

**Incorrect: wrapper blocked by data fetching**

```tsx
async function Page() {
  const data = await fetchData() // Blocks entire page

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

**Correct: wrapper shows immediately, data streams in**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Only blocks this component
  return <div>{data.content}</div>
}
```

---

## 2. Bundle Size Optimization

**Impact: CRITICAL**

Reducing initial bundle size improves Time to Interactive and Largest Contentful Paint.

### 2.1 Avoid Barrel File Imports

**Impact: CRITICAL (200-800ms import cost, slow builds)**

Import directly from source files instead of barrel files to avoid loading thousands of unused modules.

**Incorrect: imports entire library**

```tsx
import { Check, X, Menu } from 'lucide-react'
// Loads 1,583 modules, takes ~2.8s extra in dev

import { Button, TextField } from '@mui/material'
// Loads 2,225 modules, takes ~4.2s extra in dev
```

**Correct - Direct imports:**

```tsx
import CheckIcon from 'lucide-react/dist/esm/icons/check'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// Loads only what you use
```

Libraries commonly affected: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@headlessui/react`, `@radix-ui/react-*`, `lodash`, `ramda`, `date-fns`, `rxjs`, `react-use`.

---

### 2.2 Conditional Module Loading

**Impact: HIGH (loads large data only when needed)**

Load large data or modules only when a feature is activated.

```tsx
function AnimationPlayer({ enabled, setEnabled }: { enabled: boolean; setEnabled: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then(mod => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

---

### 2.3 Defer Non-Critical Third-Party Libraries

**Impact: MEDIUM (loads after hydration)**

Analytics, logging, and error tracking don't block user interaction. Load them after hydration using `React.lazy()`.

---

### 2.4 Dynamic Imports for Heavy Components

**Impact: CRITICAL (directly affects TTI and LCP)**

Use `React.lazy()` to lazy-load large components not needed on initial render.

**Incorrect: MonacoEditor bundles with main chunk ~300KB**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**Correct: MonacoEditor loads on demand**

```tsx
const MonacoEditor = React.lazy(() =>
  import('./monaco-editor').then(m => ({ default: m.MonacoEditor }))
)

function CodePanel({ code }: { code: string }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <MonacoEditor value={code} />
    </Suspense>
  )
}
```

---

### 2.5 Prefer Statically Analyzable Paths

**Impact: HIGH (avoids accidental broad bundles)**

**Incorrect: the bundler cannot tell what may be imported**

```ts
const PAGE_MODULES = {
  home: './pages/home',
  settings: './pages/settings',
} as const

const Page = await import(PAGE_MODULES[pageName])
```

**Correct: use an explicit map of allowed modules**

```ts
const PAGE_MODULES = {
  home: () => import('./pages/home'),
  settings: () => import('./pages/settings'),
} as const

const Page = await PAGE_MODULES[pageName]()
```

---

### 2.6 Preload Based on User Intent

**Impact: MEDIUM (reduces perceived latency)**

Preload heavy bundles before they're needed.

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

---

## 3. Server-Side Performance

**Impact: HIGH**

Optimizing server-side rendering and data fetching eliminates server-side waterfalls and reduces response times.

> **Note:** Section 3 rules are primarily for Next.js (App Router, Server Components, Server Actions). For Vite/React SPA projects, focus on Sections 1, 2, 4–8.

### 3.1 Authenticate Server Actions Like API Routes

**Impact: CRITICAL (prevents unauthorized access)**

Server Actions are exposed as public endpoints. Always verify authentication **inside** each Server Action.

**Correct:**

```typescript
'use server'

export async function deleteUser(userId: string) {
  const session = await verifySession()
  if (!session) throw new Error('Unauthorized')
  if (session.user.role !== 'admin') throw new Error('Forbidden')

  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

---

### 3.2 Avoid Duplicate Serialization in RSC Props

**Impact: LOW**

RSC→client serialization deduplicates by object reference. Do transformations (`.toSorted()`, `.filter()`, `.map()`) in client, not server.

**Incorrect:**

```tsx
<ClientList usernames={usernames} usernamesOrdered={usernames.toSorted()} />
```

**Correct:**

```tsx
<ClientList usernames={usernames} />
// Client: const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

---

### 3.3 Avoid Shared Module State for Request Data

**Impact: HIGH (prevents concurrency bugs and request data leaks)**

Never use mutable module-level variables to share request-scoped data in Server Components.

**Incorrect:**

```tsx
let currentUser: User | null = null

export default async function Page() {
  currentUser = await auth() // Race condition!
  return <Dashboard />
}
```

**Correct:**

```tsx
export default async function Page() {
  const user = await auth()
  return <Dashboard user={user} />
}
```

---

### 3.4 Cross-Request LRU Caching

**Impact: HIGH (caches across requests)**

`React.cache()` only works within one request. For data shared across sequential requests, use an LRU cache.

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000  // 5 minutes
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

---

### 3.5 Hoist Static I/O to Module Level

**Impact: HIGH (avoids repeated file/network I/O per request)**

When loading static assets in route handlers, hoist the I/O to module level.

**Incorrect: reads font on every request**

```typescript
export async function GET(request: Request) {
  const fontData = await fetch(new URL('./fonts/Inter.ttf', import.meta.url))
    .then(res => res.arrayBuffer())
  // ...
}
```

**Correct: loads once at module initialization**

```typescript
const fontData = fetch(new URL('./fonts/Inter.ttf', import.meta.url))
  .then(res => res.arrayBuffer())

export async function GET(request: Request) {
  const font = await fontData
  // ...
}
```

---

### 3.6 Minimize Serialization at RSC Boundaries

**Impact: HIGH (reduces data transfer size)**

Only pass fields that the client actually uses.

**Incorrect:**

```tsx
async function Page() {
  const user = await fetchUser()  // 50 fields
  return <Profile user={user} />  // client uses 1 field
}
```

**Correct:**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}
```

---

### 3.7 Parallel Data Fetching with Component Composition

**Impact: CRITICAL (eliminates server-side waterfalls)**

**Incorrect: Sidebar waits for Page's fetch**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}
```

**Correct: both fetch simultaneously**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

---

### 3.8 Parallel Nested Data Fetching

**Impact: CRITICAL (eliminates server-side waterfalls)**

**Incorrect: a slow item blocks all nested fetches**

```tsx
const chats = await Promise.all(chatIds.map(id => getChat(id)))
const chatAuthors = await Promise.all(chats.map(chat => getUser(chat.author)))
```

**Correct: each item chains its own nested fetch**

```tsx
const chatAuthors = await Promise.all(
  chatIds.map(id => getChat(id).then(chat => getUser(chat.author)))
)
```

---

### 3.9 Per-Request Deduplication with React.cache()

**Impact: MEDIUM (deduplicates within request)**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({ where: { id: session.user.id } })
})
```

---

### 3.10 Use after() for Non-Blocking Operations

**Impact: MEDIUM (faster response times)**

Schedule logging/analytics after response is sent.

```tsx
import { after } from 'next/server'

export async function POST(request: Request) {
  await updateDatabase(request)

  after(async () => {
    await logUserAction({ ... })
  })

  return new Response(JSON.stringify({ status: 'success' }), { status: 200 })
}
```

---

## 4. Client-Side Data Fetching

**Impact: MEDIUM-HIGH**

Automatic deduplication and efficient data fetching patterns reduce redundant network requests.

### 4.1 Deduplicate Global Event Listeners

**Impact: LOW (single listener for N components)**

Use module-level maps to share global event listeners across component instances instead of registering one per component.

---

### 4.2 Use Passive Event Listeners for Scrolling Performance

**Impact: MEDIUM (eliminates scroll delay)**

Add `{ passive: true }` to touch and wheel event listeners.

**Incorrect:**

```typescript
document.addEventListener('touchstart', handleTouch)
document.addEventListener('wheel', handleWheel)
```

**Correct:**

```typescript
document.addEventListener('touchstart', handleTouch, { passive: true })
document.addEventListener('wheel', handleWheel, { passive: true })
```

Use passive when: tracking/analytics, logging, any listener that doesn't call `preventDefault()`.

---

### 4.3 Use TanStack Query / SWR for Automatic Deduplication

**Impact: MEDIUM-HIGH (automatic deduplication)**

This project uses TanStack Query. Multiple components using the same query key share one request.

**Incorrect: no deduplication, each instance fetches**

```tsx
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers)
  }, [])
}
```

**Correct: multiple instances share one request**

```tsx
function UserList() {
  const { data: users } = useQuery({ queryKey: QUERY_KEYS.users, queryFn: fetchUsers })
}
```

---

### 4.4 Version and Minimize localStorage Data

**Impact: MEDIUM (prevents schema conflicts)**

```typescript
const VERSION = 'v2'

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config))
  } catch {
    // Throws in incognito, quota exceeded, or disabled
  }
}

function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}
```

Always wrap localStorage calls in try-catch.

---

## 5. Re-render Optimization

**Impact: MEDIUM**

Reducing unnecessary re-renders minimizes wasted computation and improves UI responsiveness.

### 5.1 Calculate Derived State During Rendering

**Impact: MEDIUM (avoids redundant renders and state drift)**

If a value can be computed from current props/state, derive it during render — do not store it in state or sync it via `useEffect`.

**Incorrect:**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(firstName + ' ' + lastName)
  }, [firstName, lastName])

  return <p>{fullName}</p>
}
```

**Correct:**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName

  return <p>{fullName}</p>
}
```

Reference: https://react.dev/learn/you-might-not-need-an-effect

---

### 5.2 Defer State Reads to Usage Point

**Impact: MEDIUM (avoids unnecessary subscriptions)**

Don't subscribe to dynamic state if you only read it inside callbacks.

**Incorrect: subscribes to all searchParams changes**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

**Correct: reads on demand, no subscription**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>Share</button>
}
```

---

### 5.3 Do not wrap a simple expression with a primitive result type in useMemo

**Impact: LOW-MEDIUM (wasted computation on every render)**

When an expression is simple and has a primitive result type (boolean, number, string), do not wrap it in `useMemo`.

**Incorrect:**

```tsx
const isLoading = useMemo(() => {
  return user.isLoading || notifications.isLoading
}, [user.isLoading, notifications.isLoading])
```

**Correct:**

```tsx
const isLoading = user.isLoading || notifications.isLoading
```

---

### 5.4 Don't Define Components Inside Components

**Impact: HIGH (prevents remount on every render)**

Defining a component inside another creates a new component type on every render. React remounts it, destroying all state.

**Incorrect:**

```tsx
function UserProfile({ user, theme }) {
  const Avatar = () => (  // ❌ New component type every render
    <img src={user.avatarUrl} className={theme === 'dark' ? 'avatar-dark' : 'avatar-light'} />
  )

  return <div><Avatar /></div>
}
```

**Correct:**

```tsx
function Avatar({ src, theme }: { src: string; theme: string }) {
  return <img src={src} className={theme === 'dark' ? 'avatar-dark' : 'avatar-light'} />
}

function UserProfile({ user, theme }) {
  return <div><Avatar src={user.avatarUrl} theme={theme} /></div>
}
```

Symptoms of this bug: input fields lose focus on keystroke, animations restart, `useEffect` re-runs on every parent render.

---

### 5.5 Extract Default Non-primitive Parameter Value from Memoized Component to Constant

**Impact: MEDIUM (restores memoization)**

**Incorrect: `onClick` has different values on every rerender**

```tsx
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: { onClick?: () => void }) {
  // ...
})
```

**Correct: stable default value**

```tsx
const NOOP = () => {}

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: { onClick?: () => void }) {
  // ...
})
```

---

### 5.6 Extract to Memoized Components

**Impact: MEDIUM (enables early returns)**

Extract expensive work into memoized components to enable early returns before computation.

**Incorrect:**

```tsx
function Profile({ user, loading }: Props) {
  const avatar = useMemo(() => {
    const id = computeAvatarId(user)
    return <Avatar id={id} />
  }, [user])

  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}
```

**Correct:**

```tsx
const UserAvatar = memo(function UserAvatar({ user }: { user: User }) {
  const id = useMemo(() => computeAvatarId(user), [user])
  return <Avatar id={id} />
})

function Profile({ user, loading }: Props) {
  if (loading) return <Skeleton />
  return <div><UserAvatar user={user} /></div>
}
```

---

### 5.7 Narrow Effect Dependencies

**Impact: LOW (minimizes effect re-runs)**

**Incorrect: re-runs on any user field change**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user])
```

**Correct: re-runs only when id changes**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

---

### 5.8 Put Interaction Logic in Event Handlers

**Impact: MEDIUM (avoids effect re-runs and duplicate side effects)**

If a side effect is triggered by a specific user action, run it in that event handler.

**Incorrect:**

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (submitted) {
      post('/api/register')
      showToast('Registered', theme)
    }
  }, [submitted, theme])

  return <button onClick={() => setSubmitted(true)}>Submit</button>
}
```

**Correct:**

```tsx
function Form() {
  const theme = useContext(ThemeContext)

  function handleSubmit() {
    post('/api/register')
    showToast('Registered', theme)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

---

### 5.9 Split Combined Hook Computations

**Impact: MEDIUM (avoids recomputing independent steps)**

When a hook contains multiple independent tasks with different dependencies, split them.

**Incorrect: changing `sortOrder` recomputes filtering**

```tsx
const sortedProducts = useMemo(() => {
  const filtered = products.filter((p) => p.category === category)
  const sorted = filtered.toSorted((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  )
  return sorted
}, [products, category, sortOrder])
```

**Correct: filtering only recomputes when products or category change**

```tsx
const filteredProducts = useMemo(
  () => products.filter((p) => p.category === category),
  [products, category]
)

const sortedProducts = useMemo(
  () => filteredProducts.toSorted((a, b) =>
    sortOrder === "asc" ? a.price - b.price : b.price - a.price
  ),
  [filteredProducts, sortOrder]
)
```

---

### 5.10 Subscribe to Derived State

**Impact: MEDIUM (reduces re-render frequency)**

Subscribe to derived boolean state instead of continuous values.

**Incorrect: re-renders on every pixel change**

```tsx
function Sidebar() {
  const width = useWindowWidth()  // updates continuously
  const isMobile = width < 768
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

**Correct: re-renders only when boolean changes**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

---

### 5.11 Use Functional setState Updates

**Impact: MEDIUM (prevents stale closures)**

When updating state based on current value, use the functional form.

**Incorrect: requires state as dependency, risk of stale closure**

```tsx
const addItems = useCallback((newItems: Item[]) => {
  setItems([...items, ...newItems])
}, [items])  // recreated on every items change
```

**Correct: stable callback, no stale closures**

```tsx
const addItems = useCallback((newItems: Item[]) => {
  setItems(curr => [...curr, ...newItems])
}, [])  // no dependencies needed
```

---

### 5.12 Use Lazy State Initialization

**Impact: MEDIUM (wasted computation on every render)**

Pass a function to `useState` for expensive initial values.

**Incorrect: runs on every render**

```tsx
const [searchIndex, setSearchIndex] = useState(buildSearchIndex(items))
const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('settings') || '{}'))
```

**Correct: runs only once**

```tsx
const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem('settings')
  return stored ? JSON.parse(stored) : {}
})
```

---

### 5.13 Use Transitions for Non-Urgent Updates

**Impact: MEDIUM (maintains UI responsiveness)**

```tsx
import { startTransition } from 'react'

const handler = () => {
  startTransition(() => setScrollY(window.scrollY))
}
window.addEventListener('scroll', handler, { passive: true })
```

---

### 5.14 Use useDeferredValue for Expensive Derived Renders

**Impact: MEDIUM (keeps input responsive)**

**Incorrect: input feels laggy while filtering**

```tsx
function Search({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const filtered = items.filter(item => fuzzyMatch(item, query))

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultsList results={filtered} />
    </>
  )
}
```

**Correct: input stays snappy, results render when ready**

```tsx
function Search({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const filtered = useMemo(
    () => items.filter(item => fuzzyMatch(item, deferredQuery)),
    [items, deferredQuery]
  )
  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.7 : 1 }}>
        <ResultsList results={filtered} />
      </div>
    </>
  )
}
```

---

### 5.15 Use useRef for Transient Values

**Impact: MEDIUM (avoids unnecessary re-renders on frequent updates)**

When a value changes frequently and you don't want a re-render on every update, store it in `useRef`.

**Incorrect: renders every mousemove**

```tsx
const [lastX, setLastX] = useState(0)
useEffect(() => {
  const onMove = (e: MouseEvent) => setLastX(e.clientX)
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])
```

**Correct: no re-render for tracking**

```tsx
const lastXRef = useRef(0)
const dotRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const onMove = (e: MouseEvent) => {
    lastXRef.current = e.clientX
    const node = dotRef.current
    if (node) node.style.transform = `translateX(${e.clientX}px)`
  }
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])
```

---

## 6. Rendering Performance

**Impact: MEDIUM**

Optimizing the rendering process reduces the work the browser needs to do.

### 6.1 Animate SVG Wrapper Instead of SVG Element

**Impact: LOW (enables hardware acceleration)**

Many browsers don't have hardware acceleration for CSS animations on SVG elements. Wrap SVG in a `<div>` and animate the wrapper.

**Incorrect:**

```tsx
<svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="currentColor" />
</svg>
```

**Correct:**

```tsx
<div className="animate-spin">
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" />
  </svg>
</div>
```

---

### 6.2 CSS content-visibility for Long Lists

**Impact: HIGH (faster initial render)**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

For 1000 messages, browser skips layout/paint for ~990 off-screen items (10× faster initial render).

---

### 6.3 Hoist Static JSX Elements

**Impact: LOW (avoids re-creation)**

**Incorrect: recreates element every render**

```tsx
function Container() {
  return (
    <div>
      {loading && <div className="animate-pulse h-20 bg-gray-200" />}
    </div>
  )
}
```

**Correct: reuses same element**

```tsx
const loadingSkeleton = <div className="animate-pulse h-20 bg-gray-200" />

function Container() {
  return (
    <div>
      {loading && loadingSkeleton}
    </div>
  )
}
```

---

### 6.4 Optimize SVG Precision

**Impact: LOW (reduces file size)**

Reduce SVG coordinate precision. Automate with: `npx svgo --precision=1 --multipass icon.svg`

---

### 6.5 Prevent Hydration Mismatch Without Flickering

**Impact: MEDIUM (avoids visual flicker and hydration errors)**

For content depending on client-side storage, inject a synchronous script that updates the DOM before React hydrates.

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-wrapper">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  )
}
```

---

### 6.6 Suppress Expected Hydration Mismatches

**Impact: LOW-MEDIUM**

For intentionally different server/client values (timestamps, locale formatting), use `suppressHydrationWarning`.

```tsx
function Timestamp() {
  return <span suppressHydrationWarning>{new Date().toLocaleString()}</span>
}
```

Do not use this to hide real bugs.

---

### 6.7 Use Activity Component for Show/Hide

**Impact: MEDIUM (preserves state/DOM)**

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

---

### 6.8 Use defer or async on Script Tags

**Impact: HIGH (eliminates render-blocking)**

Script tags without `defer` or `async` block HTML parsing.

```html
<script src="analytics.js" async />
<script src="utils.js" defer />
```

---

### 6.9 Use Explicit Conditional Rendering

**Impact: LOW (prevents rendering 0 or NaN)**

Use ternary `? :` instead of `&&` when condition can be `0` or `NaN`.

**Incorrect: renders "0" when count is 0**

```tsx
{count && <span className="badge">{count}</span>}
```

**Correct:**

```tsx
{count > 0 ? <span className="badge">{count}</span> : null}
```

---

### 6.10 Use React DOM Resource Hints

**Impact: HIGH (reduces load time)**

```tsx
import { preconnect, prefetchDNS, preload } from 'react-dom'

export default function App() {
  prefetchDNS('https://analytics.example.com')
  preconnect('https://api.example.com')
  preload('/fonts/inter.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  return <main>{/* content */}</main>
}
```

---

### 6.11 Use useTransition Over Manual Loading States

**Impact: LOW (reduces re-renders)**

**Incorrect: manual loading state**

```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSearch = async (value: string) => {
  setIsLoading(true)
  const data = await fetchResults(value)
  setResults(data)
  setIsLoading(false)
}
```

**Correct: useTransition with built-in pending state**

```tsx
const [isPending, startTransition] = useTransition()

const handleSearch = (value: string) => {
  startTransition(async () => {
    const data = await fetchResults(value)
    setResults(data)
  })
}
```

---

## 7. JavaScript Performance

**Impact: LOW-MEDIUM**

Micro-optimizations for hot paths can add up to meaningful improvements.

### 7.1 Avoid Layout Thrashing

**Impact: MEDIUM (prevents forced synchronous layouts)**

Avoid interleaving style writes with layout reads.

**Incorrect: forces reflow on each read**

```typescript
element.style.width = '100px'
const width = element.offsetWidth  // Forces reflow
element.style.height = '200px'
const height = element.offsetHeight  // Forces another reflow
```

**Correct: batch writes, then read once**

```typescript
element.style.width = '100px'
element.style.height = '200px'
const { width, height } = element.getBoundingClientRect()
```

---

### 7.2 Build Index Maps for Repeated Lookups

**Impact: LOW-MEDIUM (1M ops to 2K ops)**

**Incorrect (O(n) per lookup):**

```typescript
return orders.map(order => ({
  ...order,
  user: users.find(u => u.id === order.userId)
}))
```

**Correct (O(1) per lookup):**

```typescript
const userById = new Map(users.map(u => [u.id, u]))
return orders.map(order => ({ ...order, user: userById.get(order.userId) }))
```

---

### 7.3 Cache Property Access in Loops

**Impact: LOW-MEDIUM (reduces lookups)**

**Incorrect: 3 lookups × N iterations**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}
```

**Correct: 1 lookup total**

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```

---

### 7.4 Cache Repeated Function Calls

**Impact: MEDIUM (avoid redundant computation)**

```typescript
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) return slugifyCache.get(text)!
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}
```

---

### 7.5 Cache Storage API Calls

**Impact: LOW-MEDIUM (reduces expensive I/O)**

`localStorage` and `sessionStorage` are synchronous and expensive. Cache reads in memory.

```typescript
const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    storageCache.set(key, localStorage.getItem(key))
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value)  // keep cache in sync
}
```

---

### 7.6 Combine Multiple Array Iterations

**Impact: LOW-MEDIUM (reduces iterations)**

**Incorrect: 3 iterations**

```typescript
const admins = users.filter(u => u.isAdmin)
const testers = users.filter(u => u.isTester)
const inactive = users.filter(u => !u.isActive)
```

**Correct: 1 iteration**

```typescript
const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```

---

### 7.7 Defer Non-Critical Work with requestIdleCallback

**Impact: MEDIUM (keeps UI responsive)**

```typescript
function handleSearch(query: string) {
  const results = searchItems(query)
  setResults(results)

  requestIdleCallback(() => { analytics.track('search', { query }) })
  requestIdleCallback(() => { saveToRecentSearches(query) })
}
```

Fallback: `const scheduleIdleWork = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1))`

---

### 7.8 Early Length Check for Array Comparisons

**Impact: MEDIUM-HIGH (avoids expensive operations when lengths differ)**

```typescript
function hasChanges(current: string[], original: string[]) {
  if (current.length !== original.length) return true

  const currentSorted = current.toSorted()
  const originalSorted = original.toSorted()
  for (let i = 0; i < currentSorted.length; i++) {
    if (currentSorted[i] !== originalSorted[i]) return true
  }
  return false
}
```

---

### 7.9 Early Return from Functions

**Impact: LOW-MEDIUM (avoids unnecessary computation)**

```typescript
function validateUsers(users: User[]) {
  for (const user of users) {
    if (!user.email) return { valid: false, error: 'Email required' }
    if (!user.name) return { valid: false, error: 'Name required' }
  }
  return { valid: true }
}
```

---

### 7.10 Hoist RegExp Creation

**Impact: LOW-MEDIUM (avoids recreation)**

**Incorrect: new RegExp every render**

```tsx
function Highlighter({ text, query }: Props) {
  const regex = new RegExp(`(${query})`, 'gi')
  // ...
}
```

**Correct: memoize or hoist**

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(`(${escapeRegex(query)})`, 'gi'),
    [query]
  )
  // ...
}
```

---

### 7.11 Use flatMap to Map and Filter in One Pass

**Impact: LOW-MEDIUM (eliminates intermediate array)**

**Incorrect: 2 iterations, intermediate array**

```typescript
const userNames = users
  .map(user => user.isActive ? user.name : null)
  .filter(Boolean)
```

**Correct: 1 iteration, no intermediate array**

```typescript
const userNames = users.flatMap(user =>
  user.isActive ? [user.name] : []
)
```

---

### 7.12 Use Loop for Min/Max Instead of Sort

**Impact: LOW (O(n) instead of O(n log n))**

**Incorrect:**

```typescript
const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
return sorted[0]
```

**Correct:**

```typescript
function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return null
  let latest = projects[0]
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) latest = projects[i]
  }
  return latest
}
```

---

### 7.13 Use Set/Map for O(1) Lookups

**Impact: LOW-MEDIUM (O(n) to O(1))**

**Incorrect (O(n) per check):**

```typescript
items.filter(item => allowedIds.includes(item.id))
```

**Correct (O(1) per check):**

```typescript
const allowedSet = new Set(allowedIds)
items.filter(item => allowedSet.has(item.id))
```

---

### 7.14 Use toSorted() Instead of sort() for Immutability

**Impact: MEDIUM-HIGH (prevents mutation bugs in React state)**

`.sort()` mutates the array in place, which can cause bugs with React state.

**Incorrect:**

```typescript
const sorted = useMemo(
  () => users.sort((a, b) => a.name.localeCompare(b.name)),
  [users]
)
```

**Correct:**

```typescript
const sorted = useMemo(
  () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
  [users]
)
```

---

## 8. Advanced Patterns

**Impact: LOW**

Advanced patterns for specific cases that require careful implementation.

### 8.1 Do Not Put Effect Events in Dependency Arrays

**Impact: LOW (avoids unnecessary effect re-runs)**

Effect Event functions do not have a stable identity. Do not include them in dependency arrays.

**Incorrect:**

```tsx
const handleConnected = useEffectEvent(onConnected)

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', handleConnected)
  connection.connect()
  return () => connection.disconnect()
}, [roomId, handleConnected])  // ❌ handleConnected should not be here
```

**Correct:**

```tsx
const handleConnected = useEffectEvent(onConnected)

useEffect(() => {
  const connection = createConnection(roomId)
  connection.on('connected', handleConnected)
  connection.connect()
  return () => connection.disconnect()
}, [roomId])  // ✅ Only reactive value
```

---

### 8.2 Initialize App Once, Not Per Mount

**Impact: LOW-MEDIUM (avoids duplicate init in development)**

**Incorrect:**

```tsx
function Comp() {
  useEffect(() => {
    loadFromStorage()
    checkAuthToken()
  }, [])
}
```

**Correct:**

```tsx
let didInit = false

function Comp() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])
}
```

---

### 8.3 Store Event Handlers in Refs

**Impact: LOW (stable subscriptions)**

**Incorrect: re-subscribes on every render**

```tsx
function useWindowEvent(event: string, handler: (e: Event) => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}
```

**Correct: stable subscription via useEffectEvent**

```tsx
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: (e: Event) => void) {
  const onEvent = useEffectEvent(handler)

  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

---

### 8.4 useEffectEvent for Stable Callback Refs

**Impact: LOW (prevents effect re-runs)**

**Incorrect: effect re-runs on every callback change**

```tsx
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timeout)
  }, [query, onSearch])
}
```

**Correct:**

```tsx
import { useEffectEvent } from 'react'

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}
```

---

## References

1. https://react.dev
2. https://nextjs.org
3. https://tanstack.com/query
4. https://github.com/shuding/better-all
5. https://github.com/isaacs/node-lru-cache
6. https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
7. https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast
8. https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
