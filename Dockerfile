FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build  # Make sure this command builds your project

CMD ["node", "dist/index.js"]
