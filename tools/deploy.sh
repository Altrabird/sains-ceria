#!/bin/sh
# Build dist/web and swap it in on the VPS in one step (old copy kept as <dir>.old for rollback).
# Usage: DEPLOY=root@46.250.236.201:/var/www/edugames sh tools/deploy.sh   (https://edugames.altrabird.click, nginx: tools/nginx-edugames.conf)
set -e
: "${DEPLOY:?set DEPLOY=user@host:/path/to/site}"
host=${DEPLOY%%:*}; dir=${DEPLOY#*:}
python tools/build.py web
tar -C dist/web -czf - . | ssh "$host" "set -e; rm -rf '$dir.new'; mkdir -p '$dir.new'; tar -xzf - -C '$dir.new'; chmod -R a+rX '$dir.new'; rm -rf '$dir.old'; [ ! -d '$dir' ] || mv '$dir' '$dir.old'; mv '$dir.new' '$dir'"
echo "deployed to $DEPLOY"
