FROM alpine:3.22

WORKDIR /app

RUN apk update && apk add nodejs npm --no-cache

COPY . .

RUN npm install

EXPOSE 5173

ENTRYPOINT ["npm"]
CMD ["run", "dev"]
