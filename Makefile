all: dev

dev: build_dev deploy_dev

build_dev:
	bbb couchapp_setup

deploy_dev:
	bbb couchapp:default
