cd loader \
    && yarn \
    && yarn build \
    && cd ../web \
    && yarn \
    && yarn build \
    && cd ../server \
    && yarn \
    && yarn build \
    && yarn start
