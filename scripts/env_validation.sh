#!/bin/bash

if [ ! -f ./src/.env ]; then
	echo "src/.env file is missing"
	exit 1
fi

env_vars="\
	POSTGRES_USER\
	POSTGRES_PASSWORD\
	POSTGRES_DB\
	DATABASE_URL\
	JWT_SECRET\
	CLOUDINARY_SECRET\
	CLOUDINARY_CLOUD_NAME\
	CLOUDINARY_KEY
"

for v in ${env_vars}; do
	match="$(grep -E "^[[:space:]]*${v}=" ./src/.env | head -n 1)"
	if [ -z "${match}" ]; then
		echo "${v} is missing from src/.env"
		exit 1
	fi
	if [ ! -n "$(printf '%s' "${match}" | cut -d '=' -f 2-)" ]; then
		echo "${v} is not defined"
		exit 1
	fi
done
