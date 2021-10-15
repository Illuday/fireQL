

<p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/logo.gif"/></p>
<p align="center"><img align="center" width="300"src="/Illuday/fireQL/raw/master/.github/typo.svg"/></p>
<br><br>

# <p align="center">Warning</p>

> 🛑🛑 This repository is no longer maintained due to my lack of interest today for this technology. I'm now working on the Napi technology - https://getnapi.com. I added all the sources of the NPM library by the way. Feel free to do whatever you want with it. See you soon! 🛑🛑


<br/><p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p><br/>


> FireQL is a GraphQL connector for Firestore (Firebase database). This repository offer a boilerplate to auto-host a GraphQL server on your Firebase Project (hosting part) connecting to Firestore on the same project.

> **At the moment, use this repository at your own risk, I can't assure the continuity of this project. It's more an experiment for my personnals works than a real technology for en every day use. I'll make it more usable depending of its popularity.**

# <p align="center">Summary</p>

- **[#](#1) Getting started** – *Create project, environment, clone repository, initialize, run playground*
- **[#](#2) Create a first type**
- **[#](#3) Add documents** – *Adding a mutation to our schema, to our resolvers, execute it*
- **[#](#4) Get documents** – *Adding a query to our schema, to our resolvers, execute it*
- **[#](#5) Update documents** – *Adding a mutation to our schema, to our resolvers, execute it*
- **[#](#6) Remove documents** – *Adding a mutation to our schema, to our resolvers, execute it* - (in development)
- **[#](#7) Working with relations** – *Updating our type, adding inputs, execute fun queries & mutations*
- **[#](#8) Query your API from your application**
- **[#](#9) What's next?**

<br/><p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>


## <a name="1"></a>Getting started

### Create your Firebase project & your Firestore database
***Note:** Free projects (spark) works with FireQL!*

No specifical needs here. Just be sure to create a **Firestore database** and not a realtime one.

### Prepare your environment

Execute these commands in order to install firebase CLI and to login with your Firebase account (Obviously, you need one). Just follow steps.

```sh
$ npm install -g firebase-tools
$ firebase login
```

### Clone this repository

Git clone it or just download zip.
```sh
$ git clone https://github.com/Illuday/fireQL.git
```

### Init Firebase project

Initialise the firebase project : 

```sh
$ firebase init
# Select "Functions" & "Hosting"
# Choose your previously created project
# Use Javascript
# Say "no" to ESlint (You'll be able to install it later.)
# Don't override index.js & packages.json
# Say Yes to dependencies
# Use public directory
# Don't create SPA
# Done!
```
### Open GraphQL playground with function emulating

Setup your Google credentials : https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional

```sh
 firebase emulators:start
```

***Note:** On some systems, emulators doesn't seams to work using this last command. You can downgrade firebase-tools to **6.8.0**, then run :*



```sh
 firebase serve
```

Access your playground on:
>http://localhost:5001/YOU_PROJECT_ID/us-central1/api (Given in the console)

Playground is running! **You have to copy/paste your api link (url above) in the upper field inside the playground in order to make it work**.

### Open GraphQL playground on Firebase Hosting

```sh
 firebase deploy
```

Then go to Firebase console, section "Functions", you should find your url: 

> https://us-central1-YOU_PROJECT_ID.cloudfunctions.net/api

Playground is running! **You have to copy/paste your api link (url above) in the upper field inside the playground in order to make it work**.

### Deploy for production

Todo.

<br/><p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>

## <a name="2"></a>Create a first type

***For non GQL user:** A **type** is a collection / table in your firestore database.*

To create a type, just add it in the schema. You can add as much type you need. **We'll come back on relations later**.

```javascript
type Artist {
    id: ID
    name: String!
    age: Int!
}
```
###### <p align="center">functions/graphql/types/artistType.graphql</p><br>

<p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>

## <a name="3"></a>Add document to our type

***For non GQL user:** Compare to a restAPI, a resolver is a GraphQL "route", a mutation will represent a put/patch route with parameters.*

### 1 - Adding the mutation to our schema

```javascript
type Mutation {
    addArtist(name: String!, age: Int!): Artist
}
```
###### <p align="center">functions/graphql/types/artistType.graphql</p>

### 2 - Adding the mutation to our resolvers

FireQL is my magical library to connect our graphQL server to our firestore. FireQL.add() will automatically add the new artist to our firestore collection "artists".

```javascript
const resolverFunctions = {
  Query: {},
  Mutation: {
    addArtist: (parent, document) => fireQL.add({ collectionName: 'artists', document }),
  },
};
```
###### <p align="center">functions/graphql/resolvers.js</p>

### 3 - Executing mutation

Go to your GQL playground and execute your mutation. There, we want to add an artist named "illuday", and get his id and his name (probably illuday...).

***For non GQL user:** GraphQL allows you to get only fields you want as result of any queries or mutations.*

#### <p align="center">ADDING AN ARTIST</p>

```javascript
mutation {
  addArtist (name: "illuday", age: "28") {
    id
    name
  }
}
```
###### <p align="center">Mutation - Playground</p>

<p align="center">:arrow_down:</p><br>

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

###### <p align="center">Mutation result - Playground</p>

In firestore, you can see that you have your document, added to artists collection with "illuday" as name and 28 as age.

***Note:** We havn't age in result because we didn't ask for it.*

Magic.

#### We'll come back later on adding, with more powerful add!

<br/><p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>

## <a name="4"></a>Get documents

### 1 - Adding the query to our schema</span>

```javascript
type Query {
    getArtists(where: WhereInput): [Artist]
}
```
###### <p align="center">functions/graphql/types/artistType.graphql</p>

**The result value of this query is [Artist], it'll return an Array of Artist type.**

**WhereInput** is an **helper** that provide the **structure for querying firestore**. The object needed here is:

```javascript
{
  field: 'nameOfYourField'
  operator: 'enum: EQ (==), GT (>), GTE (>=), LE (<), LTE (<=), INARRAY'
  value: { // One of
    intValue: intValue
    stringValue: stringValue
  }
}
```

***Note:** This helper is already provide in your schema from this repository.*

### 2 - Adding the query to our resolvers

FireQL.get() will automatically get artists from our firestore collection "artists".

```javascript
const resolverFunctions = {
  Query: {
    getArtists: (parent, { where }) => FireQL.get({ collectionName: 'artists', where }),
  },
  Mutation: {
    ...
  },
};
```

###### <p align="center">functions/graphql/resolvers.js</p>

### 3 - Executing query

Before executing this query, I seed my database to have more artists.

- illuday: 28y/o
- Anna Dittmann: 26y/o
- Ilya Kuvshinov: 29y/o
- Shayline: 27y/o

Let's make some tries in our GraphQL playground.

_**Note:** I named my queries (in playground) to be able to save them all._

#### <p align="center">GET ALL ARTISTS</p>

```javascript
query getAllArtists { # <-- This is just a name for GQL playground
  getArtists {
    id
    name
    age
  }
}
```
<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "getArtists": [
      {
        "id": "GF0ihzKePxeKZMRTjY7A",
        "name": "illuday",
        "age": 28
      },
      {
        "id": "NVLWsTYEq6GgqvoCvU6W",
        "name": "Shayline",
        "age": 27
      },
      {
        "id": "TgI9PYG4p7OKzrOBmzmD",
        "name": "Anna Dittmann",
        "age": 26
      },
      {
        "id": "mPXsd1tkYRfSxN0UW1aQ",
        "name": "Ilya Kuvshinov",
        "age": 29
      }
    ]
  }
}
```

<hr>

#### <p align="center">GET ARTIST BY ID</p>

```javascript
query getArtistById { # <-- This is just a name for GQL playground
  getArtists (where: { field: "id", value: { stringValue: "TgI9PYG4p7OKzrOBmzmD" } }){
    id
    name
    age
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "getArtists": [
      {
        "id": "TgI9PYG4p7OKzrOBmzmD",
        "name": "Anna Dittmann",
        "age": 26
      }
    ]
  }
}
```

<hr>

#### <p align="center">GET ARTISTS BY AGE</p>

```javascript
query getArtistsByAge { # <-- This is just a name for GQL playground
  getArtists (where: { field: "age", operator: LT, value: { intValue: 28 } }){
    name
    age
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "getArtists": [
      {
        "name": "Anna Dittmann",
        "age": 26
      },
      {
        "name": "Shayline",
        "age": 27
      }
    ]
  }
}
```

<br/><p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>

## <a name="5"></a>Update document

### 1 - Adding the mutation to our schema</span>

```javascript
type Mutation {
    ...,
    updateArtist(id: ID!, name: String, age: Int): Artist
}
```

###### <p align="center">functions/graphql/types/artistType.graphql</p>

### 2 - Adding the mutation to our resolvers

FireQL.update() will automatically update the artist in our firestore collection "artists".

```javascript
const resolverFunctions = {
  Query: {
	...
  },
  Mutation: {
    ...,
    updateArtist: (parent, document) => FireQL.update({ collectionName: 'artists', document }),
  },
};
```

###### <p align="center">functions/graphql/resolvers.js</p>

### 3 - Executing mutation

Let's say we want to modify "illuday" age.

#### <p align="center">UPDATE ILLUDAY AGE</p>

```javascript
mutation updateIlludayAge { # <-- This is just a name for GQL playground
  updateArtist(id: "GF0ihzKePxeKZMRTjY7A", age: 38) {
    id
    name
    age
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "updateArtist": {
      "id": "GF0ihzKePxeKZMRTjY7A",
      "name": "illuday",
      "age": 38
    }
  }
}
```

#### <p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>

## <a name="6"></a>Removing document - (in development)

### 1 - Adding the mutation to our schema</span>

```javascript
type Mutation {
    ...,
    removeArtist(id: ID!): Artist
}
```

###### <p align="center">functions/graphql/types/artistType.graphql</p>

### 2 - Adding the mutation to our resolvers

FireQL.remove() will automatically remove the artist in our firestore collection "artists".

```javascript
const resolverFunctions = {
  Query: {
	...
  },
  Mutation: {
    ...,
    removeArtist: (parent, document) => FireQL.remove({ collectionName: 'artists', document }),
  },
};
```

###### <p align="center">functions/graphql/resolvers.js</p>

### 3 - Executing mutation

#### <p align="center">REMOVE ILLUDAY</p>

```javascript
mutation removeIlluday { # <-- This is just a name for GQL playground
  removeArtist(id: "GF0ihzKePxeKZMRTjY7A") {
    id
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "removeArtist": {
      "id": "GF0ihzKePxeKZMRTjY7A"
    }
  }
}
```


#### <p align="center"><img align="center" src="/Illuday/fireQL/raw/master/.github/badge.png"/></p>

## <a name="7"></a>Working with relations

***Note:** in FireQL, all relations must be bi-directionnal.*

### 1 - Adding a new type and create a relation

Artists have **MANY** artworks, artworks have **ONE** artist.

```javascript
type Artwork {
    id: ID
    name: String
    artist: Artist
}

type Artist {
    id: ID
    name: String!
    age: Int!
    artworks: [Artwork]
}
```

###### <p align="center">functions/graphql/types/artistType.graphql & types/artworkType.graphql</p>

**Follow steps above to create basics queries & mutations for the new type**

### 2 - Modifying Artwork mutation to handle relation management

We need to create our **inputs** before modifying our addArtist & updateArtist mutations. They'll allows those things:

- Add **artworks** when we add an **artist**
- Update / Remove **artworks** when we update **artist**

```javascript
input ArtworkInput {
    name: String
}

input AddArtworkInput {
    collection: String = "artworks"
    on: String = "artist"

    connect: ID
    create: ArtworkInput
}

input UpdateArtworkInput {
    collection: String = "artworks"
    on: String = "artist"

    connect: ID
    remove: ID
    create: ArtworkInput
}
```

###### <p align="center">functions/graphql/types/artworkType.graphql</p>

Back to these inputs:

- **ArtworkInput**: Represent fields we can fill when we create an artwork

- **AddArtworkInput**:

  | Argument   | Value               | Description                                                  |
  | ---------- | ------------------- | ------------------------------------------------------------ |
  | collection | String = "artworks" | Name of the collection linked, set **artworks by default**. You'll never have to change that. |
  | on         | String = "artist"   | Foreign field for our relation, set **artwork by default**. You'll never have to change that. ***Note**: In case of a One to Many or Many to Many relations you'll have to write [String] = ['artists'].* |
  | connect*   | ID                  | The id of artwork you want to connect with.                  |
  | create*    | ArtworkInput        | The input of artwork you want to create then link.           |

  *one of these must be fill when you execute the mutation

- **UpdateArtworkInput**:

  | Argument   | Value               | Description                                                  |
  | ---------- | ------------------- | ------------------------------------------------------------ |
  | collection | String = "artworks" | Name of the collection linked, set **artworks by default**. You'll never have to change that. |
  | on         | String = "artist"   | Foreign field for our relation, set **artwork by default**. You'll never have to change that. ***Note**: In case of a One to Many or Many to Many relations you'll have to write [String] = ['artists'].* |
  | connect*   | ID                  | The id of an artwork you want to connect with.               |
  | remove*    | ID                  | The id of an artwork you want to remove. ***Note**: In case of a Many to One or One to one relations, the artwork will be removed from the database* |
  | create*    | ArtworkInput        | The input of artwork you want to create then link.           |

  *one of these must be fill when you execute the mutation

Now that we have inputs, we can adjust our mutations "addArtist" and "updateArtist".

```javascript
 type Mutation {
    addArtist(name: String!, age: Int!, artworks: [AddArtworkInput]): Artist
    updateArtist(id: ID!, name: String, age: Int, artworks: [UpdateArtworkInput]): Artist
    ...
 }
```

###### <p align="center">functions/graphql/types/artistType.graphql</p>

That's it! Let's play with it.

### 3 - Executing mutations

#### <p align="center">ADD AN ARTIST AND CREATE ARTWORKS AT THE SAME TIME</p>

```javascript
mutation addAnArtistWithArtworks {
  addArtist(
    name: "illuday", 
    age: 28, 
    artworks: [
      { create: { name: "MIRAMARKA" } }, # NEW ARTWORK
      { create: { name: "BLACKLIST" } }, # NEW ARTWORK
      { connect: "WDwGd4LwjZGfsFEALOi7" } # EXISTING ARTWORK
    ]
  ) {
    id
    name
    artworks { id name } # WAIT WHAT ?
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "addArtist": {
      "id": "xyseptoQ7WBBRr8XAl4U",
      "name": "illuday",
      "artworks": [
        {
          "id": "NmgdsLrNgzIiIUaRFkef",
          "name": "MIRAMARKA"
        },
        {
          "id": "W7rgj1Lkc4HAruuMMmX2",
          "name": "BLACKLIST"
        },
        {
          "id": "WDwGd4LwjZGfsFEALOi7",
          "name": "NYNDOR"
        }
      ]
    }
  }
}
```

**So, what happens there ?** We inserted an new artist in our database, named illuday, we decided to create at the same time two new artworks and connect an already existing one. References between the artist and artworks are automatically set by FireQL.

**And the result ?** You can see that as we added relations in our **artist** types, we can query directly its **artworks** on results (queries, mutations). Yeah!

#### <p align="center">UPDATE AN ARTIST AND REMOVE ONE ARTWORK</p>

***Note:** Due to a Firebase limitation (arrayUnion / arrayRemove), you can't add and remove at the same time.*


```javascript
mutation updateAnArtistWithArtworks {
  updateArtist(
    id: "xyseptoQ7WBBRr8XAl4U", # illuday
    artworks: [
      { remove: "W7rgj1Lkc4HAruuMMmX2" }, # BLACKLIST
    ]
  ) {
    id
    name
    artworks { id name }
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "updateArtist": {
      "id": "xyseptoQ7WBBRr8XAl4U",
      "name": "illuday",
      "artworks": [
        {
          "id": "NmgdsLrNgzIiIUaRFkef",
          "name": "MIRAMARKA"
        },
        {
          "id": "WDwGd4LwjZGfsFEALOi7",
          "name": "NYNDOR"
        }
      ]
    }
  }
}
```

#### <p align="center">QUERYING OUR FINAL ARTIST</p>

```javascript
query getIlluday {
  getArtists(where: {field: "id", value: {stringValue: "xyseptoQ7WBBRr8XAl4U"}}) {
    id
    name
    age
    artworks {
      id
      name
    }
  }
}
```

<p align="center">:arrow_down:</p><br>

```javascript
{
  "data": {
    "getArtists": [
      {
        "id": "xyseptoQ7WBBRr8XAl4U",
        "name": "illuday",
        "age": 28,
        "artworks": [
            {
          		"id": "NmgdsLrNgzIiIUaRFkef",
          		"name": "MIRAMARKA"
        	},
        	{
         	 	"id": "WDwGd4LwjZGfsFEALOi7",
          		"name": "NYNDOR"
        	},
        	{
          		"id": "nTTtND8HyktG30IQzO5M",
          		"name": "ACTIVITOUR"
        	}
        ]
      }
    ]
  }
}
```

<br/><p align="center"><img align="center" src="https://firebasestorage.googleapis.com/v0/b/illuday.appspot.com/o/badge.png?alt=media&token=47b4fb96-6b8d-44b1-848d-0b1c143203db"/></p>

## <a name="8"></a>Query your API from your application

You just have to use a GQL client (it's like an axios for restAPI), here are some :

- Flutter: https://github.com/zino-app/graphql-flutter
- VueJS: https://github.com/vuejs/vue-apollo
- Nuxt: https://github.com/nuxt-community/apollo-module
- ReactJS: https://github.com/apollographql/react-apollo
- React Native: https://github.com/apollographql/apollo-client

Or for React, Angular, Vue, Ember, Web Components, Meteor, Blaze, Vanilla JS, Next.js and I assume every javascript based framework: https://github.com/apollographql/apollo-client

<br/><p align="center"><img align="center" src="https://firebasestorage.googleapis.com/v0/b/illuday.appspot.com/o/badge.png?alt=media&token=47b4fb96-6b8d-44b1-848d-0b1c143203db"/></p>

## <a name="9"></a>What's next?

- [x] Connection to Firestore
- [x] Hosting on Firebase cloud functions
- [x] Playgrounds local & online
- [x] Get documents
- [x] Get documents with their relations
- [x] Add documents
- [x] Add documents and relation (create, connect)
- [x] Update documents
- [x] Update documents and their relations (create, connect, remove)
- [ ] Remove documents
- [ ] Remove documents and their relations
- [ ] Handle authentication (Anonymous, phone, e-mail, Facebook, Google)
- [ ] Simple security rules for queries & mutations
- [ ] Subscriptions (for realtime data)
- [ ] File upload to Firebase storage

#### You can choose the feature you need the most:

[![](https://api.gh-polls.com/poll/01DR6Y6WSZEMT0SCH1DT0TEM2K/Authentication%20%26%20Security)](https://api.gh-polls.com/poll/01DR6Y6WSZEMT0SCH1DT0TEM2K/Authentication%20%26%20Security/vote)
[![](https://api.gh-polls.com/poll/01DR6Y6WSZEMT0SCH1DT0TEM2K/Subscriptions)](https://api.gh-polls.com/poll/01DR6Y6WSZEMT0SCH1DT0TEM2K/Subscriptions/vote)
[![](https://api.gh-polls.com/poll/01DR6Y6WSZEMT0SCH1DT0TEM2K/File%20upload)](https://api.gh-polls.com/poll/01DR6Y6WSZEMT0SCH1DT0TEM2K/File%20upload/vote)

