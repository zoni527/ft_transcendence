package config

import (
	"errors"
	"os"
	"strings"
)

type Config struct {
	JWTSecret           string
	CloudinarySecret    string
	CloudinaryCloudName string
	CloudinaryKey       string
}

func Load() (*Config, error) {
	cfg := &Config{
		JWTSecret:           strings.TrimSpace(os.Getenv("JWT_SECRET")),
		CloudinarySecret:    strings.TrimSpace(os.Getenv("CLOUDINARY_SECRET")),
		CloudinaryCloudName: strings.TrimSpace(os.Getenv("CLOUDINARY_CLOUD_NAME")),
		CloudinaryKey:       strings.TrimSpace(os.Getenv("CLOUDINARY_KEY")),
	}

	if cfg.JWTSecret == "" {
		return nil, errors.New("missing JWT_SECRET")
	}
	if cfg.CloudinarySecret == "" || cfg.CloudinaryCloudName == "" || cfg.CloudinaryKey == "" {
		return nil, errors.New("missing Cloudinary env variables")
	}

	return cfg, nil
}
