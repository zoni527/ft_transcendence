# ---------------------------------------------------------------------------- #
all:
	docker compose --file ./src/compose.yaml up --detach

clean:
	docker compose --file ./src/compose.yaml down

fclean: clean
	docker rmi --force transcendence_backend:dev_1.0
	docker rmi --force transcendence_frontend:dev_1.0

dbclean:
	docker compose --file ./src/compose.yaml down -v


re: fclean all

# this rule check if files can be compiled without spitting out any executable file 
check:
	cd src/backend && go build ./...

up: all

down: clean

nuke: fclean
# ---------------------------------------------------------------------------- #
.PHONY: all clean fclean dbclean re check
# ---------------------------------------------------------------------------- #
