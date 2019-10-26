const fireQL = require('@illuday/fireql');

const resolverFunctions = {
  Query: {
    getArtists: (parent, { where }) => fireQL.get({ collectionName: 'artists', where }),
    getArtworks: (parent, { where }) => fireQL.get({ collectionName: 'artworks', where }),
  },
  Mutation: {
    addArtist: (parent, document) => fireQL.add({ collectionName: 'artists', document }),
    addArtwork: (parent, object) => fireQL.add('artworks', object),

    updateArtist: (parent, document) => fireQL.update({ collectionName: 'artists', document }),
    updateArtwork: (parent, object) => fireQL.update('artworks', object) 
  }
};

module.exports = resolverFunctions;