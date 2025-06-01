const times = (n, fn, seeded_rng) => {
  if (n < 0) throw new Error("The first argument cannot be negative.");
  if (typeof seeded_rng !== 'function') throw new Error("A seeded RNG function must be provided.");

  return (arg) => {
    let result = arg;
    const wholePart = Math.floor(n);
    const fractionalPart = n % 1;

    for (let i = 0; i < wholePart; i++) {
      result = fn(result);
    }

    if (fractionalPart > 0 && seeded_rng() < fractionalPart) {
      result = fn(result);
    }
    return result;
  };
};

module.exports = { times };