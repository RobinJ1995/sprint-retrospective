#!/bin/bash
set -e

docker-compose -f dev.docker-compose.yml build --pull --parallel
if [[ ! -z "${TAIL_LOGS_FROM_ALL_CONTAINERS}" ]]
then
  docker-compose -f dev.docker-compose.yml up &
else
  docker-compose -f dev.docker-compose.yml up -d
  docker-compose -f dev.docker-compose.yml logs -f frontend &
fi

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