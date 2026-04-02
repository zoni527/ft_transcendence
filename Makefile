# ---------------------------------------------------------------------------- #
all:
	docker compose --file ./src/compose.yaml up --detach

clean:
	docker compose --file ./src/compose.yaml down

fclean: clean
	docker rmi --force transcendence_backend:dev_1.0
	docker rmi --force transcendence_frontend:dev_1.0

re: fclean all
# ---------------------------------------------------------------------------- #
.PHONY: all clean fclean re
# ---------------------------------------------------------------------------- #
