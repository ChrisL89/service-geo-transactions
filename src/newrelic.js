'use strict';

const prod = {
  app_name: [process.env.ONCOURSE_STACK  + ': service-geo-transactions'],
  license_key: '8bb81d050d93f39eadc1aeefb0aec0245237922c',
  capture_params: true,
  agent_enabled: true,
  logging: { level: 'info' }
};

const test = {
  app_name: [process.env.ONCOURSE_STACK  + ': service-geo-transactions'],
  license_key: '37bc2b9cd8cf9c9bd56fcc4728c835864d2dfb9b',
  capture_params: true,
  agent_enabled: true,
  logging: { level: 'info' }
};

exports.config = process.env.NODE_ENV === 'prod' ? prod : test;
