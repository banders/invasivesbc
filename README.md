# River Guardian - Mobile-friendly data entry app

## Introduction

River guardian programs collect information about angling activities by interviewing anglers.  

This project includes a mobile-friendly app for use by river guardians to record information collected by intervewing anglers.

## Table of Contents

1. [Project Status](#project-status)
1. [Audience](#audience)
1. [Features](#features)
1. [Getting Help or Reporting an Issue](#getting-help-or-reporting-an-issue)
1. [How to Contribute](#how-to-contribute)
1. [Architecture](#architecture)
1. [Project Structure](#project-structure)
1. [Documentation](#documentation)
1. [Requirements](#requirements)
1. [Setup Instructions](#setup-instructions)
1. [Running the Application](#running-the-application)
1. [License](#license)

## Project Status

This application is in active development and has not yet been released.

## Audience

The application is intended for use by:

* River guardians (i.e. people who conduct angler interviews and record the information collected).

## Features

This application is anticipated to include the following main features:

1. An interactive form to record information collected during angler interviews
1. Support for offline work, so that app can be used "in the field" where internet access bmay be restricted
1. An interactive map to identify the location of an angler interview
1. Ability to export a list of all angler interviews

## Getting Help or Reporting an Issue

To report bugs/issues/features requests, please file an issue.

## How to Contribute

If you would like to contribute, please see our [contributing](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

## Architecture

This project was forked from the InvasivesBC project.  The Invasives project include multiple components, including a database, an API and a mobile app.  This project does
not utilize the database or API (although the source files for those component are currently still included in the repo).  This project focuses only on the mobile app 
(Ionic + React)

## Project Structure

    .config/                   - Common application configuration
    .github/                   - Github actions
    .docker/                   - Common Dockerfiles 
    .vscode/                   - IDE config for Visual Studio Code
    api/                       - API codebase
    app/                       - Ionic APP Codebase
    database/                  - Database Codebase
    env_config/                - ENV config files
    testing/                   - Test scripts, in particular Postman configs
    CODE-OF-CONDUCT.md         - Code of Conduct
    CONTRIBUTING.md            - Contributing Guidelines
    LICENSE                    - License

## Development

Ionic/React

```
npm install -g @ionic/cli native-run cordova-res
```

The ideal multi-platform supporting machine is the Mac, But Windows and Linus work very well for Web and Android as well.

### Android Development

Install AndroidStudio and the Android SDK.

### IOS Development

On MacOS: Install xCode.


## Setup Instructions

Clone the repository to your own machine and follow instructions below.

## Run the app locally (web)

In the app directory:

```
npm install

ionic serve
```

## Run the app on mobile

### Android

On MacOS, Windows or Linux, in the app directory:

1. `npm install`
2. `ionic build`
3. `ionic cap add android` (Only the first time, does not need to be repeated after)
4. `ionic cap copy`
5. `ionic cap sync`
6. `npx cap open Android`

Android Studio will open and, after a short delay, will allow you to run the application in the simulator.


### IOS

On MacOS, in the app directory:

1. `npm install`
2. `ionic build`
3. `ionic cap add android` (Only the first time, does not need to be repeated after)
4. `ionic cap copy`
5. `ionic cap sync`
6. `npx cap open ios`

xCode will open and, after a short delay, will allow you to run the application in the simulator.


## License

    Copyright 2019 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
