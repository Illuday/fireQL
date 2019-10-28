const fireQL = require('@illuday/fireql');

const resolverFunctions = {
  Query: {
    getArtists: (parent, { where }) => fireQL.get({ collectionName: 'artists', where }),
    getArtworks: (parent, { where }) => fireQL.get({ collectionName: 'artworks', where }),
  },
  Mutation: {
    addArtist: (parent, document) => fireQL.add({ collectionName: 'artists', document }),
    addArtwork: (parent, document) => fireQL.add({ collectionName: 'artworks', document }),

    updateArtist: (parent, document) => fireQL.update({ collectionName: 'artists', document }),
    updateArtwork: (parent, document) => fireQL.update({ collectionName: 'artworks', document }) 
  }
};

module.exports = resolverFunctions;
