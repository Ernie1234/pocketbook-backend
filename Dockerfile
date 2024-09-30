FROM node:alpine

WORKDIR /usr/app

COPY package*.json .

RUN yarn ci

COPY . .

CMD ["yarn", "start"]
