String.prototype.escapeSpecialChars = function () {
  return this.replace(/\\n/g, '\\\\n')
  .replace(/\\'/g, '\\\'')
  .replace(/\\'/g, '\\\'')
  .replace(/\\&/g, '\\\&')
  .replace(/\\r/g, '\\\r')
  .replace(/\\t/g, '\\\\t')
  .replace(/\\b/g, '\\\b')
  .replace(/\\f/g, '\\\f');
};

// used for the submission of jars for spark
// TODO: recreate the upload feature
// UploadServer.init({
//   tmpDir: filesDirectory+'jar/tmp',
//   uploadDir: filesDirectory+'jar/',
//   checkCreateDirectories: true
// })