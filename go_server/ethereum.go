package main

import (
	"encoding/json"
	"github.com/ActiveState/tail"
	"os"
	"regexp"
	"sync"
	"time"
)

func readFileIfModified(lastMod time.Time, filename string) ([]byte, time.Time, error) {
	file, err := os.Stat(filename)
	if err != nil {
		return nil, lastMod, err
	}
	if !file.ModTime().After(lastMod) {
		return nil, lastMod, nil
	}

	// make a buffer to keep chunks that are read
	var data []byte
	t, err := tail.TailFile(filename, tail.Config{Follow: false})
	for line := range t.Lines {
		data = append(data, line.Text...)
	}

	return data, file.ModTime(), nil
}

func completeOperations(operations int) {
	var response = map[string]interface{}{}
	response["flag"] = "processPayment"
	response["operations"] = operations
	response["address"] = config.Flare.Address

	var res, _ = json.Marshal(response)
	masterWS.writeBytes(res)
}

func payPerComputation() {
	//seed := "print angle evolve stick wild blue hidden danger nest bar retire north"

	lastMod := time.Date(1, time.January, 1, 1, 1, 1, 1, time.Local)
	operations := 0

	//SparkContext is a signal that some computation has been done
	r, _ := regexp.Compile("SparkContext")
	for {
		//It's expensive to read the whole file so this is a naive method of reducing reads
		data, _lastMod, _ := readFileIfModified(lastMod, sparkLogName)
		if _lastMod.After(lastMod) {
			lastMod = _lastMod
			matches := r.FindAll(data, -1)
			_operations := len(matches)
			if _operations > operations {
				//if a node has done more operations they deserve more either
				completeOperations((_operations - operations))
				operations = _operations
			}
		}
	}
}

func initEthereum(waitGroup *sync.WaitGroup) {
	waitGroup.Add(1)
	go payPerComputation()
}
