FROM alpine:3.22

WORKDIR /app

RUN apk update && apk add nodejs npm --no-cache

COPY . .

RUN npm install && npm cache clean --force && npm prune

EXPOSE 5173

ENTRYPOINT ["npm"]
CMD ["run", "dev"]
