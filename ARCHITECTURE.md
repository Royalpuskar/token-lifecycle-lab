# Model and request flow

1. The browser issues an initial in-memory family with R1 and A1 at simulated minute zero.
2. A control creates a typed action: rotate, check, advance, or revoke.
3. `transition` clones the input state before applying the action.
4. Rotation checks family revocation, identifier existence, prior consumption, then expiry. A valid exchange consumes the current refresh label and adds a successor and access label.
5. An access check consults family revocation, identifier existence, and expiry. Equality with expiry is expired.
6. A decision is appended to the event history and the interface rerenders using text nodes.

The model is deterministic and does not authenticate an actual HTTP request. A rotated token is consumed before the successor is issued within one synchronous transition; this does not model database atomicity. Unknown identifiers deny without revoking a family. Used-token replay triggers revocation before expiry is considered.

Runtime inputs are bounded to 500 actions and clock advances of 1–10000 minutes. TTL constructor values are positive safe integers up to 10000. The public engine API expects state produced by `createSession` or `transition`; arbitrary imported state is not supported. The UI never imports state.

## Threat-model boundary

The adversarial experiment is copying an old refresh identifier. There is no cryptographic implementation, client binding, CSRF defense, encrypted storage, or transport authentication in this model. A production implementation requires those concerns to be designed and reviewed independently.
