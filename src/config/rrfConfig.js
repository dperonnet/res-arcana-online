export const rrfConfig = {
  attachAuthIsReady: true,
  userProfile: 'users', // where profiles are stored in database
  useFirestoreForProfile: true, // Firestore for Profile instead of Realtime DB
  presence: 'presence', // where list of online users is stored in database
  sessions: 'sessions', // where list of user sessions is stored in database (presence must be enabled)
}
