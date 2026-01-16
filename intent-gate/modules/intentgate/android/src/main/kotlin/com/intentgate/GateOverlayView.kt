package com.intentgate

import android.content.Context
import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.EditText
import android.widget.Button
import android.widget.TextView
import android.widget.GridLayout
import android.util.Log
import androidx.core.graphics.ColorUtils

class GateOverlayView(context: Context, val packageName: String) : FrameLayout(context) {
  init {
    // Dark scrim background
    setBackgroundColor(ColorUtils.setAlphaComponent(Color.BLACK, (0.6 * 255).toInt()))

    // Root container (centered)
    val container = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      gravity = android.view.Gravity.CENTER
    }

    // Title
    val title = TextView(context).apply {
      text = "Pause. What are you here to do?"
      textSize = 20f
      setTextColor(Color.WHITE)
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply { bottomMargin = 24 }
    }
    container.addView(title)

    // Intent text input
    val intentInput = EditText(context).apply {
      hint = "What are you here to do?"
      setTextColor(Color.WHITE)
      setHintTextColor(Color.GRAY)
      layoutParams = LinearLayout.LayoutParams(300, LinearLayout.LayoutParams.WRAP_CONTENT)
        .apply { bottomMargin = 24 }
    }
    container.addView(intentInput)

    // Preset chips (2-column grid)
    val chipsGrid = GridLayout(context).apply {
      columnCount = 2
      rowCount = 4
      layoutParams = LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
        .apply { bottomMargin = 24 }
    }
    val chips = listOf(
      "Search something", "Reply to messages",
      "Post / upload", "Watch tutorial",
      "Check updates", "Work task",
      "Take a break", "Other"
    )
    chips.forEach { chipText ->
      val chip = Button(context).apply {
        text = chipText
        layoutParams = GridLayout.LayoutParams().apply {
          width = 150
          height = 60
          rightMargin = 8
          bottomMargin = 8
        }
        setOnClickListener {
          intentInput.setText(chipText)
        }
      }
      chipsGrid.addView(chip)
    }
    container.addView(chipsGrid)

    // Duration buttons (5, 10, 15 min)
    val durationButtons = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      layoutParams = LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
        .apply { bottomMargin = 24 }
    }
    listOf("5 min" to 5, "10 min" to 10, "15 min" to 15).forEach { (label, minutes) ->
      val btn = Button(context).apply {
        text = label
        layoutParams = LinearLayout.LayoutParams(120, 60).apply { rightMargin = 8 }
        setOnClickListener {
          val intent = intentInput.text.toString()
          if (intent.length < 3) {
            Log.w("IntentGate", "Intent too short")
            return@setOnClickListener
          }
          // Call native: allowSession(packageName, minutes * 60 * 1000, intent)
          Log.d("IntentGate", "Allow $minutes min: $intent")
          OverlayController.hideGate()
        }
      }
      durationButtons.addView(btn)
    }
    container.addView(durationButtons)

    // "Not now" button
    val notNowBtn = Button(context).apply {
      text = "Not now"
      layoutParams = LinearLayout.LayoutParams(150, 60)
      setOnClickListener {
        Log.d("IntentGate", "Not now - snooze 30s")
        OverlayController.hideGate()
      }
    }
    container.addView(notNowBtn)

    addView(container)
  }

  fun updateCountdown(remainingSeconds: Long) {
    // Update timer label (TODO)
    Log.d("IntentGate", "Countdown: ${remainingSeconds}s")
  }
}
