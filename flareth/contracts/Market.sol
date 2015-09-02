contract Market {

	struct Node {
		bytes32 ident;
		bytes32 state; //online, master, worker, offline
		bytes32 ipaddress;
		bytes32 dappIdent;
		address coinbase;
	}

	mapping (bytes32 => Node) public nodes;
	bytes32[2**5] public nodeList;
	uint32 public numNodes;

	//Parameters should be fields in the struct, then add it to the nodeList
	function createNode(bytes32 ident, bytes32 state, bytes32 ipaddress) {
		nodes[ident] = Node({ident: ident, state: state, ipaddress: ipaddress, dappIdent:"", coinbase:msg.sender});
		nodeList[numNodes] = ident;
		numNodes += 1;
	}

	//TODO if there is time
	/*
	function removeNode() {
		// Remove node from list?
		// Remember to call penalizeNode if their state says that they are in the middle of an
		// application.
	}

	function penalizeNode(){
		//Penalize node if state of application isn't finished
		//Parameters: Something like address/hash, and then the amount penalized?
	}

	function setState(bytes32 name, bytes32 state) {
		nodes[name].state = state;
	}
	//we probably don't need that
	function setIPAddress(bytes32 name, bytes32 ipaddress) {
		nodes[name].ipaddress = ipaddress;
		}*/

		struct DApp {
			bytes32 ident;
			bytes32 master;
			uint32 fee;
			address coinbase;
			bytes32 state;
		}

		//Vars
		mapping (bytes32 => DApp) public dapps;
		bytes32[2**5] public dappList;
		uint32 public numDApps;
		mapping(bytes32 => bytes32[]) public workers;

		//	Parameter should be the driver nodes, amount of ethereum in escrow, escrow address
		//	(in the future, add the size of ddapp, memory needed, etc) to determine the
		//	most efficient processing.
		function createDApp(bytes32 ident, uint32 fee) {
			if(numNodes == 0)
			return;

			Node masterNode;
			bool masterFound;
			for(uint i =0; i < numNodes; i++) {
				masterNode = nodes[nodeList[i]];
				if (masterNode.state == "online") {
					masterNode.state = "master";
					masterNode.dappIdent = ident;
					masterFound = true;
					break;
				}
			}

			if(!masterFound)
			return;

			bytes32[] workerNodes;
			workerNodes.length = 5;
			uint32 numWorkerNodes;
			for(i =0; i < numNodes && i < 5; i++) { //TODO: Get a better way of limiting nodes
				Node worker = nodes[nodeList[i]];
				if (worker.state == "online") {
					worker.state = "worker";
					worker.dappIdent = ident;
					workerNodes[numWorkerNodes] = worker.ident;
					numWorkerNodes += 1;
				}
			}

			workers[ident].length = 2**5;
			workers[ident] = workerNodes;
			dapps[ident]= DApp({master:masterNode.ident, ident:ident, fee:fee, coinbase:msg.sender, state:"off"});
			dappList[numDApps] = ident;
			numDApps += 1;

			//DDAP is not started a this point
		}

		function startDApp(bytes32 ident) {
			if(dapps[ident].coinbase == msg.sender)
			dapps[ident].state = "start";
		}

		function payNode(bytes32 dappIdent, bytes32 nodeIdent){
			if(dapps[dappIdent].coinbase == msg.sender)
			nodes[nodeIdent].coinbase.send(dapps[dappIdent].fee);
		}

		event Deposit(bytes32 a);
		//TODO: write test case
		function finishDApp(bytes32 ident) {
			nodes[dapps[ident].master].state = "online";
				Deposit(nodes[dapps[ident].master].state);
			delete nodes[dapps[ident].master].dappIdent;

			for(var i =0; i < workers[ident].length; i++) {
				nodes[workers[ident][i]].state = "online";
				nodes[workers[ident][i]].dappIdent = "";
			}

			delete dapps[ident];
		}
	}
