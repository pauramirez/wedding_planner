// 128-bit random hex token, generated via Web Crypto.
// Used for guest RSVP links — long enough that guessing another guest's
// link is not feasible.
export function randomHexToken(bytes = 16) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
