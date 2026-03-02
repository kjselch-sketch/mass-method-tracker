# Mass Method Tracker — Setup Guide

Follow these steps **once** and your app will be live on any device, forever.
Total time: ~15 minutes. No coding required.

---

## PART 1 — Firebase (your cloud database)

### Step 1 — Create a free Firebase account
1. Go to **https://console.firebase.google.com**
2. Sign in with your Google account
3. Click **"Create a project"**
4. Name it anything (e.g. `mass-method`) → click through the prompts → **Create project**

### Step 2 — Create a Firestore database
1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → click Next
4. Pick any location (closest to you) → click **"Enable"**

### Step 3 — Get your Firebase config keys
1. Click the ⚙️ gear icon (top-left) → **"Project settings"**
2. Scroll down to **"Your apps"** → click the **`</>`** (Web) icon
3. Register the app — name it anything → click **"Register app"**
4. You'll see a block of code with your keys. Copy the object inside `firebaseConfig = { ... }`
   It looks like this:
   ```
   {
     apiKey: "AIza...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-app",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123"
   }
   ```

### Step 4 — Paste your keys into the app
1. Open the file **`src/firebase.js`** in a text editor (Notepad is fine)
2. Replace the placeholder values with your real values from Step 3
3. Save the file

---

## PART 2 — GitHub (stores your code online)

### Step 5 — Create a free GitHub account
1. Go to **https://github.com** and sign up (free)
2. Click **"New repository"**
3. Name it `mass-method-tracker` → set to **Public** → click **"Create repository"**

### Step 6 — Upload your files
1. On the repository page, click **"uploading an existing file"**
2. Drag the entire `mass-method-tracker` folder contents into the upload area
3. Click **"Commit changes"**

---

## PART 3 — Vercel (hosts your app online for free)

### Step 7 — Deploy with Vercel
1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **"Add New Project"**
3. Find your `mass-method-tracker` repo and click **"Import"**
4. Leave all settings as-is → click **"Deploy"**
5. In ~60 seconds, Vercel gives you a URL like `mass-method-tracker.vercel.app`

---

## PART 4 — Use it everywhere

### On your iPhone
1. Open Safari → go to your Vercel URL
2. Tap the **Share** button (box with arrow) → **"Add to Home Screen"**
3. Name it "Mass Method" → tap Add
4. It now lives on your home screen like a regular app!

### Sync code
- First time you open the app, enter a **sync code** (make up anything, e.g. `kevin-lifts`)
- Use the **exact same code** on every device
- All your logs instantly sync across phone, laptop, tablet — anywhere

---

## That's it!

Your app is now live. Any workout you log on your phone appears on your laptop, and vice versa, in real time.

**Firebase free tier limits** (you will never hit these):
- 50,000 reads per day
- 20,000 writes per day
- 1 GB storage
