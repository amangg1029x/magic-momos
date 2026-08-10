# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Protect our app's custom native services, activities, and receivers from obfuscation
-keep class com.magicmomos.app.MainActivity { *; }
-keep class com.magicmomos.app.MagicMomosMessagingService { *; }
-keep class com.magicmomos.app.OrderAlarmService { *; }
-keep class com.magicmomos.app.StopAlarmReceiver { *; }

# Protect Capacitor and standard Plugins
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Protect Firebase and Google Play Services
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Protect Razorpay SDK
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

