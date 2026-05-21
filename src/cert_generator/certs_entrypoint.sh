#!/bin/ash
set -e

CERTS_DIR="/certs"
DAYS=365

mkdir -p ${CERTS_DIR}

CERT_FILES="\
${CERTS_DIR}/ca.crt\
${CERTS_DIR}/ca.key\
${CERTS_DIR}/reverse_proxy.crt\
${CERTS_DIR}/reverse_proxy.key\
${CERTS_DIR}/backend.crt\
${CERTS_DIR}/backend.key\
${CERTS_DIR}/postgres.crt\
${CERTS_DIR}/postgres.key\
"

all_certs_exist=true
some_certs_exist=false

for f in ${CERT_FILES}; do
	if [ -f "${f}" ]; then
		some_certs_exist=true
	else
		all_certs_exist=false
	fi
done

if [ "${all_certs_exist}" = true ]; then
	echo "Certificates already generated"
	exit 0
fi

if [ "${some_certs_exist}" = true ]; then
	echo "Partial state detected, regenerating all"
	rm -rf ${CERTS_DIR}
	mkdir -p ${CERTS_DIR}
fi

echo "Generating certificates..."

# Certificate authority, used to sign other certificates
echo "Generating certificate authority"
openssl req -x509 -noenc -newkey rsa:2048 \
	-keyout	${CERTS_DIR}/ca.key \
	-out	${CERTS_DIR}/ca.crt \
	-days	${DAYS} \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=ft_transcendence_ca"

# Reverse proxy cert
echo "Generating reverse proxy cert"
openssl req -noenc -newkey rsa:2048 \
	-keyout	${CERTS_DIR}/reverse_proxy.key \
	-out	${CERTS_DIR}/reverse_proxy.csr \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=reverse_proxy" \
	-addext	"subjectAltName = DNS:reverse_proxy, DNS:localhost, IP:127.0.0.1, IP:::1"
openssl x509 -req 2>/dev/null \
	-in		${CERTS_DIR}/reverse_proxy.csr \
	-CA		${CERTS_DIR}/ca.crt \
	-CAkey	${CERTS_DIR}/ca.key \
	-CAcreateserial \
	-copy_extensions copyall \
	-out	${CERTS_DIR}/reverse_proxy.crt \
	-days	${DAYS}

# Backend cert
echo "Generating backend cert"
openssl req -noenc -newkey rsa:2048 \
	-keyout	${CERTS_DIR}/backend.key \
	-out	${CERTS_DIR}/backend.csr \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=backend" \
	-addext	"subjectAltName = DNS:backend, DNS:localhost, IP:127.0.0.1, IP:::1"
openssl x509 -req 2>/dev/null \
	-in		${CERTS_DIR}/backend.csr \
	-CA		${CERTS_DIR}/ca.crt \
	-CAkey	${CERTS_DIR}/ca.key \
	-CAcreateserial \
	-copy_extensions copyall \
	-out	${CERTS_DIR}/backend.crt \
	-days	${DAYS}

# Database cert
echo "Generating database cert"
openssl req -noenc -newkey rsa:2048 \
	-keyout	${CERTS_DIR}/postgres.key \
	-out	${CERTS_DIR}/postgres.csr \
	-subj	"/C=FI/ST=UUSIMAA/L=Helsinki/O=42/OU=Hive/CN=postgres" \
	-addext	"subjectAltName = DNS:postgres, DNS:localhost, IP:127.0.0.1, IP:::1"
openssl x509 -req 2>/dev/null \
	-in		${CERTS_DIR}/postgres.csr \
	-CA		${CERTS_DIR}/ca.crt \
	-CAkey	${CERTS_DIR}/ca.key \
	-CAcreateserial \
	-copy_extensions copyall \
	-out	${CERTS_DIR}/postgres.crt \
	-days	${DAYS}

# Postgres key permissions and ownership setting
echo "Setting permissions and ownership"
chmod 600 ${CERTS_DIR}/reverse_proxy.key
chmod 600 ${CERTS_DIR}/backend.key
chmod 600 ${CERTS_DIR}/postgres.key
chown 70:70 ${CERTS_DIR}/postgres.key || true

echo "Certificates generated"
