# 📱 تحويل مشروع البث إلى تطبيق iOS و Android (Capacitor)

هذا المجلد يحتوي غلاف (Wrapper) جاهز بـ **Capacitor** لتحويل صفحتك الحالية (HLS + LiveKit) إلى تطبيق يُرفع على **App Store** و **Google Play**.

> الفكرة: نشغّل نفس الصفحة (HTML/JS) داخل WebView مع صلاحيات الكاميرا/المايك وجميع النطاقات المسموح بها.

---

## 1) المتطلبات
- Node.js 18+
- Xcode 15+ (على macOS) لنسخة iOS
- Android Studio (آخر نسخة) لنسخة Android
- حساب Apple Developer + حساب Google Play
- ملفات مشروعك (index.html, app.js, vendor/*.js) — موجودة هنا في `www/`

---

## 2) هيكلة المشروع
```text
steps-mobile-wrapper-capacitor/
├─ www/                  ← هنا ملفات الواجهة (HTML/JS/CSS)
│  ├─ index.html         ← تم تعديل الـCSP لتناسب Capacitor
│  ├─ app.js             ← شيفرتك كما هي
│  └─ vendor/
│     ├─ hls.min.js
│     └─ livekit-client.umd.js
├─ capacitor.config.ts   ← إعدادات النطاقات، المعرف، الاسم
├─ package.json          ← سكربتات Capacitor
├─ ios/InfoPlist.additions.plist       ← إضافات مطلوبة لملف Info.plist
└─ android/AndroidManifest.additions.xml ← صلاحيات الكاميرا/المايك
```

**مهم:** تأكد أن ملفات `vendor/hls.min.js` و `vendor/livekit-client.umd.js` متوفّرة (انسخها من مستودعك).

---

## 3) التثبيت والمزامنة
```bash
npm run init
npm run add:ios
npm run add:android
npm run sync
```

- افتح iOS: `npm run open:ios`
- افتح Android: `npm run open:android`

---

## 4) iOS — تعديلات لازمة

1) افتح Xcode ثم:
   - في **Signing & Capabilities**:
     - فعّل **Camera** و **Microphone** (Privacy Usage).
     - (اختياري) فعّل Background Mode: **Audio, AirPlay, and Picture in Picture** لو أردت استمرار الصوت عند قفل الشاشة.
   - في **Info** أضف مفاتيح الخصوصية (موجودة كقالب في `ios/InfoPlist.additions.plist`):
     - `NSCameraUsageDescription`
     - `NSMicrophoneUsageDescription`

2) تمكين تشغيل الفيديو داخل الصفحة بدون ملء الشاشة الإجباري:
   - Capacitor يفعّل `allowsInlineMediaPlayback`. إن احتجت، أكّد في `App/AppDelegate.swift`:
     ```swift
     import Capacitor
     @UIApplicationMain
     class AppDelegate: UIResponder, UIApplicationDelegate {
       var window: UIWindow?
       func application(_ application: UIApplication,
                        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
         // الإعدادات الافتراضية لكاباسيتور تكفي عادة
         return true
       }
     }
     ```

3) **App Transport Security (ATS):**
   - جميع الروابط لديك HTTPS/WSS، فلا حاجة لاستثناءات خاصة.
   - إن ظهر تحذير نادر لتوافق TLS، يمكنك إضافة استثناء مقيد للدومين المعني.

4) البناء والتوزيع:
   - اختر جهاز حقيقي/Generic iOS Device.
   - Product → Archive → Distribute عبر **TestFlight** ثم **App Store**.

---

## 5) Android — تعديلات لازمة

1) في Android Studio تأكد من وجود هذه الصلاحيات داخل `android/app/src/main/AndroidManifest.xml` (القالب في `android/AndroidManifest.additions.xml`):
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-feature android:name="android.hardware.camera.any" />
   <uses-feature android:name="android.hardware.microphone" />
   ```

2) WebRTC & الأذونات:
   - WebView يطلب الأذونات تلقائياً. عند أول استخدام للكاميرا/المايك سيظهر Prompt للمستخدم.
   - لا حاجة لتغييرات برمجية إضافية غالباً.

3) البناء:
   - Build → Generate Signed Bundle/APK → Android App Bundle (AAB).
   - ارفع الـAAB إلى Google Play Console.

---

## 6) سياسات المتجرين (خصوصية)
- **App Store / Google Play**: في نماذج الخصوصية صرّح باستخدام **الكاميرا والمايك** و**بيانات الاستخدام** (إن كانت تُجمع) بدون تتبّع إعلاني.
- لا يوجد SDK تتبّع (Tracking) في هذا القالب.
- وفّر صفحة سياسة خصوصية على موقعك.

---

## 7) نقاط تقنية مهمة
- تم تعديل **CSP** في `index.html` للسماح بالمصدر `capacitor://localhost` و`http://localhost` والـ`wss://*.livekit.cloud` وباقي نطاقاتك:
  - LiveKit: `wss://presinter-stream-gjthpz2z.livekit.cloud`
  - HLS Proxy: `https://hls-proxy.it-f2c.workers.dev`
  - Token API: `https://steps-presinter.onrender.com`
  - CDN: `https://cdn.jsdelivr.net`, `https://unpkg.com`
- يوجد زر "تشغيل/بدء المزامنة" يوفّر الـUser Gesture المطلوبة لتشغيل الوسائط على iOS.
- إن رغبت في استمرار البث بعد قفل الشاشة، ستحتاج إلى حلول أعمق (CallKit/Native WebRTC). النسخة الحالية تعمل أثناء فتح التطبيق في المقدّمة.

---

## 8) تغيير الأيقونة واسم الحزمة
- في `capacitor.config.ts` غيّر:
  - `appId`: مثال `com.steps.presinter`
  - `appName`: اسم التطبيق الظاهر
- أيقونة iOS: 1024×1024 PNG (بدون شفافية). أيقونة Android ضمن `mipmap-*/ic_launcher.png` (يمكن استخدام Android Asset Studio).

---

## 9) ماذا لو أردت تحميل الصفحة من الإنترنت بدل النسخة المحلية؟
- ممكن ضبط `server.url` في `capacitor.config.ts` إلى `https://steps-presinter-cam.pages.dev/`، لكن الأفضل شحن الملفات محلياً لتقليل فرص الرفض من Apple.
- إن فعلت ذلك، راعِ سياسات "Webview-only" ووفّر قيمة مضافة داخل التطبيق.

---

## 10) أوامر مفيدة
```bash
# بعد أي تعديل داخل www/
npm run sync

# فتح المنصّات
npm run open:ios
npm run open:android
```

بالتوفيق، وإذا أردت دمج ميزات إضافية (حفظ لقطات، كتم المايك من مستوى النظام، إبقاء الشاشة نشطة، إلخ) أخبرني أضيفها لك كبلجنات Capacitor.
