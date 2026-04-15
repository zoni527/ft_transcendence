FROM golang:1.26.1-alpine3.22 AS build

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY . .
RUN /usr/local/go/bin/go build -o /bin/backend

FROM scratch
COPY --from=build /bin/backend /bin/backend
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
EXPOSE 8080
ENTRYPOINT ["/bin/backend"]
