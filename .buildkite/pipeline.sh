#!/usr/bin/env bash
set -euo pipefail

QUEUE_TEST="${QUEUE_TEST:-queue: greenmoon-ops}"

cat <<EOF
steps:
  - name: ':school_satchel:  Build'
    command:
      - make build-docker
    agents:
      ${QUEUE_TEST}
  - wait
  - name: ':mortar_board:  Test'
    command:
      - make ci-test
    agents:
      ${QUEUE_TEST}
  - wait
  - block: ":blue_book: Publish Artifact"
  - name: ':rocket:  Upload to Artifactory'
    command:
      - make build-docker
      - make ci-publish-gocd
    agents:
      ${QUEUE_TEST}
EOF