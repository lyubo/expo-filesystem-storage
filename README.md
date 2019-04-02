# expo-filesystem-storage
Redux Persist storage engine for Expo FileSystem API. Alternative of default AsyncStorage to get over  storage size limitations in Android.


### Install

```
npm install expo-filesystem-storage
```

### Usage with [redux-persist](https://github.com/rt2zz/redux-persist/) 

```js
import createExpoFileSystemStorage from 'expo-filesystem-storage'

...

const expoFsStorage = createExpoFileSystemStorage();

const persistConfig = {
  key: 'root',
  keyPrefix: ''
  storage: expoFsStorage,
};

const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer);
const persistor = persistStore(store);

...

```

### Customized options
```js

...

const customOptions = {
  storagePath: `${FileSystem.documentDirectory}persistStore`,
  debug: true,
}

const expoFsStorage = createExpoFileSystemStorage(customOptions);

...

```
