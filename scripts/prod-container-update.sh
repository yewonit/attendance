docker stop attendance
docker rm attendance
docker pull coramdeoyouth/attendance
docker run -d -p 3000:3000 --name attendance -e NODE_ENV=production coramdeoyouth/attendance
