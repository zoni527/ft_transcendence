# ---------------------------------------------------------------------------- #
all: env_validation certs
	docker compose --file ./src/compose.yaml up --detach

certs:
	mkdir -p certs

backend: env_validation certs
	docker compose --file ./src/compose.yaml up --detach --build backend

clean:
	docker compose --file ./src/compose.yaml down

fclean: clean
	docker rmi --force transcendence_backend:dev_1.0
	docker rmi --force transcendence_frontend:dev_1.0
	rm -rf certs

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

test_backend:
	cd src/backend && go test ./...

env_validation:
	@./scripts/env_validation.sh

help:
	@printf "Available targets:\n"
	@printf "  all             Validate the environment and start the stack\n"
	@printf "  backend         Validate the environment and rebuild/start only backend\n"
	@printf "  clean           Stop the Docker stack\n"
	@printf "  fclean          Stop the stack and remove backend/frontend images\n"
	@printf "  dbclean         Stop the stack and remove volumes\n"
	@printf "  re              Run fclean, then bring the stack back up\n"
	@printf "  up              Alias for all\n"
	@printf "  down            Alias for clean\n"
	@printf "  nuke            Run fclean and dbclean\n"
	@printf "  check_backend   Compile the backend without producing an executable\n"
	@printf "  env_validation  Check local environment prerequisites\n"
	@printf "  help            Show this help message\n"
# ---------------------------------------------------------------------------- #
.PHONY: all backend help clean fclean dbclean re check_backend test_backend env_validation up down nuke
# ---------------------------------------------------------------------------- #
