# Token Lifecycle Lab

An interactive laboratory for understanding refresh-token rotation and replay detection. Follow a token family, advance a simulated clock, reuse a consumed identifier, and inspect why the next request is denied.

## Problem

Token expiry and logout are often described as single checks. Rotation introduces a history: a previously valid refresh token can become evidence of reuse. This project makes those state transitions visible and reproducible.

## Working features

- Single-use refresh rotation with a sliding 60-minute refresh lifetime.
- Ten-minute access lifetime with explicit expiry-boundary handling.
- Reuse detection that revokes the whole family, including descendants.
- Operator revocation, identifier selection, deterministic clock control, and decision history.
- JSON export of the complete experiment; no keys or network services required.
- Six automated behavior tests and a GitHub Actions test workflow.

## Run

Use Node.js 22 or newer to test. There are no package dependencies.

```sh
node --test test.mjs
python3 -m http.server 8000
```

Open `http://localhost:8000` in a modern browser. Use an HTTP server because the application uses JavaScript modules.

## Try the replay experiment

1. Rotate R1. R2 and A2 are issued; R1 becomes consumed.
2. Keep R1 selected and rotate again. The family becomes revoked.
3. Select A2 and check access. It is denied despite its unexpired lifetime.
4. Reset, advance ten minutes, and check A1 to observe the exact expiry boundary.

## Components and credential handling

`engine.mjs` is a pure state-transition model. `app.mjs` binds browser controls to the model. `index.html` and `style.css` provide the responsive interface. `test.mjs` verifies replay revocation, expiry, unknown identifiers, explicit revocation, invalid actions, and immutability.

The identifiers R1/A1 are predictable teaching labels, **not credentials**. There are no passwords, cookies, bearer tokens, OAuth callbacks, JWT signatures, or authentication backend. Model state exists only in page memory and is cleared by reset or reload. Export intentionally includes the simulated identifiers and event history.

See [ARCHITECTURE.md](ARCHITECTURE.md) for request flow and model assumptions, [SECURITY.md](SECURITY.md) for privacy boundaries, and [CONTRIBUTING.md](CONTRIBUTING.md) for contributions.

## Limitations and roadmap

This model checks family revocation on every access decision. Real stateless access-token systems may accept a token until expiry unless they consult revocation state. Refresh lifetimes slide without an absolute session cap here. There is no concurrency, grace period, cross-tab synchronization, or durable token store. Reusing any consumed identifier revokes the family even after that identifier expires.

Next experiments: compare absolute versus sliding expiry, model concurrent refresh races, and demonstrate revocation propagation delays. This repository is an educational implementation, not an identity provider or production security guarantee.

## License

MIT. Copyright 2026 Royalpuskar.
