SRC_DIR			:= ./src
BACKEND_EXEC	:= backend

all: run_frontend run_backend

run_backend: ${SRC_DIR}/backend/${BACKEND_EXEC}
	${SRC_DIR}/backend/${BACKEND_EXEC}

run_frontend: build_frontend
	docker run \
		--detach \
		--name frontend \
		--publish 5173:5173 \
		frontend:dev_1.0

build_frontend:
	cd ${SRC_DIR}/frontend; \
	docker build --tag frontend:dev_1.0 .

${SRC_DIR}/backend/${BACKEND_EXEC}:
	cd ${SRC_DIR}/backend; go build -o ${BACKEND_EXEC}

fclean:
	docker kill frontend
	docker rmi --force frontend:dev_1.0
	docker container prune --force
	rm -f ${SRC_DIR}/backend/${BACKEND_EXEC}

re: fclean all

.PHONY: all clean fclean re run_backend
