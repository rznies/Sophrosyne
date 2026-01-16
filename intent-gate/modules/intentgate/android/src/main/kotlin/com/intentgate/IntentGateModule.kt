package com.intentgate

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.util.Log

class IntentGateModule : Module() {
  private val sessionManager = SessionManager()

  override fun definition() = ModuleDefinition {
    Name("IntentGateModule")
    
    OnCreate {
      OverlayController.init(appContext.reactContext!!)
    }
    
    Function("startService") { promise ->
      promise.resolve(null)
    }
    
    Function("stopService") { promise ->
      promise.resolve(null)
    }
    
    Function("getCurrentStatus") { promise ->
      val map = mapOf(
        "accessibilityEnabled" to PermissionHelper.isAccessibilityServiceEnabled(appContext.reactContext!!),
        "overlaySupported" to true,
        "serviceRunning" to PermissionHelper.isServiceRunning(appContext.reactContext!!)
      )
      promise.resolve(map)
    }
    
    Function("allowSession") { packageName: String, durationMs: Long, intent: String, promise ->
      try {
        if (intent.trim().length < 3) {
          promise.reject("INVALID_INTENT", "Intent must be 3+ characters")
          return@Function
        }
        sessionManager.startSession(packageName, durationMs, intent)
        promise.resolve(true)
      } catch (e: Exception) {
        Log.e("IntentGate", "allowSession failed", e)
        promise.reject("SESSION_SAVE_FAILED", e.message)
      }
    }
    
    Function("getTodayStats") { promise ->
      val map = mapOf(
        "interceptCount" to 0,
        "allowedSessionsCount" to 0,
        "allowedMinutesTotal" to 0
      )
      promise.resolve(map)
    }
    
    // Events
    Events("onIntercept", "onSessionStart", "onSessionEnd")
  }
}
