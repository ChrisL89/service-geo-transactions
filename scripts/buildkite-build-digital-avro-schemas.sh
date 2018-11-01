#!/bin/bash

echo "Building digital-avro-schemas image"
# SchemaBranch="master"
SchemaBranch=${BUILDKITE_BRANCH:-$(git branch | grep '\*' | cut -d ' ' -f2-)}
echo "$SchemaBranch"

# Clone Repo
# TODO: when digital-avro-schemas provide a config for DockerDev,
# replace ../digital-avro-schemas with ./temp/digital-avro-schemas.
mkdir -p ../digital-avro-schemas
( cd .. && [[ -d /digital-avro-schemas ]] || git clone git@github.tabcorp.com.au:TabDigital/digital-avro-schemas.git )
pushd ../digital-avro-schemas
  echo "Schema Branch $SchemaBranch"
  branchCheck=$(git branch | grep $SchemaBranch)
  # Check if branch exists
  echo "$branchCheck"
  if [[ "$branchCheck" == "" ]]; then
    echo "Branch does not exist switching to master branch"
    SchemaBranch="master"
  fi

  echo "Checking out digital-avro-schemas on $SchemaBranch branch"
  git reset --quiet --hard && git clean -d --force --quiet && git fetch --all
  git checkout $SchemaBranch && git pull
  make build-docker
popd
