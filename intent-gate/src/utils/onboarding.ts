import type { AppState } from '../store/useAppState';

export type OnboardingStep = 'WELCOME' | 'ACCESSIBILITY' | 'OVERLAY' | 'TEST' | 'DONE';

/**
 * Determine which onboarding step the user should see
 * @param state Current app state
 * @returns Next onboarding step
 */
export function determineOnboardingStep(state: AppState): OnboardingStep {
  // Both permissions off → start with welcome
  if (!state.accessibilityEnabled && !state.overlayEnabled) {
    return 'WELCOME';
  }

  // Missing accessibility
  if (!state.accessibilityEnabled && state.overlayEnabled) {
    return 'ACCESSIBILITY';
  }

  // Missing overlay
  if (state.accessibilityEnabled && !state.overlayEnabled) {
    return 'OVERLAY';
  }

  // Both permissions enabled → test flow (optional)
  if (state.accessibilityEnabled && state.overlayEnabled) {
    // If any trigger app is selected, we're done
    if (state.selectedTriggerApps.length > 0) {
      return 'DONE';
    }
    // Otherwise show test screen to select an app
    return 'TEST';
  }

  return 'DONE';
}

/**
 * Check if onboarding is complete
 * @param state Current app state
 * @returns true if all required steps are done
 */
export function isOnboardingComplete(state: AppState): boolean {
  return (
    state.accessibilityEnabled &&
    state.overlayEnabled &&
    state.selectedTriggerApps.length > 0
  );
}

/**
 * Get next onboarding step after current one
 * @param current Current step
 * @returns Next step
 */
export function getNextOnboardingStep(current: OnboardingStep): OnboardingStep {
  const steps: OnboardingStep[] = ['WELCOME', 'ACCESSIBILITY', 'OVERLAY', 'TEST', 'DONE'];
  const currentIndex = steps.indexOf(current);
  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return 'DONE';
  }
  return steps[currentIndex + 1];
}
