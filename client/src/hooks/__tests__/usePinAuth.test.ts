import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePinAuth } from '../usePinAuth';

// Mock fetch for API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeFetchValidPin() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ valid: true }),
  });
}

describe('usePinAuth', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows PIN modal on first protected action', () => {
    const { result } = renderHook(() => usePinAuth());

    act(() => {
      result.current.withPinAuth(async () => {});
    });

    expect(result.current.showPinModal).toBe(true);
  });

  // RED until Plan 01 implements grace period
  it('skips PIN modal within 60s grace period (D-16)', async () => {
    makeFetchValidPin();
    const { result } = renderHook(() => usePinAuth());

    // Trigger a protected action and verify PIN
    act(() => {
      result.current.withPinAuth(async () => {});
    });

    await act(async () => {
      await result.current.verifyPin('1234');
    });

    // Now immediately call another protected action — should skip PIN within grace period
    const action = vi.fn().mockResolvedValue(undefined);
    act(() => {
      result.current.withPinAuth(action);
    });

    // Within 60s grace period: showPinModal should remain false and action called directly
    expect(result.current.showPinModal).toBe(false);
    expect(action).toHaveBeenCalled();
  });

  // RED until Plan 01 implements grace period
  it('shows PIN modal after 60s inactivity (D-16)', async () => {
    makeFetchValidPin();
    const { result } = renderHook(() => usePinAuth());

    // Trigger initial protected action and verify PIN
    act(() => {
      result.current.withPinAuth(async () => {});
    });

    await act(async () => {
      await result.current.verifyPin('1234');
    });

    // Advance time past the 60s grace period
    act(() => {
      vi.advanceTimersByTime(61_000);
    });

    // Call another protected action — should re-prompt for PIN
    act(() => {
      result.current.withPinAuth(async () => {});
    });

    expect(result.current.showPinModal).toBe(true);
  });

  // RED until Plan 01 implements grace period
  it('resets timer on each successful authenticated action (D-17)', async () => {
    makeFetchValidPin();
    const { result } = renderHook(() => usePinAuth());

    // First PIN verification
    act(() => {
      result.current.withPinAuth(async () => {});
    });

    await act(async () => {
      await result.current.verifyPin('1234');
    });

    // Advance time to 50s (within grace period)
    act(() => {
      vi.advanceTimersByTime(50_000);
    });

    // Perform another action within grace period (resets timer)
    const action = vi.fn().mockResolvedValue(undefined);
    act(() => {
      result.current.withPinAuth(action);
    });

    // Timer should be reset: advance 50 more seconds (total 100s from first auth, but only 50 from reset)
    act(() => {
      vi.advanceTimersByTime(50_000);
    });

    // Should still be within the grace period since timer reset after 2nd action
    const action2 = vi.fn().mockResolvedValue(undefined);
    act(() => {
      result.current.withPinAuth(action2);
    });

    expect(result.current.showPinModal).toBe(false);
    expect(action2).toHaveBeenCalled();
  });
});
