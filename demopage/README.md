# fparser demopage

This is a simple VueJS web page to demonstrate fparser's ability.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## Production container

To build the demo page as self-contained Docker-container, build the demopage container form the **root dir** of this repository:

```shell
# Build the image:
$ cd /path/to/fparser
$ docker build -t fparser-demopage .
# Then, run it:
$ docker run --name fparser-demopage -d -p 80:80 fparser-demopage
```