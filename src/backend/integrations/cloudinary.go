package integrations

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"sort"
	"strings"

	"ft_transcendence/backend/config"
)

type CloudinaryConfig struct {
	Secret    string
	Key       string
	CloudName string
}

var cloudinaryConfig CloudinaryConfig

// Loads the Cloudinary credentials configuration
func InitCloudinary(cfg *config.Config) {
	cloudinaryConfig = CloudinaryConfig{
		Secret:    cfg.CloudinarySecret,
		Key:       cfg.CloudinaryKey,
		CloudName: cfg.CloudinaryCloudName,
	}
}

// Returns configured Cloudinary API key
func APIKey() string {
	return cloudinaryConfig.Key
}

// Returns configured Cloudinary cloud name
func CloudName() string {
	return cloudinaryConfig.CloudName
}

// Creates upload signature for Cloudinary
func GenerateCloudinarySignature(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var strToSign []string
	for _, k := range keys {
		strToSign = append(strToSign, fmt.Sprintf("%s=%s", k, params[k]))
	}

	queryString := strings.Join(strToSign, "&")
	fullString := queryString + cloudinaryConfig.Secret

	h := sha1.New()
	h.Write([]byte(fullString))

	return hex.EncodeToString(h.Sum(nil))
}
