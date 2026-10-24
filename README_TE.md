# Rakhi Driving School — Online Gallery + Admin Upload Setup

Rakhi Driving School 2003లో ప్రారంభమైందనే వివరాన్ని websiteలో కూడా చూపించాం.

ఈ ప్యాకేజీలో మీ ప్రస్తుత website HTML, Firebase cloud gallery code, admin login UI, Firestore/Storage security rules, Firebase Hosting config ఉన్నాయి. Owner photo మరియు A. Sirisha photo ఉన్న ప్రస్తుత HTMLని ఆధారంగా తీసుకున్నాం; వాటిని ఈ setup కోసం మార్చలేదు.

## ముందుగా తెలుసుకోవాల్సినవి
- Websiteను online publish చేయడానికి మీ స్వంత Firebase/Google accountలో setup చేయాలి.
- ఈ package మాత్రమే download చేస్తే cloud upload వెంటనే పని చేయదు. `firebase-config.js`లో మీ project values పెట్టి, Firebase Consoleలో services enable చేసి rules publish చేసిన తర్వాతే పని చేస్తుంది.
- Admin email/passwordను ఈ chatలో పంపకండి.
- Public gallery items అందరికీ కనిపిస్తాయి. Upload/delete మాత్రం rulesలో పేర్కొన్న admin emailకే అనుమతి.
- Firebase usage/Storage charges and quotas can change. Firebase Consoleలో current pricing/limits check చేయండి; videos ఎక్కువ storage/data వాడతాయి.

## A. Firebase project సృష్టించండి
1. Chromeలో https://console.firebase.google.com/ తెరవండి, మీ Google accountతో sign in అవ్వండి.
2. **Add project** ఎంచుకుని `rakhi-driving-school` వంటి project name పెట్టండి.
3. Projectలో **Build → Authentication → Get started → Sign-in method → Email/Password** enable చేయండి.
4. **Authentication → Users → Add user** ద్వారా మీకు మాత్రమే తెలిసిన admin email, strong password సృష్టించండి. Passwordను సురక్షితంగా ఉంచండి.
5. **Build → Firestore Database → Create database** ఎంచుకోండి. Production mode ఎంచుకోవచ్చు.
6. **Build → Storage → Get started** ఎంచుకుని Storage bucket సృష్టించండి. అవసరమైతే billing/Blaze plan లేదా payment setup అడగవచ్చు; కొనసాగించే ముందు Firebase consoleలో ప్రస్తుత షరతులు చదవండి.
7. Project settings (gear icon) → **General → Your apps → Web app (</>)** → Register app. కనిపించే Firebase config valuesను కాపీ చేసుకోండి.

## B. Config values పెట్టండి
1. `firebase-config.js` fileను text editorలో తెరవండి.
2. `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`లను Firebase Console ఇచ్చిన valuesతో replace చేయండి.
   - Storage bucket valueను consoleలో ఇచ్చినదానితో అలాగే copy చేయండి. కొన్ని projectsలో `PROJECT_ID.firebasestorage.app`, పాతవాటిలో `PROJECT_ID.appspot.com` ఉండవచ్చు.
3. `ADMIN_EMAIL`ని Authenticationలో సృష్టించిన admin emailతో replace చేయండి.
4. `firestore.rules` మరియు `storage.rules`లోని `replace-with-your-admin-email@example.com`ని అదే admin emailతో replace చేయండి. మూడు చోట్ల email ఖచ్చితంగా ఒకటే ఉండాలి.

## C. Rules publish చేయండి
Firebase Consoleలో:
- **Firestore Database → Rules**: `firestore.rules`లోని content paste చేసి **Publish**.
- **Storage → Rules**: `storage.rules`లోని content paste చేసి **Publish**.

Rulesలో gallery చదవడం public; upload/delete admin emailకు మాత్రమే. Rules publish చేయకుండా websiteను publicగా upload చేయకండి.

## D. Website online publish చేయండి (Firebase Hosting)
ఈ దశకు laptop/PCలో Node.js మరియు Firebase CLI సులభం. Android phoneలో Termux వాడటం సాధ్యమే కానీ beginnersకి కష్టంగా ఉండవచ్చు.
1. Node.js install: https://nodejs.org/
2. Terminal/Command Promptలో:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
3. ఈ package folderకి terminalలో వెళ్లండి.
4. `.firebaserc.example`ని `.firebaserc`గా copy చేసి `YOUR_FIREBASE_PROJECT_ID` స్థానంలో మీ project ID పెట్టండి.
5. `firebase-config.js`లో config పూర్తి చేసిన తర్వాత:
   ```bash
   firebase deploy
   ```
6. Deploy పూర్తయ్యాక Firebase CLI ఇచ్చే `https://YOUR_PROJECT_ID.web.app` link తెరిచి పరీక్షించండి.

## E. Gallery పరీక్ష
1. Published siteలో **Gallery → Admin / Add photos & videos** తెరవండి.
2. Admin email/passwordతో sign in అవ్వండి.
3. Photo లేదా video ఎంచుకుని **Upload to gallery** నొక్కండి.
4. Upload పూర్తయిన తర్వాత page refresh చేయండి. Item ఇంకా కనిపిస్తే online save అయింది.
5. ఇంకో phone/browserలో public website తెరిచి gallery item కనిపిస్తుందో చూడండి.
6. Delete చేయాలంటే adminగా sign in అయి itemపై **Delete** నొక్కండి.

## పరిమాణ పరిమితులు
- Frontendలో photo: 8 MB వరకు; video: 50 MB వరకు.
- Storage rulesలో 50 MB గరిష్ఠ పరిమితి.
- Supported videos: MP4, WebM, MOV/QuickTime. Browser/device compatibility ఆధారంగా playback మారవచ్చు.
- ఎక్కువ లేదా పెద్ద videos upload చేస్తే storage/download charges రావచ్చు.

## Troubleshooting
- “Setup required”: `firebase-config.js` values ఇంకా placeholderలో ఉన్నాయి.
- Sign in fails: Email/Password provider enabled ఉందో, admin user సృష్టించారో, email/password సరైనవో చూడండి.
- Gallery empty / permission error: Firestore Database create అయిందో, `firestore.rules` publish అయిందో చూడండి.
- Upload fails: Storage bucket setup, `storage.rules`, billing/quota, file size, network check చేయండి.
- Owner/instructor photos: existing HTMLలో embeddedగా ఉన్నాయి; cloud gallery code వాటిని మార్చదు.

## Included files
- `index.html` — మీ website
- `firebase-config.js` — మీ Firebase config values ఇక్కడ పెట్టాలి
- `firebase-gallery.js` — persistent gallery + admin login/upload/delete
- `firestore.rules` — gallery metadata security
- `storage.rules` — media files security
- `firebase.json` — Hosting deployment config
- `.firebaserc.example` — project ID template
