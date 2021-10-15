const admin = require("firebase-admin");

admin.initializeApp();

function convertOperator (operator) {
  switch (operator) {
    case 'EQ': return '==';
    case 'LT': return '<';
    case 'LTE': return '<=';
    case 'GT': return '>';
    case 'GTE': return '>=';
    case 'INARRAY': return 'array-contains';
  }
}

function getFirebaseReferences (document) {
  let promises = []
  Object.keys(document).forEach((key) => {
    if (document[key] && document[key].constructor && document[key].constructor.name === 'DocumentReference') {
      const getReference = async () => {
        const snapshot = await document[key].get();
        document[key] = { id: snapshot.id, ...snapshot.data() };
      };

      promises.push(getReference());
    } else if (typeof document[key] === 'object') {
      promises.push(...getFirebaseReferences(document[key]));
    }
  });

  return promises;
}

function addOrUpdateOrRemoveFirebaseReferences (document, id, collection) {
  Object.keys(document).forEach((key) => {
    if (typeof document[key] === 'object' && document[key].collection) {
      if (document[key].create) { // CREATE REF
        const createData = document[key].create;

        if (typeof document[key].on === 'string') {
          createData[document[key].on] = admin.firestore().doc(`/${collection}/${id}`);
        } else if (Array.isArray(document[key].on)) {
          createData[document[key].on] = [admin.firestore().doc(`/${collection}/${id}`)];
        }

        const documentToCreate = admin.firestore().collection(document[key].collection).doc();
        documentToCreate.set(createData);

        document[key] = { type: 'arrayUnion', doc: admin.firestore().doc(`/${document[key].collection}/${documentToCreate.id}`) };
      } else if (document[key].connect) { // CONNECT REF
        const updateData = {};

        if (typeof document[key].on === 'string') {
          updateData[document[key].on] = admin.firestore().doc(`/${collection}/${id}`);
        } else if (Array.isArray(document[key].on)) {
          updateData[document[key].on] = admin.firestore.FieldValue.arrayUnion(admin.firestore().doc(`/${collection}/${id}`));
        }

        admin.firestore().collection(document[key].collection).doc(document[key].connect).update(updateData);

        document[key] = { type: 'arrayUnion', doc: admin.firestore().doc(`/${document[key].collection}/${document[key].connect}`) };
      } else if (document[key].remove) {
        if (typeof document[key].on === 'string') {
          admin.firestore().collection(document[key].collection).doc(document[key].remove).delete();
        } else if (Array.isArray(document[key].on)) {
          const updateData = {};
          updateData[document[key].on] = admin.firestore.FieldValue.arrayRemove(admin.firestore().doc(`/${collection}/${id}`));
          admin.firestore().collection(document[key].collection).doc(document[key].remove).update(updateData);
        }

        document[key] = { type: 'arrayRemove', doc: admin.firestore().doc(`/${document[key].collection}/${document[key].remove}`) };
      }
    } else if (typeof document[key] === 'object') {
      addOrUpdateOrRemoveFirebaseReferences(document[key], id, collection);
    }
  });
}

function arrayUnionOrRemoveFirebaseReferences (document) {
  Object.keys(document).forEach((key) => {
    if (Array.isArray(document[key]) && document[key][0] && document[key][0].type === 'arrayUnion' && document[key][0].doc && document[key][0].doc.constructor && document[key][0].doc.constructor.name === 'DocumentReference') {
      document[key] = admin.firestore.FieldValue.arrayUnion(...document[key].map(e => e.doc));
    } else if (Array.isArray(document[key]) && document[key][0] && document[key][0].type === 'arrayRemove' && document[key][0].doc && document[key][0].doc.constructor && document[key][0].doc.constructor.name === 'DocumentReference') {
      document[key] = admin.firestore.FieldValue.arrayRemove(...document[key].map(e => e.doc));
    } else if (typeof document[key] === 'object') {
      arrayUnionFirebaseReferences(document[key]);
    }
  });
}

async function get ({ collectionName, where }) {
  /* 
    WHERE CLAUSE
  */
  const field = where ? where.field : false
  const operator = where ? where.operator : false
  const value = where ? where.value : {}

  let collection = admin
    .firestore()
    .collection(collectionName);

  if (where && field === 'id') {
    collection = collection.doc(value.stringValue)
  } else if (where && field && operator && value && (value.intValue || value.stringValue)) {
    collection = collection.where(field, convertOperator(operator), value.intValue ? value.intValue : value.stringValue)
  }

  /* 
    GET DOCUMENTS
  */
  let snapshot = await collection.get()
  if (snapshot.empty) {
    return [];
  }

  if (snapshot && snapshot.constructor && snapshot.constructor.name === 'QueryDocumentSnapshot') {
    snapshot = [snapshot];
  }

  /* 
    FILL REFERENCES
  */
  const documents = [];
  const promises = [];

  snapshot.forEach(async doc => {
    const document = { id: doc.id, ...doc.data() };
    promises.push(...getFirebaseReferences(document));
    documents.push(document);
  })

  await Promise.all(promises);
  return documents;
}

async function add ({ collectionName, document }) {
  const documentRef = admin.firestore().collection(collectionName).doc();
  const documentToAdd = document;
  documentToAdd.id = documentRef.id;
  addOrUpdateOrRemoveFirebaseReferences(documentToAdd, documentToAdd.id, collectionName);
  documentToAdd = arrayUnionOrRemoveFirebaseReferences(documentToAdd);
  await documentRef.set(documentToAdd);
  const documentAdded = await get({ collectionName, where: { field: 'id', value: { stringValue: documentToAdd.id } } });
  return documentAdded[0]
}

async function update ({ collectionName, document }) {
  const documentRef = admin.firestore().collection(collectionName).doc(document.id);
  let documentToUpdate = document;
  addOrUpdateOrRemoveFirebaseReferences(documentToUpdate, documentToUpdate.id, collectionName);
  arrayUnionOrRemoveFirebaseReferences(documentToUpdate);
  await documentRef.update(documentToUpdate);
  const documentAdded = await get({ collectionName, where: { field: 'id', value: { stringValue: documentToUpdate.id } } });
  return documentAdded[0]
}

module.exports = {
  get,
  add,
  update,
};
