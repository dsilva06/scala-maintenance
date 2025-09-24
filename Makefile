# Project-level Makefile helpers for the Laravel backend

BACKEND_DIR := backend
UID := $(shell id -u)
GID := $(shell id -g)

# Containers for tooling (no global PHP/Composer required)
DOCKER_COMPOSER := docker run --rm -u $(UID):$(GID) -v $(CURDIR)/$(BACKEND_DIR):/app -w /app composer:2
DOCKER_PHP := docker run --rm -u $(UID):$(GID) -v $(CURDIR)/$(BACKEND_DIR):/app -w /app -p 8000:8000 php:8.3-cli

.PHONY: backend-bootstrap backend-serve backend-key backend-artisan backend-composer backend-test backend-clean backend-help

backend-help:
	@echo "Backend targets:"
	@echo "  make backend-bootstrap     # Scaffold Laravel app into ./backend"
	@echo "  make backend-serve         # Serve app on http://localhost:8000"
	@echo "  make backend-key           # Generate app key (.env)"
	@echo "  make backend-artisan cmd=… # Run any artisan command"
	@echo "  make backend-composer cmd=…# Run any composer command"
	@echo "  make backend-test          # Run tests"
	@echo "  make backend-clean         # Remove vendor cache (safe)"

# Create a new Laravel application inside ./backend
backend-bootstrap:
	@if [ -f "$(BACKEND_DIR)/artisan" ]; then \
		echo "Laravel already present in $(BACKEND_DIR). Skipping create-project."; \
	else \
		echo "Scaffolding Laravel into $(BACKEND_DIR)…"; \
		$(DOCKER_COMPOSER) composer create-project laravel/laravel .; \
		echo "Done. Next: make backend-key && make backend-serve"; \
	fi

# Serve the application via PHP's built-in server
backend-serve:
	@if [ ! -f "$(BACKEND_DIR)/artisan" ]; then \
		echo "Laravel not found. Run: make backend-bootstrap"; \
		exit 1; \
	fi
	$(DOCKER_PHP) php artisan serve --host=0.0.0.0 --port=8000

# Generate application key
backend-key:
	@if [ ! -f "$(BACKEND_DIR)/artisan" ]; then \
		echo "Laravel not found. Run: make backend-bootstrap"; \
		exit 1; \
	fi
	$(DOCKER_PHP) php artisan key:generate

# Run arbitrary artisan commands: make backend-artisan cmd="migrate --seed"
backend-artisan:
	@if [ ! -f "$(BACKEND_DIR)/artisan" ]; then \
		echo "Laravel not found. Run: make backend-bootstrap"; \
		exit 1; \
	fi
	@if [ -z "$(cmd)" ]; then \
		echo "Usage: make backend-artisan cmd=\"…\""; \
		exit 2; \
	fi
	$(DOCKER_PHP) php artisan $(cmd)

# Run arbitrary composer commands in ./backend: make backend-composer cmd="require laravel/pint --dev"
backend-composer:
	@if [ -z "$(cmd)" ]; then \
		echo "Usage: make backend-composer cmd=\"…\""; \
		exit 2; \
	fi
	$(DOCKER_COMPOSER) composer $(cmd)

# Run the test suite
backend-test:
	@if [ ! -f "$(BACKEND_DIR)/artisan" ]; then \
		echo "Laravel not found. Run: make backend-bootstrap"; \
		exit 1; \
	fi
	$(DOCKER_PHP) php artisan test --parallel

# Clean up vendor cache only (safe to run anytime)
backend-clean:
	@if [ -d "$(BACKEND_DIR)/vendor" ]; then \
		rm -rf "$(BACKEND_DIR)/vendor"; \
		echo "Removed backend/vendor"; \
	else \
		echo "No vendor directory present."; \
	fi

