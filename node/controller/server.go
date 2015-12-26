package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

type status struct {
	on bool
}

func startFlare() {
	//startup all the different asynchronous processes ,ORDER IS IMPORTANT
	//startSpark()
	startEthereum()
	startCassandra()
	startIPFS()
	startWebsockets()
	startFrontend()
	log.Println("flare is ready")

	//connects to the local handler for the ethereum network
	go func() {
		var message = map[string]interface{}{}

		message["flag"] = "init"
		message["privateKey"] = config.Flare.PrivateKey
		message["ident"] = config.Flare.PrivateKey
		message["coinbase"] = config.Flare.Coinbase
		message["contract"] = config.Flare.Contract
		var mess, _ = json.Marshal(message)
		masterWSClient.writeBytes(mess)
		for {
			var bytes = masterWSClient.readBytesBlocking()
			log.Println("got master" + string(bytes))
			var data = map[string]interface{}{}
			if err := json.Unmarshal(bytes, &data); err != nil {
				panic(err)
			}

			/*Continue work here*/
			if data["flag"] == "startDapp" {

				spark.start(data["state"].([]byte))

				//TODO: make sure spark has started before continuing
				if data["state"] == "master" {
					ipfs.get(data["ipfsHash"].([]byte))
					var sparkData = map[string]interface{}{}
					sparkData["class"] = data["class"]
					sparkData["name"] = config.Flare.FilesDirectory + "/currentDApp"
				}

				if data["state"] == "worker" {
					//don't need to do anything
				}
			}
		}
	}()

	//publishes some status info to a local connection on changes
	go func() {
		for {
			var response = map[string]interface{}{}
			select {
			case _config := <-publish.configChan.Out():
				response["flag"] = "config"
				response["text"] = string(_config.([]byte))
				var res, _ = json.Marshal(response)
				localWSServer.writeBytes(res)
			case info := <-publish.cassandraNodeInfoChan.Out():
				response["flag"] = "cassandraNodeInfo"
				data, _ := json.Marshal(info)
				response["text"] = string(data)
				var res, _ = json.Marshal(response)
				localWSServer.writeBytes(res)
			case ring := <-publish.cassandraNodeRingChan.Out():
				response["flag"] = "cassandraNodeRing"
				data, _ := json.Marshal(ring)
				response["text"] = string(data)
				var res, _ = json.Marshal(response)
				localWSServer.writeBytes(res)
			}
		}
	}()

	//reads from local connections and sends requested info
	go func() {
		for {
			var bytes = localWSServer.readBytesBlocking()
			log.Println("got local" + string(bytes))
			var data = map[string]interface{}{}
			if err := json.Unmarshal(bytes, &data); err != nil {
				panic(err)
			}

			var response = map[string]interface{}{}
			if data["flag"] == "getLog" {
				response["flag"] = "log"
				response["type"] = data["type"]

				switch data["type"] {
				case "tracing":
					response["success"] = true
					response["text"] = getTracingLog()
				case "session":
					response["success"] = true
					response["text"] = getSessionLog()
				case "spark":
					text, err := getSparkLog()
					if err == nil {
						response["success"] = true
						response["text"] = text
					}
				case "sparkUI":
					text, err := getSparkUILog()
					if err == nil {
						response["success"] = true
						response["text"] = text
					}
				}

				var res, _ = json.Marshal(response)
				localWSServer.writeBytes(res)
			}
			if data["flag"] == "setConfig" {
				saveConfig([]byte(data["text"].(string)))
			}
			if data["flag"] == "getConfig" {
				response["flag"] = "config"
				var _config = getConfigBytes()
				response["text"] = string(_config)
				var res, _ = json.Marshal(response)
				localWSServer.writeBytes(res)
			}
			if data["flag"] == "submit" {
				name, err := ipfs.add(data)

				response["flag"] = "submit"
				response["id"] = data["id"]
				response["name"] = string(name)
				if err == nil {
					response["success"] = true
				} else {
					response["success"] = false
				}
				var res, _ = json.Marshal(response)
				localWSServer.writeBytes(res)
			}
		}
	}()
}

//stopFlare can be called multiple times
func stopFlare() {
	//order is not as important here as in startFlare(), but still important
	stopFrontend()
	stopWebsockets()
	stopIPFS()
	stopCassandra()
	stopEthereum()
	stopSpark()
}

func main() {
	var state = status{
		on: false,
	}

	initConfig()

	var command string
	for {
		fmt.Println("Ready for commands")
		reader := bufio.NewReader(os.Stdin)
		_command, _, _ := reader.ReadLine()
		command = string(_command)

		switch command {
		case "start":
			if !state.on {
				state.on = true
				startFlare()
			} else {
				fmt.Println("Flare has already been started")
			}
		case "stop":
			if state.on {
				state.on = false
				stopFlare()
			} else {
				fmt.Println("Flare is not running")
			}
		case "restart":
			stopFlare()
			initConfig()
			startFlare()
		}
	}
}
