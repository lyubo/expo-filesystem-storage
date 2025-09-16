/**
* Storage engine for Expo FileSystem API
* Copyright 2019-2025 Lyubomir Ivanov
*/

import { Directory, File, Paths } from 'expo-file-system'

let defaultOptions = {
  rootDir: Paths.document,
  debug: true
}

class ExpoFileSystemStorage extends Object {

  textEcoder = new TextEncoder();
  textDecoder = new TextDecoder("utf-8")

  constructor(customOptions) {
    super()
    this.options = { ...defaultOptions, ...customOptions }
    this.storageDir = new Directory(this.options.rootDir, 'persistStore')
    this._initialize()
  }

  _printDebugMsg(msg) {
    if (process.env.NODE_ENV !== 'production') console.log('expo-filesystem-storage/' + msg)
  }

  _initialize = () => {
    const info = this.storageDir.info()
    if (info.exists) {
      if (this.options.debug) this._printDebugMsg('Using existing root directory')
    } else {
      if (this.options.debug) this._printDebugMsg('Creating new root directory...')
      this.storageDir.create({ intermediates: true })
    }
  }

  _fileForKey = (key) => new File(this.storageDir, key)


  getItem(key, callback) {
    if (this.options.debug) this._printDebugMsg(`getItem: ${key}`)
    const file = this._fileForKey(key)
    return file.bytes().then(bytes => {
      const result = this.textDecoder.decode(bytes)
      callback && callback(null, result)
      return result
    }).catch(error => {
      callback && callback(error)
      return Promise.reject(error)
    })
  }


  setItem(key, value, callback) {
    if (this.options.debug) this._printDebugMsg(`setItem: ${key}`)
    try {
      const file = this._fileForKey(key)
      file.write(this.textEcoder.encode(value))
      callback && callback()
      return Promise.resolve()
    }
    catch (error) {
      callback && callback(error)
      return Promise.reject(error)
    }
  }

  removeItem(key, callback) {
    if (this.options.debug) this._printDebugMsg(`removeItem(${key})`)
    try {
      const file = this._fileForKey(key)
      file.delete()
      callback && callback()
      return Promise.resolve()
    } catch (error) {
      callback && callback(error)
      return Promise.reject(error)
    }
  }

  clear(callback) {
    if (this.options.debug) this._printDebugMsg('clear')
    try {
      this.storageDir.delete()
      this.storageDir.create()
    }
    catch (error) {
      callback && callback(error)
      if (!callback) throw error
    }
  }

  getAllKeys(callback) {
    try {
      if (this.options.debug) this._printDebugMsg('getAllKeys')
      const result = this.storageDir.list()
      !!callback && callback(null, result)
      return result
    }
    catch (error) {
      callback && callback(error)
      if (!callback) throw error
    }
  }

}

export default function createExpoFileSystemStorage(options) {
  return new ExpoFileSystemStorage(options)
}
