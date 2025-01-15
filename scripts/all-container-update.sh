docker stop attendance-dev
docker rm attendance-dev
docker stop attendance
docker rm attendance
docker rmi $(docker images -q)
docker pull coramdeoyouth/attendance
docker run -d -p 3001:3000 --name attendance-dev -e NODE_ENV=development coramdeoyouth/attendance
docker run -d -p 3000:3000 --name attendance -e NODE_ENV=production coramdeoyouth/attendance
