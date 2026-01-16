package com.intentgate

import android.content.Context
import android.view.WindowManager
import android.util.Log

object OverlayController {
  private var overlayView: GateOverlayView? = null
  private var windowManager: WindowManager? = null

  fun init(context: Context) {
    windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
  }

  fun showGate(context: Context, packageName: String) {
    if (overlayView != null) return
    
    try {
      overlayView = GateOverlayView(context, packageName)
      windowManager?.addView(overlayView, getLayoutParams())
    } catch (e: Exception) {
      Log.e("IntentGate", "Failed to show gate", e)
    }
  }

  fun hideGate() {
    overlayView?.let {
      try {
        windowManager?.removeView(it)
      } catch (e: Exception) {
        Log.e("IntentGate", "Failed to hide gate", e)
      }
    }
    overlayView = null
  }

  fun updateCountdown(remainingSeconds: Long) {
    overlayView?.updateCountdown(remainingSeconds)
  }

  private fun getLayoutParams() = WindowManager.LayoutParams().apply {
    type = WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY
    format = android.graphics.PixelFormat.TRANSLUCENT
    flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
    width = WindowManager.LayoutParams.MATCH_PARENT
    height = WindowManager.LayoutParams.MATCH_PARENT
  }
}
