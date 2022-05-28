docker run --name mypostgresdb -v $(pwd)/db:/var/lib/postgresql/data -e POSTGRES_DB=progimage -e POSTGRES_PASSWORD=pass -p 5435:5432 -d postgres
sleep 4
docker exec mypostgresdb psql -U postgres -c 'CREATE DATABASE test'