glchart
=======

GPU powered charts.

### Trying out glchart

1. Clone this repo and `cd` into it.
2. Install the npm dependencies:
    
        npm install

3. Start the electron sandbox

        npm run sandbox

### Creating the documentation

Running the following command:

        npm run docs_md

on the root dir will create documentation files in the `docs` directory. The 
main documentation file is name `DOCS.md`. The documentation is created using 
documentationjs and relies on the comments in the code. This means that it 
needs to be recreated any time changes are pulled from the repo.