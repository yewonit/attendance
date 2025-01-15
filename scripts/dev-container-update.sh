docker stop attendance-dev
docker rm attendance-dev
docker pull coramdeoyouth/attendance
docker run -d -p 3001:3000 --name attendance-dev -e NODE_ENV=development coramdeoyouth/attendance
