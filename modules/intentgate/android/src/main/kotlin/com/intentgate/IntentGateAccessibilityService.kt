package com.intentgate

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.util.Log
import android.os.BatteryManager
import android.content.Intent
import android.content.IntentFilter

class IntentGateAccessibilityService : AccessibilityService() {
  companion object {
    const val TAG = "IntentGate"
    var isRunning = false
    var batteryLowMode = false
  }
  
  private fun checkBatteryLevel(): Boolean {
    val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    val batteryStatus = registerReceiver(null, intentFilter)
    val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
    val isBatteryLow = level < 15
    if (isBatteryLow && !batteryLowMode) {
      Log.w(TAG, "Battery low detected: ${level}% - reducing update frequency")
      batteryLowMode = true
    } else if (!isBatteryLow && batteryLowMode) {
      batteryLowMode = false
      Log.d(TAG, "Battery recovered: ${level}% - resuming normal update frequency")
    }
    return isBatteryLow
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    isRunning = true
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      val packageName = event?.packageName?.toString() ?: return
      
      // Check battery and adjust update frequency if needed
      val isBatteryLow = checkBatteryLevel()
      
      // Emit to JS: onIntercept event
      val event_data = mapOf(
        "packageName" to packageName,
        "displayName" to "App", // TODO: get displayName from PackageManager
        "batteryLowMode" to isBatteryLow
      )
    }
  }

  override fun onInterrupt() {
  }

  override fun onDestroy() {
    super.onDestroy()
    isRunning = false
  }
}
