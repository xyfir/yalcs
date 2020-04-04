# STEP 1 : image builder
FROM node:13 as builder

WORKDIR /home/node

COPY loader/package.json loader/yarn.lock ./loader/
COPY web/package.json loader/yarn.lock ./web/
COPY server/package.json loader/yarn.lock ./server/

RUN cd loader && yarn install \
 && cd ../web && yarn install \
 && cd ../server && yarn install

COPY . ./

RUN cd loader && yarn build \
 && cd ../web && yarn build \
 && cd ../server && yarn build

# STEP 2 : intermediate image to remove devDependencies
FROM builder as intermediate

RUN cd /home/node/server && npm prune --production


# STEP 2 : image running server
FROM node:13-alpine

RUN mkdir -p /home/node/{server,web}

COPY --from=intermediate /home/node/server/package.json /home/node/server/yarn.lock /home/node/server/
COPY --from=intermediate /home/node/server/dist /home/node/server/dist
COPY --from=intermediate /home/node/server/node_modules /home/node/server/node_modules
COPY --from=intermediate /home/node/server/.env /home/node/server/.env
COPY --from=intermediate /home/node/web/dist    /home/node/web/dist

WORKDIR /home/node/server

EXPOSE 2040

CMD ["npm", "run", "start"]
