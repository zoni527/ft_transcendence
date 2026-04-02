FROM alpine:3.22 AS build

WORKDIR /app

RUN apk update && apk add wget --no-cache
RUN wget https://go.dev/dl/go1.26.1.linux-amd64.tar.gz && \
	rm -rf /usr/local/go && \
	tar -C /usr/local -xzf go1.26.1.linux-amd64.tar.gz
RUN rm -f go1.26.1.linux-amd64.tar.gz

COPY . .
RUN /usr/local/go/bin/go build -o /bin/backend

FROM scratch
COPY --from=build /bin/backend /bin/backend
EXPOSE 8080
ENTRYPOINT ["/bin/backend"]
