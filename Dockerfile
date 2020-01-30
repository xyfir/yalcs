FROM node:13

ENV YALCS_HOME=/home/node \
    YALCS_USER=node

WORKDIR $YALCS_HOME

RUN mkdir -p loader/node_modules && chown $YALCS_USER:$YALCS_USER $YALCS_HOME/loader/node_modules \
  && mkdir -p server/node_modules && chown $YALCS_USER:$YALCS_USER $YALCS_HOME/server/node_modules \
  && mkdir -p web/node_modules && chown $YALCS_USER:$YALCS_USER $YALCS_HOME/web/node_modules

USER $YALCS_USER

CMD ["/bin/bash", "docker-entrypoint.sh"]
