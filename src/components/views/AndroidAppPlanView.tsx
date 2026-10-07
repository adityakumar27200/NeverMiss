import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle,
  Copy,
  Layers,
  Cpu,
  Shield,
  Bell,
  Database,
  ArrowRight,
  Code,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const AndroidAppPlanView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const manifestSnippet = `<!-- AndroidManifest.xml (Key Permissions for Background Reminders) -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.chronos.productivity">

    <!-- Push and exact alarm permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".ChronosApplication"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/Theme.Chronos">

        <!-- Boot Receiver: Re-arms all alarms if user restarts phone -->
        <receiver
            android:name=".receivers.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

        <!-- Alarm Broadcast Receiver -->
        <receiver
            android:name=".receivers.AlarmReceiver"
            android:exported="false" />

    </application>
</manifest>`;

  const alarmReceiverSnippet = `// AlarmReceiver.kt - Fires exact notifications even in Doze Mode
package com.chronos.productivity.receivers

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.chronos.productivity.MainActivity
import com.chronos.productivity.R

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("EXTRA_TITLE") ?: "Task Reminder"
        val message = intent.getStringExtra("EXTRA_MESSAGE") ?: "You have a pending task due now."
        val priority = intent.getStringExtra("EXTRA_PRIORITY") ?: "normal"

        val channelId = if (priority == "critical") "chronos_critical" else "chronos_standard"

        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context, 0, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(
                if (priority == "critical") NotificationCompat.PRIORITY_MAX
                else NotificationCompat.PRIORITY_HIGH
            )
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    }
}`;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-300 dark:border-emerald-500/30 p-6 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
        <div className="flex items-center space-x-2.5">
          <Smartphone className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Complete Android App Engineering Plan
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
            OFFICIAL BLUEPRINT
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Here is your comprehensive, production-grade architectural guide to build Chronos as an Android application. Follow these 7 systematic steps to achieve 100% reliable background alarms, offline persistence, and seamless mobile UX.
        </p>
      </div>

      {/* Two Architecture Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Option A: Native Kotlin + Jetpack Compose (Recommended)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pure native Android application with Kotlin, Jetpack Compose UI, Room SQLite database, and AlarmManager for battery-exempt alarm precision.
          </p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✓ Highest performance & lowest memory footprint.</li>
            <li>✓ Guaranteed notification triggers even in Android Doze mode.</li>
            <li>✓ Native home screen glanceable app widgets (`Glance`).</li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Option B: Capacitor Cross-Platform Packaging</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Wrap this exact React codebase into an Android APK / AAB using Capacitor CLI (`@capacitor/android`) in under 15 minutes!
          </p>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✓ 100% UI code reuse with this existing web application.</li>
            <li>✓ Native bridge plugins (`@capacitor/local-notifications`, `@capacitor/app`).</li>
            <li>✓ Quickest time to Google Play Store release.</li>
          </ul>
        </div>
      </div>

      {/* Step by Step Roadmap */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <span>7-Phase Implementation Blueprint</span>
        </h2>

        {/* Phase 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Project Setup & Android Architecture</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">build.gradle.kts</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Initialize an Android Studio project with **Minimum SDK 26 (Android 8.0)** and **Target SDK 35 (Android 15)**. Configure dependencies:
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
            <div>// Jetpack Compose, Room SQLite, WorkManager & Hilt DI</div>
            <div>implementation(&quot;androidx.compose.material3:material3:1.3.0&quot;)</div>
            <div>implementation(&quot;androidx.room:room-runtime:2.6.1&quot;)</div>
            <div>ksp(&quot;androidx.room:room-compiler:2.6.1&quot;)</div>
            <div>implementation(&quot;androidx.work:work-runtime-ktx:2.9.1&quot;)</div>
            <div>implementation(&quot;com.google.dagger:hilt-android:2.51.1&quot;)</div>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Local Offline Database Schema (Room SQLite)</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">AppDatabase.kt</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Create entities matching the 16 modules: `TaskEntity`, `DeadlineEntity`, `RoutineEntity`, `FollowUpEntity`, `GroceryEntity`, and `ContactEntity`. Use Room TypeConverters for JSON arrays (tags, reminders, sub-steps).
          </p>
        </div>

        {/* Phase 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>The Background Alarm Engine (Crucial Core!)</span>
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">AlarmManager & NotificationChannels</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            On Android, periodic timers get killed when the screen turns off. To ensure users **NEVER forget** a task or routine:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
            <li>
              **Use `AlarmManager.setExactAndAllowWhileIdle()`**: Schedules exact microsecond reminders that fire even when the device is in Deep Sleep / Doze mode.
            </li>
            <li>
              **Configure High-Priority Notification Channels**:
              <div className="font-mono text-[11px] text-cyan-300 mt-0.5">
                channel.importance = NotificationManager.IMPORTANCE_HIGH; channel.enableVibration(true)
              </div>
            </li>
            <li>
              **Implement `BootReceiver`**: When the user restarts their phone, Android wipes scheduled alarms from memory. The `BootReceiver` listens to `ACTION_BOOT_COMPLETED` and queries Room DB to immediately re-arm all future alarms!
            </li>
          </ul>
        </div>

        {/* Phase 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Jetpack Compose UI & Mobile Gestures</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Composable Screens</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Build touch-friendly mobile components:
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-5">
            <li>`SwipeToDismissBox`: Swipe right to complete a task, swipe left to snooze by 30 minutes.</li>
            <li>Bottom Navigation Bar with badges for overdue tasks and pending follow-ups.</li>
            <li>Interactive Glance App Widget on the home screen showing &quot;Today&apos;s Priorities&quot;.</li>
          </ul>
        </div>

        {/* Phase 5 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>Android Permissions & Battery Whitelist Prompt</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Permissions UX</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Modern Android (Android 13+) requires explicit runtime permissions for `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM`. Prompt the user with a welcoming onboarding screen explaining that permissions are required for alarm reliability.
          </p>
        </div>

        {/* Phase 6 & 7 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">6</span>
              <span>Google Play Store Deployment & Testing</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">App Bundle (.aab)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Create signed Android App Bundle (.aab) via `gradlew bundleRelease`. Test battery optimization bypass on Samsung (OneUI) and Xiaomi (MIUI) devices where aggressive task-killers operate. Upload to Google Play Console Internal Track!
          </p>
        </div>
      </div>

      {/* Code Snippets for Immediate Copying */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Production Android Code Templates
        </h2>

        {/* Manifest code block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>AndroidManifest.xml</span>
            </span>
            <button
              onClick={() => copyToClipboard(manifestSnippet, 'manifest')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'manifest' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed bg-slate-950">
            {manifestSnippet}
          </pre>
        </div>

        {/* Alarm Receiver code block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>AlarmReceiver.kt (Exact Background Alarms)</span>
            </span>
            <button
              onClick={() => copyToClipboard(alarmReceiverSnippet, 'receiver')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'receiver' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed bg-slate-950">
            {alarmReceiverSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
