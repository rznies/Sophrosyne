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
      Log.d("IntentGate", "Service start requested")
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
      sessionManager.startSession(packageName, durationMs, intent)
      promise.resolve(true)
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
