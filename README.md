# Spots Sessions

Spots Sessions will help you manage your users' sessions by letting you easily create, fetch, refresh, update and kill sessions. It even lets you kill all sessions owned by a user at once.

It is built on top of [ioredis](https://www.npmjs.com/package/ioredis) for lightning speed operations.

I've built this package for the sake of simplicity, but I also exposed the Redis client through the package so you can also use all advanced features that redis offers without having the need to install both this package and a redis client.

## Disclaimer
This is not a production ready package (although it is pretty straight-forward).

## Installation

`yarn add @spots-tech/sessions`

or

`npm install @spots-tech/sessions`

## Features

* `create`: Creates a session by providing an app name, a userId and custom data to be stored with the session. Returns a token.
* `get`: Gets the owner and custom data of a specific token + app name combo. Returns undefined if the session is not found.
* `refresh`: Refreshes the duration of a specific session. Returns true if the session was refreshed or false if it was not found.
* `update`: Updates the custom data of an existing session. Returns true if the session was updated or false if it was not found.
* `kill`: Kills an existing session. Returns true if the session was killed or false if it was not found.
* `killAll`: Kills all sessions of the same user. Returns true if all sessions were killed or false if no sessions were found.

## Going Further
* `client`: An ioredis client is exposed within SpotsSessions class so you can use all advanced features of redis you wish.

## Usage

### Instantiate the client

```typescript
// Pass an optional connection string to the constructor
// new SpotsSessions('redis://localhost:6379')
const spotsSessions = new SpotsSessions({
  connectionString: 'redis://localhost:6379',
  tokenEncoding: 'base64',
  tokenSize: 128,
});
```

### Create a session

```typescript
const spotsSessions = new SpotsSessions({});

const token = await spotsSessions.create({
  app: 'my-app',
  ownerId: '123qwe',
  data: { 
    firstName: 'John',
    lastName: 'Doe',
    currentDeviceToken: '123'
  },
  duration: 3600
);
```

### Gets a session

```typescript
const spotsSessions = new SpotsSessions({});

const { ownerId, data } = await spotsSessions.get({
  app: 'my-app',
  token: 'qwerty',
);
```

### Refreshes a session

```typescript
const spotsSessions = new SpotsSessions({});

const success = await spotsSessions.refresh({
  app: 'my-app',
  token: 'qwerty',
  duration: 7200
);
```

### Updates a session

```typescript
const spotsSessions = new SpotsSessions({});

const success = await spotsSessions.update({
  app: 'my-app',
  token: 'qwerty',
  data: {
    name: null, // Use null to delete existing values, undefined values will be ignored
    age: 25
  }
);
```

### Kills a session

```typescript
const spotsSessions = new SpotsSessions({});

const success = await spotsSessions.kill({
  app: 'my-app',
  token: 'qwerty'
);
```

### Kills all sessions of a user

```typescript
const spotsSessions = new SpotsSessions({});

const success = await spotsSessions.killAll({
  app: 'my-app',
  ownerId: '123qwe'
);
```

## Contributing

Feel free to contribute in any way you'd like. You can email me at kaionesyan@gmail.com if you have any questions.