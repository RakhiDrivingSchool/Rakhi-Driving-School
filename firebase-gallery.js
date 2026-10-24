import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const statusBox = $("galleryStatus");
const grid = $("galleryGrid");
const loginPanel = $("adminLoginPanel");
const uploadPanel = $("adminUploadPanel");
const loginButton = $("adminLogin");
const logoutButton = $("adminLogout");
const uploadButton = $("uploadMedia");
const filesInput = $("files");
const progressBox = $("uploadProgress");
const uploadToggle = $("toggle");

let auth, db, storage, currentUser = null, galleryUnsubscribe = null;
const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("PASTE_")
  && firebaseConfig.projectId && !firebaseConfig.projectId.includes("PASTE_")
  && ADMIN_EMAIL && !ADMIN_EMAIL.startsWith("replace-with-");

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? "#b42318" : "";
}
function showToast(message) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = message; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}
function updateAdminUI(user) {
  currentUser = user;
  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  loginPanel.hidden = isAdmin;
  uploadPanel.hidden = !isAdmin;
  logoutButton.hidden = !isAdmin;
  loginButton.hidden = isAdmin;
  if (user && !isAdmin) {
    setStatus("Signed in account is not the configured school admin. Sign out and use the authorised admin email.", true);
  } else if (isAdmin) {
    setStatus(`Admin signed in as ${user.email}. Uploads are saved to the online gallery.`);
  }
}
function safeText(s) { return String(s || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

function renderDynamicGallery(items) {
  grid.querySelectorAll("[data-cloud-gallery='true']").forEach(el => el.remove());
  items.forEach(item => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.cloudGallery = "true";
    const media = item.contentType?.startsWith("video/") ? document.createElement("video") : document.createElement("img");
    media.src = item.url;
    if (media.tagName === "VIDEO") { media.controls = true; media.playsInline = true; media.preload = "metadata"; }
    else { media.alt = item.caption || item.fileName || "Rakhi Driving School training photo"; media.loading = "lazy"; }
    const label = document.createElement("label");
    label.textContent = item.caption || item.fileName || "Training media";
    tile.append(media, label);
    if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const del = document.createElement("button");
      del.type = "button"; del.className = "btn outline";
      del.textContent = "Delete"; del.setAttribute("aria-label", "Delete " + (item.caption || item.fileName || "gallery media"));
      del.style.cssText = "position:absolute;top:8px;right:8px;z-index:3;padding:6px 10px;background:white;color:#b42318";
      del.addEventListener("click", async () => {
        if (!confirm("Delete this photo/video permanently from the online gallery?")) return;
        del.disabled = true;
        try {
          await deleteObject(ref(storage, item.storagePath));
          await deleteDoc(doc(db, "gallery", item.id));
          showToast("Gallery item deleted.");
        } catch (e) {
          console.error(e); showToast("Delete failed. Check Firebase Storage/Firestore rules.");
          del.disabled = false;
        }
      });
      tile.append(del);
    }
    grid.append(tile);
  });
}
function startGalleryListener() {
  if (galleryUnsubscribe) galleryUnsubscribe();
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  galleryUnsubscribe = onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDynamicGallery(items);
    setStatus(currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      ? `Admin signed in. ${items.length} uploaded item(s) are saved online.`
      : `${items.length} school photo/video item(s) loaded from the online gallery.`);
  }, (e) => {
    console.error(e);
    setStatus("Could not load online gallery. Check that Firestore is created and firestore.rules are published.", true);
  });
}

uploadToggle?.addEventListener("click", () => $("upload").classList.toggle("open"));
if (!isConfigured) {
  setStatus("Setup required: add your Firebase project settings to firebase-config.js, then publish the Firebase security rules. The gallery upload will not work until configured.", true);
  loginButton.disabled = true;
  uploadButton.disabled = true;
} else {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app); db = getFirestore(app); storage = getStorage(app);
    startGalleryListener();
    onAuthStateChanged(auth, updateAdminUI);
  } catch (e) {
    console.error(e); setStatus("Firebase setup error. Check firebase-config.js values.", true);
  }
}

loginButton?.addEventListener("click", async () => {
  const email = $("adminEmail").value.trim();
  const password = $("adminPassword").value;
  if (!email || !password) return setStatus("Enter your admin email and password.", true);
  loginButton.disabled = true; setStatus("Signing in…");
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      setStatus("That account is not the configured admin email.", true);
    } else {
      $("adminPassword").value = "";
      showToast("Admin login successful.");
    }
  } catch (e) {
    console.error(e); setStatus("Sign-in failed. Check the email/password and enable Email/Password sign-in in Firebase Authentication.", true);
  } finally { loginButton.disabled = false; }
});
logoutButton?.addEventListener("click", async () => {
  try { await signOut(auth); showToast("Signed out."); } catch (e) { setStatus("Sign out failed.", true); }
});

uploadButton?.addEventListener("click", async () => {
  if (!currentUser || currentUser.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return setStatus("Please sign in with the authorised admin account before uploading.", true);
  }
  const files = [...(filesInput.files || [])];
  if (!files.length) return setStatus("Choose at least one photo or video first.", true);
  const caption = $("mediaCaption").value.trim().slice(0, 100);
  uploadButton.disabled = true;
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const allowed = file.type.startsWith("image/") || ["video/mp4","video/webm","video/quicktime"].includes(file.type);
      if (!allowed) throw new Error(`${file.name}: choose an image or MP4/WebM/MOV video.`);
      const maxBytes = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
      if (file.size > maxBytes) throw new Error(`${file.name}: file is too large. Limit is ${file.type.startsWith("video/") ? "50 MB" : "8 MB"}.`);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
      const storagePath = `gallery/${Date.now()}_${crypto.randomUUID()}_${cleanName}`;
      const storageRef = ref(storage, storagePath);
      progressBox.textContent = `Uploading ${i + 1}/${files.length}: ${file.name}`;
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
      await new Promise((resolve, reject) => {
        task.on("state_changed",
          s => { progressBox.textContent = `Uploading ${i + 1}/${files.length}: ${Math.round(s.bytesTransferred / s.totalBytes * 100)}%`; },
          reject, resolve);
      });
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "gallery"), {
        caption: caption || file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name, contentType: file.type, size: file.size,
        url, storagePath, createdAt: serverTimestamp(),
        uploadedBy: currentUser.email
      });
    }
    filesInput.value = ""; $("mediaCaption").value = ""; progressBox.textContent = "";
    showToast("Upload complete. Media is saved online.");
  } catch (e) {
    console.error(e); setStatus(e.message || "Upload failed. Check your connection and Firebase rules.", true);
  } finally { uploadButton.disabled = false; }
});
