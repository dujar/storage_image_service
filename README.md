# IMAGE STORAGE PROVIDER

ProgImage service stores images currently  in uploads folder with its mime type extension found in db.
supports reading JPEG, PNG, WebP, GIF, 

as for AVIF, TIFF and SVG images, it has not yet been tested but should be able to read store and read only without converting to these extensions.

Output images can be in JPEG, PNG, WebP, GIF, AVIF and TIFF formats as well as uncompressed raw pixel data as the library used is [sharp](https://sharp.pixelplumbing.com/)


endpoints:

``` POST http://localhost:5001/uploads``` --multipart form
``` GET http://localhost:5001/image/:fileId.jpeg```
## PREREQUISITES
docker
nodejs > 14.00
yarn
## HOW TO RUN
### setup
run this at the beginning and run it again if the tests fail
```yarn setup```
### tests
```yarn test```

### run

```yarn start```



### features to improve

- have only one file type such as webp stored. 
- authentication with bearer if service needs to be private

