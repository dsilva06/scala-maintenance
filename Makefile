# =====================================================
# Root Makefile – Single source of truth for the project
# Backend = Laravel + Sail (./backend)
# =====================================================

BACKEND_DIR := backend

.PHONY: help up down restart logs shell artisan migrate seed fresh key ps config-clear

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make up              Start backend (Sail)"
	@echo "  make down            Stop backend and remove volumes"
	@echo "  make restart         Restart backend containers"
	@echo "  make logs            Tail backend logs"
	@echo "  make shell           Enter Laravel container shell"
	@echo "  make artisan cmd=…   Run artisan command"
	@echo "  make migrate         Run migrations"
	@echo "  make seed            Run database seeders"
	@echo "  make fresh           Fresh DB + seed"
	@echo "  make key             Generate app key"
	@echo "  make ps              Show Sail containers"
	@echo "  make config-clear    Clear Laravel config/cache"
	@echo ""

up:
	cd $(BACKEND_DIR) && ./vendor/bin/sail up -d

down:
	cd $(BACKEND_DIR) && ./vendor/bin/sail down -v

restart:
	cd $(BACKEND_DIR) && ./vendor/bin/sail restart

ps:
	cd $(BACKEND_DIR) && ./vendor/bin/sail ps

logs:
	cd $(BACKEND_DIR) && ./vendor/bin/sail logs -f

shell:
	cd $(BACKEND_DIR) && ./vendor/bin/sail shell

artisan:
	@if [ -z "$(cmd)" ]; then \
		echo "Usage: make artisan cmd=\"migrate --seed\""; \
		exit 1; \
	fi
	cd $(BACKEND_DIR) && ./vendor/bin/sail artisan $(cmd)

migrate:
	cd $(BACKEND_DIR) && ./vendor/bin/sail artisan migrate

seed:
	cd $(BACKEND_DIR) && ./vendor/bin/sail artisan db:seed

fresh:
	cd $(BACKEND_DIR) && ./vendor/bin/sail artisan migrate:fresh --seed

key:
	cd $(BACKEND_DIR) && ./vendor/bin/sail artisan key:generate

config-clear:
	cd $(BACKEND_DIR) && ./vendor/bin/sail artisan config:clear && ./vendor/bin/sail artisan cache:clear
