import { describe, it, expect } from "vitest";
import {
  isTerminalStatus,
  getNextPollInterval,
  isPollingTimedOut,
  evaluatePollCycle,
  MAX_POLL_TIMEOUT_MS,
  INITIAL_POLL_INTERVAL_MS,
  MAX_POLL_INTERVAL_MS,
} from "./pipelinePolling.js";

describe("pipelinePolling", () => {
  describe("isTerminalStatus", () => {
    it("recognizes completed, partial, and failed as terminal", () => {
      expect(isTerminalStatus("completed")).toBe(true);
      expect(isTerminalStatus("partial")).toBe(true);
      expect(isTerminalStatus("failed")).toBe(true);
    });

    it("recognizes in-progress statuses as non-terminal", () => {
      expect(isTerminalStatus("pending")).toBe(false);
      expect(isTerminalStatus("running")).toBe(false);
      expect(isTerminalStatus("extract_job_context")).toBe(false);
      expect(isTerminalStatus("generate_resume")).toBe(false);
    });
  });

  describe("getNextPollInterval", () => {
    it("backs off exponentially/linearly by 250ms per step up to cap", () => {
      const step1 = getNextPollInterval(2000);
      expect(step1).toBe(2250);

      const step2 = getNextPollInterval(step1);
      expect(step2).toBe(2500);

      // Capped at MAX_POLL_INTERVAL_MS (4000)
      const capped = getNextPollInterval(3900);
      expect(capped).toBe(MAX_POLL_INTERVAL_MS);

      const beyond = getNextPollInterval(4500);
      expect(beyond).toBe(MAX_POLL_INTERVAL_MS);
    });
  });

  describe("isPollingTimedOut", () => {
    it("returns false if within 3 minutes", () => {
      const now = 1000000;
      expect(isPollingTimedOut(now - 60000, now)).toBe(false);
    });

    it("returns true if elapsed time exceeds 180000ms", () => {
      const now = 1000000;
      expect(isPollingTimedOut(now - (MAX_POLL_TIMEOUT_MS + 1000), now)).toBe(true);
    });
  });

  describe("evaluatePollCycle", () => {
    it("stops and requests artifact loading when completed or partial", () => {
      const completedDecision = evaluatePollCycle({
        status: "completed",
        startTime: 1000,
        currentTime: 5000,
      });

      expect(completedDecision.action).toBe("STOP");
      expect(completedDecision.reason).toBe("TERMINAL_STATUS");
      expect(completedDecision.shouldLoadArtifacts).toBe(true);

      const partialDecision = evaluatePollCycle({
        status: "partial",
        startTime: 1000,
        currentTime: 5000,
      });

      expect(partialDecision.action).toBe("STOP");
      expect(partialDecision.shouldLoadArtifacts).toBe(true);
    });

    it("stops without loading artifacts when pipeline failed", () => {
      const failedDecision = evaluatePollCycle({
        status: "failed",
        startTime: 1000,
        currentTime: 5000,
      });

      expect(failedDecision.action).toBe("STOP");
      expect(failedDecision.reason).toBe("TERMINAL_STATUS");
      expect(failedDecision.shouldLoadArtifacts).toBe(false);
    });

    it("stops and sets error message when timeout is reached", () => {
      const timeoutDecision = evaluatePollCycle({
        status: "running",
        startTime: 1000,
        currentTime: 1000 + MAX_POLL_TIMEOUT_MS + 100,
      });

      expect(timeoutDecision.action).toBe("STOP");
      expect(timeoutDecision.reason).toBe("TIMEOUT");
      expect(timeoutDecision.error).toContain("taking longer than expected");
    });

    it("continues polling with backoff when in-progress", () => {
      const continueDecision = evaluatePollCycle({
        status: "running",
        startTime: 1000,
        currentTime: 5000,
        currentInterval: INITIAL_POLL_INTERVAL_MS,
      });

      expect(continueDecision.action).toBe("CONTINUE");
      expect(continueDecision.reason).toBe("IN_PROGRESS");
      expect(continueDecision.nextInterval).toBe(2250);
    });
  });
});
