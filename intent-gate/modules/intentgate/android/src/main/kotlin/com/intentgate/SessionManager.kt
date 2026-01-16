package com.intentgate

import android.util.Log
import kotlinx.coroutines.*

class SessionManager {
  private var sessionJob: Job? = null
  private val scope = CoroutineScope(Dispatchers.Main + Job())

  fun startSession(packageName: String, durationMs: Long, intentText: String) {
    Log.d("IntentGate", "Starting session: $packageName for ${durationMs / 1000}s")
    
    sessionJob?.cancel()
    sessionJob = scope.launch {
      delay(durationMs)
      Log.d("IntentGate", "Session expired: $packageName")
      // TODO: Emit onSessionEnd event, re-show gate
    }
  }

  fun cancelSession() {
    sessionJob?.cancel()
    sessionJob = null
  }

  fun destroy() {
    scope.cancel()
  }
}
