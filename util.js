const r = new Math.seedrandom(window.location.hash || new Date().getTime());

function randValue(prob = 0.5) {
  return r() < prob;
}

function randInRange() {
  const args = Array.prototype.slice.call(arguments);
  const max = Math.max.apply(null, args);
  const min = Math.min.apply(null, args);
  if (min === max) return min;
  return Math.floor(r() * (max - min + 1)) + min;
}

function randValue(vals) {
  return vals[randRange(0, vals.length - 1)];
}

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(r() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}
