# Kaupunki Taskussa PWA

## Progressive Web Application 

This application features different modules for displaying content from the City of Hämeenlinna website and separate sources. These include a digital library card, event API from Häme Events...

## Project setup
Run Setup.js in terminal with command: ```npm run setup```

If project already have settings.json with important information, remember to backup settings.json file before Setup.js program ends. Setup.js will overwrite existing file.

Read messages on terminal and answer questions.

Keep in mind that program only checks if answer is Y or y and if user type something else program will automatically assume that user means n (no).

First step will determine external urls, then program will go through ./src/modules folder and ask if user wants to include module to project. Modules may have complicated settings so read prompts carefully.

When Setup.js is done, settings.json is created. User can modify settings.json manually and change variables. Note that NavBar items ("Buttons to the modules/external links) can be rearranged by changing settings.json item order (settings.json "key" parameter is not relevant in rearranging, it is a unique id for item).

Read more:
https://github.com/hamk-uas/kaupunki-taskussa-pwa/wiki/Setup-program#setup-program

### Build
Build the application with the ```build``` command and serve the generated ```build/``` directory with your selected app server  

### Scripts
Available scripts can be found in the ```package.json``` file
```bash
"start": "webpack serve --mode development --env development"
```
Run the development server from Webpack.  

```bash
"build": "webpack --mode production"
```
Build the application with Webpack. Files will be output to ```build/``` directory.  

```bash
"test": "jest"
```
Run test files named as *.test.js.  

```bash
"setup": "node ./src/helpers/Setup.js",
```
Generate the module names to be used with the application routing. Check [Project setup](#Project-setup)

```bash
"devios": "remotedebug_ios_webkit_adapter --port=9000",
```

```bash
"deviosProxy": "ios_webkit_debug_proxy"
```

## Testing

Currently there are tests implemented for Jest and Cypress. Jest tests include basic test cases for main page, library card and events. Cypress tests include tests for main page, library card and navigation. 

### Jest

Tests can be run with the command npm run test. Tests include variable levels of detail and complexity.

### Cypress

Tests can be run directly in the command line with 

```bash
npx cypress run
```

or the tests can be opened in browser and run from there with 

```bash
npx cypress open -b chrome
```

## Customization

Customization can be done with the setup program and editing the `variables.scss` file in the `src/theme` folder. Customization includes basic styling, icon and color definitions.

## Notes

The Kirjastokortti_module.js is made specifically for the Hämeenlinna library system. Connecting to another system may require creating a new module.