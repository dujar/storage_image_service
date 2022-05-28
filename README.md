# IMAGE STORAGE PROVIDER
stores images currently  in uploads folder with its mime type extension found in db.
currently converts png to jpeg directly and stores on disk.
## PREREQUISITES
nodejs > 14.00
yarn
## HOW TO RUN
### setup
```yarn setup```
### tests
```yarn test```

### run

```yarn start```



### features to improve

- add more conversions and not convert file directly. 
- Convert it on the fly on demand whenever possible with what is there.
- file names saved to be same length
