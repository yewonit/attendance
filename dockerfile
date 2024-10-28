# before packaging container, pass 'NODE_ENV' env (e.g. NODE_ENV=development)

FROM node:23.1.0-alpine3.20

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "index.js"]
