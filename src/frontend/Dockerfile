FROM alpine:3.22

WORKDIR /app

RUN apk update && apk add nodejs npm --no-cache

COPY . .

RUN npm install

ENTRYPOINT ["npm"]
CMD ["run", "dev"]
