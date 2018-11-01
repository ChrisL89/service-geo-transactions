FROM docker-env-local.artifacts.tabdigital.com.au/tabdigital-node:8.9.3-slim.6f569c1
WORKDIR /app/
ENV npm_config_LOGLEVEL=error

ARG RELEASE_VERSION
ENV RELEASE_VERSION ${RELEASE_VERSION:-UNKNOWN_RELEASE_VERSION}

COPY . /app/
RUN npm install --only=prod && rm -f .npmrc && npm cache clean --force

CMD [ "npm", "start" ]
EXPOSE 8290
