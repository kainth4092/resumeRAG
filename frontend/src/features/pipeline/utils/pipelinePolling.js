/**
 * Utility functions for Pipeline Polling logic
 */

export const MAX_POLL_TIMEOUT_MS = 180000; // 3 minutes
export const INITIAL_POLL_INTERVAL_MS = 2000; // 2 seconds
export const MAX_POLL_INTERVAL_MS = 4000; // 4 seconds
export const BACKOFF_STEP_MS = 250;

export const TERMINAL_STATUSES = Object.freeze(["completed", "partial", "failed"]);

/**
 * Determine if a status is terminal
 */
export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Compute the next backoff delay
 */
export function getNextPollInterval(currentInterval = INITIAL_POLL_INTERVAL_MS) {
  return Math.min(MAX_POLL_INTERVAL_MS, currentInterval + BACKOFF_STEP_MS);
}

/**
 * Check if polling has exceeded the timeout cap
 */
export function isPollingTimedOut(startTime, currentTime = Date.now(), maxTimeout = MAX_POLL_TIMEOUT_MS) {
  if (!startTime) return false;
  return (currentTime - startTime) > maxTimeout;
}

/**
 * Core decision engine for a pipeline poll cycle
 */
export function evaluatePollCycle({
  status,
  startTime,
  currentTime = Date.now(),
  currentInterval = INITIAL_POLL_INTERVAL_MS,
  maxTimeout = MAX_POLL_TIMEOUT_MS,
}) {
  if (isTerminalStatus(status)) {
    return {
      action: "STOP",
      reason: "TERMINAL_STATUS",
      shouldLoadArtifacts: status === "completed" || status === "partial",
      nextInterval: 0,
    };
  }

  if (isPollingTimedOut(startTime, currentTime, maxTimeout)) {
    return {
      action: "STOP",
      reason: "TIMEOUT",
      shouldLoadArtifacts: false,
      nextInterval: 0,
      error: "Pipeline execution is taking longer than expected. You can check back shortly or retry.",
    };
  }

  return {
    action: "CONTINUE",
    reason: "IN_PROGRESS",
    shouldLoadArtifacts: false,
    nextInterval: getNextPollInterval(currentInterval),
  };
}
