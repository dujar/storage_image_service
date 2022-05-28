# IMAGE STORAGE PROVIDER

ProgImage service stores images currently  in uploads folder with its mime type extension found in db.
currently converts png to jpeg  if upload of image performed with png.

current supported conversion if file was uploaded with png
png --> jpeg


endpoints:

``` POST http://localhost:5001/uploads``` --multipart form
``` GET http://localhost:5001/image/:fileId.jpeg```
## PREREQUISITES
docker
nodejs > 14.00
yarn
## HOW TO RUN
### setup
run this at the beginning and run it again if the tests failed.
```yarn setup```
### tests
```yarn test```

### run

```yarn start```



### features to improve

- cors
- add more conversions.
- have only one file type such as webp stored. 
- file name ids saved to be same length
- authentication with bearer if service needs to be private

