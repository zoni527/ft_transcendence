FROM golang:1.26.1-alpine3.22 AS build

WORKDIR /app

COPY go.mod go.sum .
RUN apk add --no-cache ca-certificates
RUN go mod download

COPY . .

RUN /usr/local/go/bin/go build -o /bin/backend

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /bin/backend /bin/backend
ENTRYPOINT ["/bin/backend"]
