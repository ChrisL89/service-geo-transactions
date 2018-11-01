PROJECT=service-geo-transactions
VERSION=latest

SERVICE_NAME  = ${PROJECT}
GIT_HASH      = $(shell git rev-parse --short HEAD)
RELEASE       = $(shell ./node_modules/.bin/release-version)
DOCKER_REPO  := docker-env.artifacts.tabdigital.com.au
IMAGE        := $(SERVICE_NAME):$(GIT_HASH)

all: build

build: node_modules build-avro-schema build-docker

build-avro-schema:
	./scripts/buildkite-build-digital-avro-schemas.sh

build-docker: clean pre-build
	@echo "Now building..."
	cp ${HOME}/.npmrc .
	docker build --build-arg RELEASE_VERSION=$(RELEASE) -t $(IMAGE) -f Dockerfile .
	docker tag $(IMAGE) $(PROJECT):$(VERSION)
	rm -rf .npmrc

run-docker:
	docker-compose -f docker-compose.yaml up

run-docker-ssm:
	docker-compose -f docker-compose.ssm.yaml up

test: node_modules test-keys
	docker run -v ${PWD}:/app/ $(PROJECT):$(VERSION) npm run lint && npm run test

### Build Dependencies
node_modules:
	npm install

pre-build:
	npm install --only=dev

clean:
	rm -rf .npmrc swagger.json temp test/keys

test-keys: test-keys-dir test/keys/jwt-sign.key test/keys/jwt-sign.pem

test-keys-dir:
	@mkdir -p test/keys

test/keys/jwt-sign.key:
	@openssl genrsa -out test/keys/jwt-sign.key 512

test/keys/jwt-sign.pem: test/keys/jwt-sign.key
	@openssl rsa -in test/keys/jwt-sign.key -outform PEM -pubout -out test/keys/jwt-sign.pem

########## CI/CD
ci-test: build-avro-schema test-keys
	docker-compose -f docker-compose.yaml down --remove-orphans
	docker-compose -f docker-compose.yaml up -d postgres
	docker-compose -f docker-compose.yaml run --rm service-geo-transactions npm run test-ci
	docker-compose -f docker-compose.yaml down --remove-orphans

ci-publish-gocd: build-docker
	@echo ">> Now pushing $(IMAGE) to $(DOCKER_REPO) and triggering GOCD deployment"
	docker tag $(IMAGE) $(DOCKER_REPO)/$(SERVICE_NAME):$(RELEASE)
	docker push $(DOCKER_REPO)/$(SERVICE_NAME):$(RELEASE)
	./node_modules/.bin/trigger-gocd-deployment --service ${SERVICE_NAME} --release ${RELEASE}

########## Deployment Database Commands
db-migrate:
	APP_ENV=Deployment ./bin/create-db.js
	APP_ENV=Deployment ./bin/migrate-up.js

db-migrate-down:
	APP_ENV=Deployment ./bin/migrate-down.js 2

db-connect-admin:
	@-apt-get install postgresql -y
	test -n "$(DB_HOST)"  # $$DB_HOST
	test -n "$(DB_ADMIN_USER)"  # $$DB_ADMIN_USER
	test -n "$(DB_ADMIN_PASSWORD)"  # $$DB_ADMIN_PASSWORD
	PGPASSWORD=$(DB_ADMIN_PASSWORD) psql -h $(DB_HOST) -U $(DB_ADMIN_USER) -d postgres

db-connect-user:
	@-apt-get install postgresql -y
	test -n "$(DB_HOST)"  # $$DB_HOST
	test -n "$(DB_USER)"  # $$DB_USER
	test -n "$(DB_PASSWORD)"  # $$DB_PASSWORD
	PGPASSWORD=$(DB_PASSWORD) psql -h $(DB_HOST) -U $(DB_USER) -d geotransactions

.PHONY: clean test ci-publish-gm ci-publish-gocd ci-test ci-build run-docker-uat node_modules pre-build build-docker build-arvo-schema build deployment-db-connect deployment-migrate-manual deployment-db-env test-keys test-keys-dir
