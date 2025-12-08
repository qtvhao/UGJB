.PHONY: help install proto build run test clean docker-build docker-run docker-stop

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install Python dependencies
	pip install -r requirements.txt

proto: ## Generate gRPC code from proto files
	python -m grpc_tools.protoc \
		-I./protos \
		--python_out=. \
		--grpc_python_out=. \
		./protos/burnout.proto

run: proto ## Run the service locally
	python main.py

test: ## Run tests
	pytest tests/ -v

lint: ## Run linting
	pylint app/

format: ## Format code with black
	black app/ main.py

type-check: ## Run type checking
	mypy app/

clean: ## Clean generated files and cache
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*_pb2.py" -delete
	find . -type f -name "*_pb2_grpc.py" -delete
	rm -rf .pytest_cache .mypy_cache .coverage htmlcov/

docker-build: ## Build Docker image
	docker build -t burnout-predictor:latest .

docker-run: ## Run service in Docker
	docker run -p 8072:8072 -p 50054:50054 \
		-e KAFKA_ENABLED=false \
		burnout-predictor:latest

docker-compose-up: ## Start all services with docker-compose
	docker-compose up -d

docker-compose-down: ## Stop all services
	docker-compose down

docker-compose-logs: ## View docker-compose logs
	docker-compose logs -f burnout-predictor

docker-stop: ## Stop running Docker container
	docker stop burnout-predictor 2>/dev/null || true
	docker rm burnout-predictor 2>/dev/null || true

health-check: ## Check service health
	curl -f http://localhost:8072/health || echo "Service not running"

api-docs: ## Open API documentation in browser
	@echo "Opening API docs at http://localhost:8072/api/docs"
	open http://localhost:8072/api/docs || xdg-open http://localhost:8072/api/docs || echo "Please open http://localhost:8072/api/docs manually"

test-prediction: ## Test prediction endpoint
	curl -X POST http://localhost:8072/api/v1/predictions/predict \
		-H "Content-Type: application/json" \
		-d '{"employee_id":"TEST-001","metrics":{"hours_worked_per_week":55,"overtime_hours":15,"days_since_last_vacation":180,"consecutive_work_days":12,"average_daily_meetings":6,"task_completion_rate":0.75,"open_tasks_count":25,"overdue_tasks_count":8,"stress_level":8.5,"sleep_hours_average":5.5,"exercise_frequency":1,"work_life_balance_score":3,"productivity_score":65,"team_collaboration_score":70,"days_since_last_feedback":45,"job_satisfaction_score":4,"sick_days_last_month":3,"late_logins_count":8,"average_response_time_hours":12,"recent_performance_decline":true}}'

model-info: ## Get model information
	curl http://localhost:8072/api/v1/predictions/model/info | python -m json.tool
