#* Setup
.PHONY: $(shell sed -n -e '/^$$/ { n ; /^[^ .\#][^ ]*:/ { s/:.*$$// ; p ; } ; }' $(MAKEFILE_LIST))
.DEFAULT_GOAL := help

help: ## list make commands
	@echo ${MAKEFILE_LIST}
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## start development server
	npm run dev

build: ## build the application
	npm run build

lint: ## run linter
	npm run lint

type-check: ## check TypeScript types
	npx tsc --noEmit

check-env-vars: ## check environment variables
	echo "Checking environment variables..."
	echo "GEMINI_API_KEY: ${GEMINI_API_KEY}"
	echo "ELEVENLABS_API_KEY: ${ELEVENLABS_API_KEY}"

test-gemini-key: ## test gemini API key
	node scripts/test-gemini-key.js

test-elevenlabs-key: ## test eleven labs API key
	npm run test:elevenlabs

test-keys: test-gemini-key test-elevenlabs-key ## test all API keys

step-check: ## run checks for current step (type-check + build)
	@make type-check
	@make build
	@echo "✅ Step verification complete"

step-test: ## test current implementation (requires dev server)
	@echo "Testing current implementation..."
	@make phase5-test-api

step-verify: step-check ## verify current step (check + build)
	@echo "✅ Current step verified"

clean: ## clean build artifacts
	rm -rf .next
	rm -rf node_modules/.cache
	@echo "✅ Cleaned build artifacts"

clean-all: clean ## clean everything including node_modules
	rm -rf node_modules
	rm tsconfig.tsbuildinfo
	@echo "✅ Cleaned everything"
