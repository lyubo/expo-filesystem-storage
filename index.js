/**
* Storage engine for Expo FileSystem API
* Copyright 2019  Lyubomir Ivanov
*/

import * as FileSystem from 'expo-file-system'

let defaultOptions = {
  storagePath: `${FileSystem.documentDirectory}persistStore`,
  encoding: FileSystem.EncodingType.UTF8,
  debug: false
}

class ExpoFileSystemStorage extends Object {

  constructor(customOptions) {
    super()
    this.options = {...defaultOptions,...customOptions}
    this.ready = this._initialize()
  }

  _printDebugMsg(msg) {
    if (process.env.NODE_ENV !== 'production') console.log('ExpoFileSystemStorage: ' + msg)
  }

  _initialize = () => {
    return FileSystem.getInfoAsync(this.options.storagePath).then((info) => {
      if (!info.exists) {
        if (this.options.debug) this._printDebugMsg('Creating new root directory...')
        return FileSystem.makeDirectoryAsync(this.options.storagePath,{intermediates:true})
      }
      else {
        if (this.options.debug) this._printDebugMsg('Using existing root directory')
        return Promise.resolve()
      }
    })
  }

  _pathForKey = (key: string) => `${this.options.storagePath}/${encodeURIComponent(key)}`


  getItem(key, callback) {
    const {encoding} = this.options
    return this.ready.then(() => {
      if (this.options.debug) this._printDebugMsg(`getItem: ${key}`)
      return FileSystem.readAsStringAsync(this._pathForKey(key),{encoding})
        .then(result => {callback && callback(null,result); return result})
        .catch(error => {callback && callback(error); return null})
    })
  }

  setItem(key, value, callback) {
    const {encoding} = this.options
    return this.ready.then(() => {
      if (this.options.debug) this._printDebugMsg(`setItem: ${key}`)
      return FileSystem.writeAsStringAsync(this._pathForKey(key),value,{encoding})
        .then(() => callback && callback())
        .catch(error => {
          callback && callback(error)
          if (!callback) throw error
        })
    })
  }

  removeItem(key, callback) {
    return this.ready.then(() => {
      if (this.options.debug) this._printDebugMsg(`removeItem: ${key}`)
      return FileSystem.deleteAsync(this._pathForKey(key),{idempotent:true})
        .then(() => !!callback && callback())
        .catch(error => {
          callback && callback(error)
          if (!callback) throw error
        })
    })
  }

  clear(callback) {
    if (this.options.debug) this._printDebugMsg('clear')
    return FileSystem.deleteAsync(this.options.storagePath,{idempotent:true})
      .then(() => FileSystem.makeDirectoryAsync(this.options.storagePath,{intermediates:true}))
      .catch(error => {
        callback && callback(error)
        if (!callback) throw error
      })
  }

  getAllKeys(callback) {
    return this.ready.then(() => {
      if (this.options.debug) this._printDebugMsg('getAllKeys')
      return FileSystem.readDirectoryAsync(this.options.storagePath)
        .then(contents => {
          const result = contents.map(c => decodeURIComponent(c))
          !!callback && callback(null,result)
          return result
        })
        .catch(error => {
          callback && callback(error)
          if (!callback) throw error
        })
    })
  }

}

export default function createExpoFileSystemStorage(options) {
  return  new ExpoFileSystemStorage(options)
}
