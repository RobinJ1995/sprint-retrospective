#!/bin/bash
set -e

docker-compose -f dev.docker-compose.yml build --pull --parallel
docker-compose -f dev.docker-compose.yml up &

echo "Probing http://localhost:5431..."
while ! curl http://localhost:5431 &> /dev/null; do
  sleep 0.5
done

if command -v xdg-open &> /dev/null
then
    xdg-open "http://localhost:5431"
elif command -v open &> /dev/null
then
    open "http://localhost:5431"
fi

wait `jobs -pr`