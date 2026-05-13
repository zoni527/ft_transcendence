FROM alpine:3.22

WORKDIR /usr/local/bin

RUN apk update && apk add --no-cache openssl

COPY . .

RUN chmod +x certs_entrypoint.sh

USER root

ENTRYPOINT ["./certs_entrypoint.sh"]
