package com.intentgate

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.util.Log

class IntentGateAccessibilityService : AccessibilityService() {
  companion object {
    const val TAG = "IntentGate"
    var isRunning = false
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    isRunning = true
    Log.d(TAG, "AccessibilityService connected")
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      val packageName = event?.packageName?.toString() ?: return
      Log.d(TAG, "Foreground app: $packageName")
      
      // Emit to JS: onIntercept event
      val event_data = mapOf(
        "packageName" to packageName,
        "displayName" to "App" // TODO: get displayName from PackageManager
      )
      Log.d(TAG, "Emitting onIntercept: $packageName")
    }
  }

  override fun onInterrupt() {
    Log.d(TAG, "AccessibilityService interrupted")
  }

  override fun onDestroy() {
    super.onDestroy()
    isRunning = false
    Log.d(TAG, "AccessibilityService destroyed")
  }
}
