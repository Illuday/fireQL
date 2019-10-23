
<p align="center"><img align="center" style="width:320px" src="https://firebasestorage.googleapis.com/v0/b/illuday.appspot.com/o/logo.png?alt=media&token=daa6fc42-7572-4a6a-beb9-a1b1dff6cea5"/></p>

> FireQL is a GraphQL connector for Firestore (Firebase database). This repository offer a boilerplate to auto-host a GraphQL server on your Firebase Project (hosting part) connecting to Firestore on the same project.


# <p align="center">Summary</p>

- **[#](#1) Getting started** – *download project, install dependencies, run emulators*
- **[#](#2) Create a first type**
- **[#](#3) Add documents** – *Adding mutation to our schema, to our resolvers, execute mutation*
- **[#](#4) Get documents** – *Adding query to our schema, to our resolvers, execute query*

<br/><p align="center"><img align="center" src="https://firebasestorage.googleapis.com/v0/b/illuday.appspot.com/o/badge.png?alt=media&token=47b4fb96-6b8d-44b1-848d-0b1c143203db"/></p>


## <a name="2"></a>Create a first type

***For non GQL user:** A **type** is a collection / table in your firestore database.*

To create a type, just add it in the schema. You can add as much type you need. **We'll come back on relations later**.

```javascript
const schema = gql`
  type Artist {
    id: ID
    name: String!
  }
`
``` 
<center>functions/graphql/schema.js</center><br>

<p align="center"><img align="center" src="https://firebasestorage.googleapis.com/v0/b/illuday.appspot.com/o/badge.png?alt=media&token=47b4fb96-6b8d-44b1-848d-0b1c143203db"/></p>

## <a name="3"></a>Add document to our type

***For non GQL user:** Compare to a restAPI, a resolver is a GraphQL "route", a mutation will represent a put/patch route with parameters.*

### <span style="color:#888">1 - Adding the mutation to our schema</span>

```javascript
const schema = gql`
  type Mutation {
    addArtist(name: String): Artist
  }
`
```
<center><span style="color:#CCC">functions/graphql/schema.js</span></center>

### <span style="color:#888">2 - Adding the mutation to our resolvers</span>

FireQL is my magical library to connect our graphQL server to our firestore. FireQL.add() will automatically add the new artist to our firestore collection "artists".

```javascript
const resolverFunctions = {
  Query: {},
  Mutation: {
    addArtist: (parent, document) => fireQL.add({ collectionName: 'artists', document }),
  },
};
```
<center><span style="color:#CCC">functions/graphql/resolvers.js</span></center>

### <span style="color:#888">3 - Executing mutation</span>

Go to your GQL playground and execute your mutation. There, we want to add an artist named "illuday", and get his id and his name (probably illuday...).

***For non GQL user:** GraphQL allows you to get only fields you want as result of any queries or mutations.*


```java
mutation {
  addArtist (name:"illuday") {
    id
    name
  }
}
```
<center><span style="color:#CCC">localhost:5001/your-fire-hosting/api</span></center>

### <span style="color:#888">Result - That's it...</span>

```json
{
  "data": {
    "addArtist": {
      "id": "BsuNNpRQqFbgWME1RIZ4",
      "name": "illuday"
    }
  }
}
```
<center><span style="color:#CCC">Mutation result - localhost:5001/your-fire-hosting/api</span></center>

In firestore, you can see that you have your document, added to artists collection with "illuday" as name.

Magic.

#### We'll come back later on adding, with more powerful add!
