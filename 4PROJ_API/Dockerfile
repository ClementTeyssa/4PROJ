FROM golang:alpine AS build-env
WORKDIR /go/src
COPY . /go/src/welcome-app
RUN apk update && apk add git
RUN go get github.com/globalsign/mgo/bson && go get github.com/go-bongo/bongo && go get github.com/gorilla/mux
RUN cd /go/src/welcome-app && go build .
#go build command creates a linux binary that can run without any go tooling.

FROM alpine
#Alpine is one of the lightest linux containers out there, only a few MB
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk*
WORKDIR /app
COPY --from=build-env /go/src/welcome-app/welcome-app /app
#Here we copy the binary from the first image (build-env) to the new alpine container

EXPOSE 8080
ENTRYPOINT [ "./welcome-app" ]