const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseApp = null;
let firestoreDb = null;
let isFirebaseConfigured = false;

// In-memory / file-backed fallback storage for local development when Firebase Admin credentials are not yet supplied
const fallbackStoragePath = path.join(__dirname, '../data');
if (!fs.existsSync(fallbackStoragePath)) {
  fs.mkdirSync(fallbackStoragePath, { recursive: true });
}

class FallbackCollection {
  constructor(collectionName) {
    this.name = collectionName;
    this.filePath = path.join(fallbackStoragePath, `${collectionName}.json`);
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {};
      }
    } catch (e) {
      this.data = {};
    }
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error(`Error saving fallback collection ${this.name}:`, e.message);
    }
  }

  doc(id) {
    const self = this;
    return {
      id,
      async get() {
        self._load();
        const docData = self.data[id];
        return {
          exists: !!docData,
          id,
          data: () => (docData ? { ...docData } : undefined)
        };
      },
      async set(data, options = {}) {
        self._load();
        if (options && options.merge && self.data[id]) {
          self.data[id] = { ...self.data[id], ...data, updatedAt: new Date().toISOString() };
        } else {
          self.data[id] = { ...data, id, updatedAt: new Date().toISOString() };
        }
        self._save();
        return { writeTime: new Date() };
      },
      async update(data) {
        self._load();
        if (!self.data[id]) {
          throw new Error(`Document ${id} does not exist in collection ${self.name}`);
        }
        self.data[id] = { ...self.data[id], ...data, updatedAt: new Date().toISOString() };
        self._save();
        return { writeTime: new Date() };
      },
      async delete() {
        self._load();
        delete self.data[id];
        self._save();
        return { writeTime: new Date() };
      }
    };
  }

  where(field, op, value) {
    const self = this;
    return {
      async get() {
        self._load();
        const results = [];
        for (const [id, docData] of Object.entries(self.data)) {
          let match = false;
          if (op === '==' && docData[field] === value) match = true;
          if (op === 'array-contains' && Array.isArray(docData[field]) && docData[field].includes(value)) match = true;
          if (match) {
            results.push({
              id,
              exists: true,
              data: () => ({ ...docData })
            });
          }
        }
        return {
          empty: results.length === 0,
          size: results.length,
          docs: results,
          forEach(callback) {
            results.forEach(callback);
          }
        };
      }
    };
  }

  async get() {
    this._load();
    const docs = Object.entries(this.data).map(([id, docData]) => ({
      id,
      exists: true,
      data: () => ({ ...docData })
    }));
    return {
      empty: docs.length === 0,
      size: docs.length,
      docs,
      forEach(callback) {
        docs.forEach(callback);
      }
    };
  }
}

const fallbackFirestore = {
  collections: {},
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new FallbackCollection(name);
    }
    return this.collections[name];
  }
};

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    firestoreDb = admin.firestore();
    firestoreDb.settings({ ignoreUndefinedProperties: true });
    isFirebaseConfigured = true;
    console.log('[Firebase Admin] Successfully initialized with live credentials.');
  } else {
    console.warn('[Firebase Admin] Credentials not found in .env. Running with local development store.');
  }
} catch (error) {
  console.warn('[Firebase Admin] Initialization warning:', error.message);
  console.warn('[Firebase Admin] Using local development fallback store.');
}

const getFirestore = () => {
  if (isFirebaseConfigured && firestoreDb) {
    return firestoreDb;
  }
  return fallbackFirestore;
};

const verifyIdToken = async (idToken) => {
  if (!idToken) return null;

  // Support development token for local testing
  if (idToken.startsWith('dev_token_') || idToken === 'test-token') {
    const uid = idToken.replace('dev_token_', '') || 'dev_user_123';
    return {
      uid,
      email: `${uid}@example.com`,
      name: 'Developer User',
      picture: ''
    };
  }

  if (isFirebaseConfigured && firebaseApp) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (err) {
      console.error('[Firebase Auth] Token verification failed:', err.message);
      return null;
    }
  }

  // If Firebase Admin credentials are not yet configured on server,
  // decode standard JWT payload safely for local development preview
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload.user_id || payload.sub) {
        return {
          uid: payload.user_id || payload.sub,
          email: payload.email || 'user@example.com',
          name: payload.name || 'User',
          picture: payload.picture || ''
        };
      }
    }
  } catch (err) {
    // ignore
  }

  return null;
};

module.exports = {
  admin,
  getFirestore,
  verifyIdToken,
  isFirebaseConfigured: () => isFirebaseConfigured
};
