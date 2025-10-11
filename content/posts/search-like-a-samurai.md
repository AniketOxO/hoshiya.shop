# Search Like a Samurai

Sharpening discovery with a lightweight fuzzy engine.

We combined subsequence scoring and Levenshtein distance, then sprinkled:

- Category chips in suggestions
- Keyboard nav (Home/End)
- A “Did you mean…” fallback

```js
const score = 0.6*seq + 0.4*norm;
```
