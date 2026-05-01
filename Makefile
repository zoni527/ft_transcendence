# ---------------------------------------------------------------------------- #
all: env_validation
	docker compose --file ./src/compose.yaml up --detach

clean:
	docker compose --file ./src/compose.yaml down

fclean: clean
	docker rmi --force transcendence_backend:dev_1.0
	docker rmi --force transcendence_frontend:dev_1.0

dbclean:
	docker compose --file ./src/compose.yaml down -v

re: fclean all
# ---------------------------------------------------------------------------- #
up: all

down: clean

nuke: fclean dbclean
# ---------------------------------------------------------------------------- #
# This rule checks if the backend compiles, without producing an executable
check_backend:
	cd src/backend && go build ./...

env_validation:
	@./scripts/env_validation.sh
# ---------------------------------------------------------------------------- #
.PHONY: all clean fclean dbclean re check_backend env_validation up down nuke
# ---------------------------------------------------------------------------- #
