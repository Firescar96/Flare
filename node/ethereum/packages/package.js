Package.describe({
  name: "firescar96:flare-ethereum-handler",
  summary: "A library for use with Flare to handle the connection to the Ethereum Network",
  version: "0.0.1",
  git: "https://github.com/Consensys/Flare",
  documentation: "README.md"
});

Package.onTest(function(api){
  api.use('firescar96:flare-ethereum-handler');
  api.addFiles('tests/main-web3.js', ['server']);
});
