const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://buildchester-quote.firebaseio.com'
  });
admin.firestore().settings({ timestampsInSnapshots: true })

module.exports = admin