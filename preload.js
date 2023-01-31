// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })

// require('@rongcloud/electron-renderer');
// window.test = { 
//     a:'a',
//     b:'b'
// }
// require('./renderer')
// const { contextBridge, webContents } = require('electron')
// console.log('webContents ===',webContents)
// console.log('BrowserWindow.getFocusedWindow() ===',BrowserWindow)
// // // contextBridge.exposeInMainWorld('test1', test);
// class test {
//     constructor (data){
//         this.name = data
//     };
//     fn(){
//         return this.name
//     }
// }
// const fntest = () => {
//     f1 = () => {
//         return 'f1'
//     };
//     f2 = () => {
//         return 'f2'
//     };
//     return {
//         f1,
//         f2
//     }
    
// }
// contextBridge.exposeInMainWorld('test', {fntest});
const { ipcRenderer } = require('electron')
window.ipcRenderer = ipcRenderer