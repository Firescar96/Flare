package main

import (
	"log"
	"os/exec"
	"strings"
)

type ipfsInstance struct {
}

type ipfsInterface interface {
	add(data map[string]interface{}) ([]byte, error)
}

var ipfs = ipfsInstance{}

func (ii *ipfsInstance) add(data map[string]interface{}) ([]byte, error) {
	out, err := exec.Command("bash", "-c", "ipfs add \""+data["name"].(string)+"\"").Output()
	if err != nil {
		return nil, err
	}

	hash := strings.Split(string(out), " ")[1]

	return []byte(hash), nil
}

func (ii *ipfsInstance) get(name []byte) {
	exec.Command("bash", "-c", "ipfs get \""+string(name)+"\" -o "+config.Flare.FilesDirectory+"/currentDApp").Run()
}

func startIPFS() {
	//start ipfs and report any errors...which there shouldn't be
	log.Println("starting ipfs...")
	exec.Command("bash", "-c", "ipfs daemon &").Start()
}

func stopIPFS() {
	exec.Command("bash", "-c", "kil $(ps -ef | grep '[i]pfs' | awk '{print $2}')").Run()
}
