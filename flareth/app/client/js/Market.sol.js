var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("Market error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("Market error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("Market contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of Market: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to Market.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: Market not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "ident",
            "type": "bytes32"
          }
        ],
        "name": "startDApp",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "ident",
            "type": "bytes32"
          }
        ],
        "name": "finishDApp",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "ident",
            "type": "bytes32"
          },
          {
            "name": "state",
            "type": "bytes32"
          },
          {
            "name": "ipaddress",
            "type": "bytes32"
          }
        ],
        "name": "createNode",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "nodeList",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "ident",
            "type": "bytes32"
          },
          {
            "name": "fee",
            "type": "uint32"
          },
          {
            "name": "ipfsHash",
            "type": "bytes"
          },
          {
            "name": "class",
            "type": "bytes32"
          }
        ],
        "name": "createDApp",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "dappList",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "workers",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numNodes",
        "outputs": [
          {
            "name": "",
            "type": "uint32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numDApps",
        "outputs": [
          {
            "name": "",
            "type": "uint32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "dapps",
        "outputs": [
          {
            "name": "ident",
            "type": "bytes32"
          },
          {
            "name": "master",
            "type": "bytes32"
          },
          {
            "name": "fee",
            "type": "uint32"
          },
          {
            "name": "coinbase",
            "type": "address"
          },
          {
            "name": "state",
            "type": "bytes32"
          },
          {
            "name": "ipfsHash",
            "type": "bytes"
          },
          {
            "name": "class",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "nodes",
        "outputs": [
          {
            "name": "ident",
            "type": "bytes32"
          },
          {
            "name": "state",
            "type": "bytes32"
          },
          {
            "name": "ipaddress",
            "type": "bytes32"
          },
          {
            "name": "dappIdent",
            "type": "bytes32"
          },
          {
            "name": "coinbase",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "nodeIdent",
            "type": "bytes32"
          },
          {
            "name": "operations",
            "type": "uint32"
          }
        ],
        "name": "payNode",
        "outputs": [],
        "type": "function"
      }
    ],
    "unlinked_binary": "0x6060604052610a41806100126000396000f3606060405236156100985760e060020a600035046308a9ec7a811461009a578063110568741461010357806312f7e8181461013f578063208f2a311461020357806374609d0c1461021d5780638240a49b1461028d578063834579fb146102a857806394ca304b146102dd57806396fdedbe146102ee578063b6453318146102ff578063d86e697d1461034f578063f15beecf1461038b575b005b61009860043560008181526210000260205260409020600201546401000000009004600160a060020a03908116339190911614156101005760406000207f7374617274000000000000000000000000000000000000000000000000000000600391909101555b50565b61009860043560008181526210000260205260408120600201546401000000009004600160a060020a039081163391909116146105d9576105d5565b6100986004356024356044356040805160a081018252848152602081810185815282840185815260006060850181815233608087019081528a835294829052959020935184559051600184810191909155905160028401559251600383015551600491909101805473ffffffffffffffffffffffffffffffffffffffff19169091179055621000015484919063ffffffff166210000081101561000257016000505562100001805463ffffffff19811663ffffffff91909116600101179055505050565b610435600435600181621000008110156100025750015481565b604080516020604435600481810135601f810184900484028501840190955284845261009894813594602480359593946064949293910191819084018382808284375094965050933593505050506210000154600090819081908190819063ffffffff1681141561073e57610733565b61043560043562100003816104008110156100025750015481565b610435600435602435621004046020526000828152604090208054829081101561000257506000908152602090200154905081565b610447621000015463ffffffff1681565b610447621004035463ffffffff1681565b62100002602052600480356000908152604090206001810154815460028301546003840154600585015461046196939563ffffffff841694640100000000909404600160a060020a031693019087565b61052a600435600060208190529081526040902060018101548154600283015460038401546004949094015491939091600160a060020a031685565b610098600435602435600082815260208190526040902054821480156103cf5750600082815260208190526040902060040154600160a060020a0390811633909116145b156105d557600082815260208181526040808320600481015460039190910154845262100002909252808320600201549051600160a060020a0392909216929163ffffffff91821685029091169082818181858883f1935050505015156105d557610002565b60408051918252519081900360200190f35b6040805163ffffffff929092168252519081900360200190f35b604080518881526020810188905263ffffffff871691810191909152600160a060020a03851660608201526080810184905260c0810182905260e060a082018181528454600260018216156101009081026000190190921604928401839052909190830190859080156105155780601f106104ea57610100808354040283529160200191610515565b820191906000526020600020905b8154815290600101906020018083116104f857829003601f168201915b50509850505050505050505060405180910390f35b604080519586526020860194909452848401929092526060840152600160a060020a03166080830152519081900360a00190f35b6000828152621000026020526040812081815560018181018390556002828101805477ffffffffffffffffffffffffffffffffffffffffffffffff1916905560038301849055600483018054858255939493909281161561010002600019011604601f8190106106b857505b505060006005909101555b5050565b50600081815262100002602090815260408083206001908101805485529284905281842060d060020a656f6e6c696e65029101559054825281206003018190555b600082815262100404602052604090205460ff8216101561055e5760406000908120805460d060020a656f6e6c696e65029291829160ff861690811015610002578183526020808420820154845283815260408420600101959095558683526210040490945280549193839281101561000257906000526020600020900160005054815260208101919091526040016000206003015560010161061a565b601f0160209004906000526020600020908101906105ca91905b808211156106e657600081556001016106d2565b5090565b505060c09091015160059091015562100403548990621000039063ffffffff16610400811015610002570155621004038054600163ffffffff82160163ffffffff199091161790555b505050505050505050565b600092505b621000015463ffffffff168310156107cb576000806001856210000081101561000257015481526020810191909152604001600020600181015490925060d060020a656f6e6c696e650214156107d7577f6d61737465720000000000000000000000000000000000000000000000000000600183810191909155600383018a90558254955093505b8315156107e257610733565b600190920191610743565b600092505b621000015463ffffffff16831080156108005750600583105b156108b2576000806001856210000081101561000257015481526020810191909152604001600020600181015490915060d060020a656f6e6c696e65021415610a05577f776f726b65720000000000000000000000000000000000000000000000000000600182810191909155600382018a905560008a81526210040460205260409020805491820180825590919082818380158290116109f1576000838152602090206109f19181019083016106d2565b60e0604051908101604052808a81526020018681526020018981526020013381526020017f6f666600000000000000000000000000000000000000000000000000000000008152602001888152602001878152602001506210000260005060008b600019168152602001908152602001600020600050600082015181600001600050556020820151816001016000505560408201518160020160006101000a81548163ffffffff0219169083021790555060608201518160020160046101000a815481600160a060020a03021916908302179055506080820151816003016000505560a0820151816004016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610a1157805160ff19168380011785555b506106ea9291506106d2565b505050600092835250602090912082549101555b600192909201916107e7565b828001600101855582156109e5579182015b828111156109e5578251826000505591602001919060010190610a2356",
    "events": {},
    "updated_at": 1488921684912,
    "links": {},
    "address": "0xcfeb869f69431e42cdb54a4f4f105c19c080a601"
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "Market";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.Market = Contract;
  }
})();
