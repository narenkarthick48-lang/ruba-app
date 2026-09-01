import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBv30wRnc9CJAo0mFQF_7nAXuytZyurfkk",
  authDomain: "ruba-34782.firebaseapp.com",
  projectId: "ruba-34782",
  storageBucket: "ruba-34782.firebasestorage.app",
  messagingSenderId: "916875849283",
  appId: "1:916875849283:web:79bd7170ade790527eeef6",
  measurementId: "G-YY47Z8PCXQ"
};


/* ==========================================
   INITIALIZE FIREBASE
========================================== */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


/* ==========================================
   ELEMENTS
========================================== */

const loginScreen = document.getElementById("loginScreen");
const setupScreen = document.getElementById("setupScreen");
const appScreen = document.getElementById("appScreen");

const googleLogin = document.getElementById("googleLogin");
const logout = document.getElementById("logout");

const usernameInput = document.getElementById("usernameInput");
const usernameStatus = document.getElementById("usernameStatus");
const createProfile = document.getElementById("createProfile");

const userPhoto = document.getElementById("userPhoto");
const profilePhoto = document.getElementById("profilePhoto");

const welcomeText = document.getElementById("welcomeText");

const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileCode = document.getElementById("profileCode");
const profileMode = document.getElementById("profileMode");

const chatList = document.getElementById("chatList");

const chatPhoto = document.getElementById("chatPhoto");
const chatName = document.getElementById("chatName");
const chatUsername = document.getElementById("chatUsername");

const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");


/* ==========================================
   STATE
========================================== */

let currentUser = null;
let currentProfile = null;
let currentChatUser = null;

let selectedMode = "private";
let stopMessagesListener = null;


/* ==========================================
   HELPERS
========================================== */

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}


function validUsername(username) {

  return /^[\p{L}\p{N}_.-]{3,24}$/u.test(
    username
  );

}


function makeRubaCode() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function makePart(length) {

    let result = "";

    for (let i = 0; i < length; i++) {

      result +=
        chars[Math.floor(Math.random() * chars.length)];

    }

    return result;
  }

  return `RBA-${makePart(4)}-${makePart(4)}`;
}


function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


function showScreen(screen) {

  loginScreen.classList.add("hidden");
  setupScreen.classList.add("hidden");
  appScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}


function makeChatId(uid1, uid2) {

  return [uid1, uid2].sort().join("_");

}


/* ==========================================
   GOOGLE LOGIN
========================================== */

googleLogin.addEventListener(
  "click",
  async () => {

    try {

      googleLogin.disabled = true;
      googleLogin.innerHTML = "Connecting...";

      await signInWithPopup(
        auth,
        provider
      );

    } catch (error) {

      console.error(error);

      alert(
        "Google login failed. Please try again."
      );

      googleLogin.disabled = false;

      googleLogin.innerHTML =
        '<span>G</span> Continue with Google';

    }

  }
);


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(
  auth,
  async (user) => {

    currentUser = user;

    if (!user) {

      currentProfile = null;

      showScreen(loginScreen);

      return;
    }


    try {

      const userRef =
        doc(db, "users", user.uid);

      const snapshot =
        await getDoc(userRef);


      if (snapshot.exists()) {

        currentProfile =
          snapshot.data();

        enterRuba();

      } else {

        showScreen(setupScreen);

      }

    } catch (error) {

      console.error(error);

      alert(
        "Could not load your Ruba profile."
      );

    }

  }
);


/* ==========================================
   PRIVATE / PUBLIC MODE
========================================== */

document
  .querySelectorAll(".mode")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".mode")
          .forEach(btn => {

            btn.classList.remove("active");

          });


        button.classList.add("active");

        selectedMode =
          button.dataset.mode;

      }
    );

  });


/* ==========================================
   USERNAME CHECK
========================================== */

usernameInput.addEventListener(
  "input",
  async () => {

    const username =
      usernameInput.value.trim();


    createProfile.disabled = true;


    if (!validUsername(username)) {

      usernameStatus.textContent =
        "3–24 characters. Letters, numbers, _, . and - only.";

      return;
    }


    usernameStatus.textContent =
      "Checking availability...";


    try {

      const normalized =
        normalizeUsername(username);


      const usernameQuery =
        query(
          collection(db, "users"),
          where(
            "usernameNormalized",
            "==",
            normalized
          )
        );


      const snapshot =
        await getDocs(usernameQuery);


      if (!snapshot.empty) {

        usernameStatus.textContent =
          "✕ Username already taken";

        return;
      }


      usernameStatus.textContent =
        "✓ Username available";

      createProfile.disabled = false;

    } catch (error) {

      console.error(error);

      usernameStatus.textContent =
        "Could not check username.";

    }

  }
);


/* ==========================================
   CREATE RUBA PROFILE
========================================== */

createProfile.addEventListener(
  "click",
  async () => {

    if (!currentUser) return;


    const username =
      usernameInput.value.trim();


    if (!validUsername(username)) {

      return;
    }


    createProfile.disabled = true;

    createProfile.textContent =
      "Creating...";


    try {

      const normalized =
        normalizeUsername(username);


      const usernameQuery =
        query(
          collection(db, "users"),
          where(
            "usernameNormalized",
            "==",
            normalized
          )
        );


      const usernameSnapshot =
        await getDocs(usernameQuery);


      if (!usernameSnapshot.empty) {

        usernameStatus.textContent =
          "✕ Username already taken";

        createProfile.disabled = false;

        createProfile.textContent =
          "Enter Ruba →";

        return;
      }


      const rubaCode =
        makeRubaCode();


      const profile = {

        uid: currentUser.uid,

        displayName:
          currentUser.displayName ||
          "Ruba User",

        username:

          username,

        usernameNormalized:

          normalized,

        rubaCode:

          rubaCode,

        mode:

          selectedMode,

        photoURL:

          currentUser.photoURL ||
          "",

        createdAt:

          serverTimestamp()

      };


      await setDoc(
        doc(db, "users", currentUser.uid),
        profile
      );


      currentProfile =
        profile;


      enterRuba();


    } catch (error) {

      console.error(error);

      alert(
        "Could not create your Ruba identity."
      );

      createProfile.disabled = false;

      createProfile.textContent =
        "Enter Ruba →";

    }

  }
);


/* ==========================================
   ENTER RUBA
========================================== */

function enterRuba() {

  showScreen(appScreen);


  const name =
    currentProfile?.displayName ||
    currentUser?.displayName ||
    "there";


  welcomeText.textContent =
    `Hello, ${name.split(" ")[0]} 👋`;


  const photo =
    currentProfile?.photoURL ||
    currentUser?.photoURL ||
    "";


  userPhoto.src = photo;

  profilePhoto.src = photo;


  profileName.textContent =
    currentProfile?.displayName ||
    "Ruba User";


  profileUsername.textContent =
    `@${currentProfile?.username || "—"}`;


  profileCode.textContent =
    currentProfile?.rubaCode ||
    "RBA-———-——";


  profileMode.textContent =

    currentProfile?.mode === "public"

      ? "🌎 Public"

      : "🔒 Private";


  loadChats();

}


/* ==========================================
   NAVIGATION
========================================== */

document
  .querySelectorAll("[data-view]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openView(
          button.dataset.view
        );

      }
    );

  });


function openView(viewName) {

  document
    .querySelectorAll(".view")
    .forEach(view => {

      view.classList.add("hidden");

    });


  const target =
    document.getElementById(
      `${viewName}View`
    );


  if (target) {

    target.classList.remove("hidden");

  }


  document
    .querySelectorAll(".bottom-nav button")
    .forEach(button => {

      button.classList.remove("active");

    });


  document
    .querySelectorAll(
      `.bottom-nav button[data-view="${viewName}"]`
    )
    .forEach(button => {

      button.classList.add("active");

    });


  if (viewName === "chats") {

    loadChats();

  }

}


/* ==========================================
   SEARCH
========================================== */

let searchTimer = null;


searchBox.addEventListener(
  "input",
  () => {

    clearTimeout(searchTimer);


    const value =
      searchBox.value.trim();


    if (!value) {

      searchResults.innerHTML = "";

      return;
    }


    searchTimer =
      setTimeout(
        () => searchUsers(value),
        350
      );

  }
);


/* ==========================================
   SEARCH USERS
========================================== */

async function searchUsers(value) {

  searchResults.innerHTML =
    `<div class="muted">Searching...</div>`;


  try {

    const usersRef =
      collection(db, "users");


    const results = [];


    const searchValue =
      value
        .replace(/^@/, "")
        .trim()
        .toLowerCase();


    /* USERNAME SEARCH */

    const usernameQuery =
      query(
        usersRef,
        where(
          "usernameNormalized",
          "==",
          searchValue
        )
      );


    const usernameSnapshot =
      await getDocs(usernameQuery);


    usernameSnapshot.forEach(
      item => {

        results.push(
          item.data()
        );

      }
    );


    /* RUBA CODE SEARCH */

    if (results.length === 0) {

      const codeQuery =
        query(
          usersRef,
          where(
            "rubaCode",
            "==",
            value.toUpperCase()
          )
        );


      const codeSnapshot =
        await getDocs(codeQuery);


      codeSnapshot.forEach(
        item => {

          results.push(
            item.data()
          );

        }
      );

    }


    /* DISPLAY NAME SEARCH */

    if (results.length === 0) {

      const allUsers =
        await getDocs(usersRef);


      allUsers.forEach(
        item => {

          const data =
            item.data();


          const name =
            (
              data.displayName ||
              ""
            ).toLowerCase();


          const username =
            (
              data.username ||
              ""
            ).toLowerCase();


          const code =
            (
              data.rubaCode ||
              ""
            ).toLowerCase();


          if (

            name.includes(
              value.toLowerCase()
            )

            ||

            username.includes(
              searchValue
            )

            ||

            code.includes(
              value.toLowerCase()
            )

          ) {

            results.push(data);

          }

        }
      );

    }


    const filtered =
      results
        .filter(
          user =>
            user.uid !== currentUser.uid
        )
        .slice(0, 10);


    renderSearchResults(filtered);


  } catch (error) {

    console.error(error);

    searchResults.innerHTML =
      `<div class="muted">
        Search failed.
      </div>`;

  }

}


/* ==========================================
   SEARCH RESULT UI
========================================== */

function renderSearchResults(users) {

  if (users.length === 0) {

    searchResults.innerHTML = `

      <div class="empty">

        <div>🔎</div>

        <b>No Ruba found</b>

        <p>
          Try a username or Ruba Code.
        </p>

      </div>

    `;

    return;
  }


  searchResults.innerHTML =

    users
      .map(user => {

        const photo =
          escapeHTML(
            user.photoURL || ""
          );


        const name =
          escapeHTML(
            user.displayName ||
            "Ruba User"
          );


        const username =
          escapeHTML(
            user.username ||
            ""
          );


        const code =
          escapeHTML(
            user.rubaCode ||
            ""
          );


        const mode =
          user.mode === "public"
            ? "🌎 Public"
            : "🔒 Private";


        const action =
          user.mode === "public"
            ? "Chat"
            : "Request";


        return `

          <div class="result">

            <img
              src="${photo}"
              alt=""
            >

            <div class="result-info">

              <b>${name}</b>

              <small>
                @${username}
                · ${code}
                · ${mode}
              </small>

            </div>

            <button
              class="connect"
              data-user-id="${escapeHTML(user.uid)}"
            >
              ${action}
            </button>

          </div>

        `;

      })
      .join("");


  document
    .querySelectorAll(".connect")
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const uid =
            button.dataset.userId;


          const userSnapshot =
            await getDoc(
              doc(db, "users", uid)
            );


          if (!userSnapshot.exists()) {

            return;
          }


          const otherUser =
            userSnapshot.data();


          if (
            otherUser.mode ===
            "public"
          ) {

            openChat(otherUser);

          } else {

            await sendConnectionRequest(
              otherUser
            );

          }

        }
      );

    });

}


/* ==========================================
   PRIVATE CONNECTION REQUEST
========================================== */

async function sendConnectionRequest(
  otherUser
) {

  try {

    const requestId =
      `${currentUser.uid}_${otherUser.uid}`;


    const requestRef =
      doc(
        db,
        "connectionRequests",
        requestId
      );


    const existing =
      await getDoc(requestRef);


    if (existing.exists()) {

      alert(
        "Your request is already waiting."
      );

      return;
    }


    await setDoc(
      requestRef,
      {

        fromUid:
          currentUser.uid,

        fromName:
          currentProfile.displayName,

        fromUsername:
          currentProfile.username,

        toUid:
          otherUser.uid,

        toName:
          otherUser.displayName,

        toUsername:
          otherUser.username,

        status:
          "pending",

        createdAt:
          serverTimestamp()

      }
    );


    alert(
      `Request sent to @${otherUser.username} 🌹`
    );


  } catch (error) {

    console.error(error);

    alert(
      "Could not send connection request."
    );

  }

}


/* ==========================================
   OPEN CHAT
========================================== */

async function openChat(otherUser) {

  currentChatUser =
    otherUser;


  chatName.textContent =
    otherUser.displayName ||
    "Ruba User";


  chatUsername.textContent =
    `@${otherUser.username || ""}`;


  chatPhoto.src =
    otherUser.photoURL ||
    "";


  messages.innerHTML =
    `<div class="muted">
      Loading conversation...
    </div>`;


  openView("chat");


  if (stopMessagesListener) {

    stopMessagesListener();

    stopMessagesListener =
      null;

  }


  const chatId =
    makeChatId(
      currentUser.uid,
      otherUser.uid
    );


  const messagesQuery =
    query(
      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );


  stopMessagesListener =
    onSnapshot(
      messagesQuery,

      snapshot => {

        messages.innerHTML = "";


        snapshot.forEach(
          messageDoc => {

            const message =
              messageDoc.data();


            const mine =
              message.senderId ===
              currentUser.uid;


            const bubble =
              document.createElement(
                "div"
              );


            bubble.className =
              `msg ${
                mine
                  ? "mine"
                  : "theirs"
              }`;


            const date =
              message
                .createdAt
                ?.toDate?.();


            const time =
              date

                ? date.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )

                : "";


            bubble.innerHTML = `

              ${escapeHTML(
                message.text || ""
              )}

              <time>
                ${time}
              </time>

            `;


            messages.appendChild(
              bubble
            );

          }
        );


        messages.scrollTop =
          messages.scrollHeight;

      },

      error => {

        console.error(error);

        messages.innerHTML =
          `<div class="muted">
            Could not load messages.
          </div>`;

      }

    );

}


/* ==========================================
   SEND MESSAGE
========================================== */

messageForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (
      !currentUser ||
      !currentChatUser
    ) {

      return;
    }


    const text =
      messageInput.value.trim();


    if (!text) {

      return;
    }


    messageInput.value = "";


    const chatId =
      makeChatId(
        currentUser.uid,
        currentChatUser.uid
      );


    try {

      await addDoc(
        collection(
          db,
          "chats",
          chatId,
          "messages"
        ),

        {

          senderId:
            currentUser.uid,

          receiverId:
            currentChatUser.uid,

          text:
            text,

          createdAt:
            serverTimestamp()

        }
      );


    } catch (error) {

      console.error(error);

      alert(
        "Message could not be sent."
      );

    }

  }
);


/* ==========================================
   LOAD CHAT LIST
========================================== */

async function loadChats() {

  if (!currentUser) return;


  try {

    const chatMap =
      new Map();


    /*
      V1 chat discovery.

      Later we will add a userChats
      collection for a faster production
      chat list.
    */

    const chatsSnapshot =
      await getDocs(
        collection(db, "chats")
      );


    for (
      const chatDoc of chatsSnapshot.docs
    ) {

      const chatId =
        chatDoc.id;


      if (
        !chatId.includes(
          currentUser.uid
        )
      ) {

        continue;
      }


      const parts =
        chatId.split("_");


      const otherUid =
        parts.find(
          id =>
            id !== currentUser.uid
        );


      if (!otherUid) continue;


      const userSnapshot =
        await getDoc(
          doc(
            db,
            "users",
            otherUid
          )
        );


      if (
        userSnapshot.exists()
      ) {

        chatMap.set(
          otherUid,
          userSnapshot.data()
        );

      }

    }


    if (chatMap.size === 0) {

      chatList.className =
        "empty";


      chatList.innerHTML = `

        <div>💬</div>

        <b>
          No conversations yet
        </b>

        <p>
          Search for someone and
          start your first Ruba
          conversation.
        </p>

      `;

      return;
    }


    chatList.className = "";


    chatList.innerHTML =

      Array
        .from(chatMap.values())
        .map(user => `

          <div
            class="result chat-person"
            data-uid="${escapeHTML(user.uid)}"
          >

            <img
              src="${escapeHTML(
                user.photoURL || ""
              )}"
              alt=""
            >

            <div class="result-info">

              <b>
                ${escapeHTML(
                  user.displayName ||
                  "Ruba User"
                )}
              </b>

              <small>
                @${escapeHTML(
                  user.username || ""
                )}
              </small>

            </div>

            <span>›</span>

          </div>

        `)
        .join("");


    document
      .querySelectorAll(".chat-person")
      .forEach(item => {

        item.addEventListener(
          "click",
          async () => {

            const uid =
              item.dataset.uid;


            const snapshot =
              await getDoc(
                doc(
                  db,
                  "users",
                  uid
                )
              );


            if (
              snapshot.exists()
            ) {

              openChat(
                snapshot.data()
              );

            }

          }
        );

      });


  } catch (error) {

    console.error(error);


    chatList.innerHTML = `

      <div class="empty">

        <div>⚠️</div>

        <b>
          Could not load chats
        </b>

        <p>
          Please check your
          Firestore setup.
        </p>

      </div>

    `;

  }

}


/* ==========================================
   LOGOUT
========================================== */

logout.addEventListener(
  "click",
  async () => {

    if (stopMessagesListener) {

      stopMessagesListener();

      stopMessagesListener =
        null;

    }


    await signOut(auth);

  }
);
