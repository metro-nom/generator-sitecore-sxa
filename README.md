# Overview

The Sitecore SXA generator for Yeoman allows you to easily add new features to your Sitecore SXA solution, while following the [Helix guidelines](http://helix.sitecore.net/).

# Features

* Generates two projects for storing the code and items of your feature.
* Adds scaffolding code required for a new SXA component.
* Adds Sitecore items that register the component in Sitecore and in the SXA toolbox.
* Automatically recognizes the structure of your solution and adds the projects in correct folders.

# Current restrictions

* Only SXA 1.6 is supported at the moment. We plan to add SXA 1.7 support in the near future.
* Sitecore items are added as [TDS](https://www.teamdevelopmentforsitecore.com/) projects. We need volunteers to add support for [Unicorn](https://github.com/SitecoreUnicorn/Unicorn).
* The logic that recognizes solution structure needs to be further improved.

# Setup

## Seting up the generator

> Note: the generator will soon be available in npm as well, which will make its installation easier.

* Install [npm](https://www.npmjs.com/get-npm)
* Install [Yeoman](http://yeoman.io/) globally:  
`npm install -g yo`
* Clone this repository to your file system
* Open the command line and navigate to the root of the cloned repository
* Run `npm install`
* Run `npm link`

## Preparing the solution

* If you don't have a solution yet, create one, or generate it using [the Helix generator](https://www.npmjs.com/package/generator-helix).
* Make sure that the [Sitecore NuGet feed](https://doc.sitecore.net/sitecore_experience_platform/developing/developing_with_sitecore/sitecore_public_nuget_packages_faq) is set up in Visual Studio

## Running the generator

* Open the command line and navigate to the root of your solution
* Run `yo sitecore-sxa`
* Follow the on-screen instructions
* Open the solution and restore NuGet packages

You are now ready to develop your new SXA component!