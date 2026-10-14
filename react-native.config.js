// module.exports = {
//   project: {
//     ios: {
//       automaticPodsInstallation: true
//     }
//   }
// }

module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.chanajor.ott'
    },
    ios: {
      automaticPodsInstallation: true
    }
  },
  assets: ['./assets/fonts/']
}