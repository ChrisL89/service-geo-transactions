# Documentation

Geo-Transaction project generate the document though JSDOC.

## Genarate document
```shell
npm run create-doc
```

## JSDOC configuration file location
service-geo-transactions/jsdoc/config.json

## JSDOC location
service-geo-transactions/docs

### How to Include new directories or paths in JSDOC creation
include the directory or the file name or the directory in the source , includes section in the JSDOC config.
For Example  include directory test as part of JSDOC creation

```javascript
{
  "plugins": [],
  "recurseDepth": 10,
  "source": {
    "include" : ["src/components", "path to directory test"],
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "(^|\\/|\\\\)_"
  },
  "sourceType": "module",
  "tags": {
    "allowUnknownTags": true,
    "dictionaries": ["jsdoc","closure"]
  },
  "templates": {
    "cleverLinks": false,
    "monospaceLinks": false
  },
  "opts": {
    "template": "templates/default",
    "encoding": "utf8",
    "destination": "docs",
    "recurse": true
  }
}

```


 ## JSDOC comment guide
 http://usejsdoc.org/

 ## More information about JSDOC Configuration
 http://usejsdoc.org/about-configuring-jsdoc.html
