package com.intentgate

import android.content.Context
import android.provider.Settings
import android.accessibilityservice.AccessibilityManager
import android.view.accessibility.AccessibilityEvent

object PermissionHelper {
  fun isAccessibilityServiceEnabled(context: Context): Boolean {
    val am = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
    val services = am.getEnabledAccessibilityServiceList(AccessibilityEvent.TYPES_ALL_MASK)
    return services.any { 
      it.resolveInfo.serviceInfo.packageName == context.packageName &&
      it.resolveInfo.serviceInfo.name.contains("IntentGateAccessibilityService")
    }
  }

  fun isServiceRunning(context: Context): Boolean {
    return IntentGateAccessibilityService.isRunning
  }
}
