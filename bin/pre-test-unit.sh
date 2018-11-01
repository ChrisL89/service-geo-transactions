#/bin/sh

echo "Generate test-key files for jwt unit tests..."
mkdir -p test/keys
openssl genrsa -out test/keys/jwt-sign.key 512
openssl rsa -in test/keys/jwt-sign.key -outform PEM -pubout -out test/keys/jwt-sign.pem
