SRC_DIR			:= ./src
BACKEND_EXEC	:= backend

all: run_backend

run_backend: ${SRC_DIR}/backend/${BACKEND_EXEC}
	${SRC_DIR}/backend/${BACKEND_EXEC}

${SRC_DIR}/backend/${BACKEND_EXEC}:
	cd ${SRC_DIR}/backend; go build -o ${BACKEND_EXEC}

fclean:
	rm -f ${SRC_DIR}/backend/${BACKEND_EXEC}

re: fclean all

.PHONY: all clean fclean re run_backend
