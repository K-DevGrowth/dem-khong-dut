// Centralized timer manager to prevent orphan setTimeout/setInterval callbacks
// from leaking across loop resets, retries, or returning to the title screen.

export function createTimerManager() {
  const timeouts = new Set();
  const intervals = new Set();

  function scheduleTimeout(fn, delayMs) {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, delayMs);
    timeouts.add(id);
    return id;
  }

  function scheduleInterval(fn, intervalMs) {
    const id = window.setInterval(fn, intervalMs);
    intervals.add(id);
    return id;
  }

  function clearTimeoutSafe(id) {
    if (timeouts.has(id)) {
      window.clearTimeout(id);
      timeouts.delete(id);
    }
  }

  function clearIntervalSafe(id) {
    if (intervals.has(id)) {
      window.clearInterval(id);
      intervals.delete(id);
    }
  }

  function clearAll() {
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts.clear();
    intervals.forEach((id) => window.clearInterval(id));
    intervals.clear();
  }

  return {
    setTimeout: scheduleTimeout,
    setInterval: scheduleInterval,
    clearTimeout: clearTimeoutSafe,
    clearInterval: clearIntervalSafe,
    clearAll
  };
}
