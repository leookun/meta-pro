package route

import (
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	C "github.com/metacubex/mihomo/constant"
)

func readConfig(path string) ([]byte, error) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	if len(data) == 0 {
		return nil, fmt.Errorf("configuration file %s is empty", path)
	}

	return data, err
}

func getConfigFile(w http.ResponseWriter, r *http.Request) {

	config, err := readConfig(C.GetConfig())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(config)
}
func updateConfigFile(w http.ResponseWriter, r *http.Request) {
	config, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	err = os.WriteFile(C.GetConfig(), config, 0644)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	getConfigFile(w, r)
}

func configFileRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", getConfigFile)
	if !embedMode { // disallow update/patch configs in embed mode
		r.Put("/", updateConfigFile)
	}
	return r
}
