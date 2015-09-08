package main

import (
	"log"
	"os/exec"
	"strings"
)

func uploadJAR(data map[string]interface{}) ([]byte, error) {
	out, err := exec.Command("bash", "-c", "ipfs add "+data["name"].(string)).CombinedOutput()
	if err != nil {
		return nil, err
	}

	name := strings.Split(string(out), " ")[1]

	return []byte(name), nil
}

func startIPFS() {
	//start ipfs and report any errors...which there shouldn't be
	log.Println("starting ipfs...")
	exec.Command("bash", "-c", "ipfs daemon &").Start()
}

func stopIPFS() {
	exec.Command("bash", "-c", "kil $(ps -ef | grep '[i]pfs' | awk '{print $2}')").Run()
}
