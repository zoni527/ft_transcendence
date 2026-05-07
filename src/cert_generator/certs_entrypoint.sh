#!/bin/ash
set -e

CERTS_DIR="/certs"
DAYS=356

mkdir -p ${CERTS_DIR}

if [ -f "${CERTS_DIR}/ca.crt" ]; then
	echo "Certificates already generated"
	exit 0
fi

echo "Generating certificates..."

# Certificate authority, used to sign other certificates
openssl req -x509 -noenc -newkey rsa:2048 2>/dev/null \
	-keyout	${CERTS_DIR}/ca.key \
	-out	${CERTS_DIR}/ca.crt \
	-days	${DAYS} \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=ft_transcendence_ca"

# Backend cert
openssl req -noenc -newkey rsa:2048 2>/dev/null \
	-keyout	${CERTS_DIR}/backend.key \
	-out	${CERTS_DIR}/backend.csr \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=backend"
openssl x509 -req 2>/dev/null \
	-in		${CERTS_DIR}/backend.csr \
	-CA		${CERTS_DIR}/ca.crt \
	-CAkey	${CERTS_DIR}/ca.key \
	-CAcreateserial \
	-out	${CERTS_DIR}/backend.crt \
	-days	${DAYS}

# Database cert
openssl req -noenc -newkey rsa:2048 2>/dev/null \
	-keyout	${CERTS_DIR}/postgres.key \
	-out	${CERTS_DIR}/postgres.csr \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=postgres"
openssl x509 -req 2>/dev/null \
	-in		${CERTS_DIR}/postgres.csr \
	-CA		${CERTS_DIR}/ca.crt \
	-CAkey	${CERTS_DIR}/ca.key \
	-CAcreateserial \
	-out	${CERTS_DIR}/backend.crt \
	-days	${DAYS}

# Postgres key permissions and ownership setting
chmod 600 ${CERTS_DIR}/postgres.key
chown 70:70 ${CERTS_DIR}/postgres.key

echo "Certificates generated"
