'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const rename = require("gulp-rename");
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const uuid = require('uuid/v4');
const UUID = () => uuid().toUpperCase();

module.exports = class extends Generator {
    initializing() {
        if(!this._getSlnFilePath()) {
            this.env.error(chalk.bold.red("Error: cannot find a .sln file in the current directory."));
        }
    }

    prompting() {
        this.log(yosay(`Welcome to the ${chalk.bold.blue('Sitecore SXA')} project generator!`));

        const prompts = [{
            type    : 'input',
            name    : 'featureName',
            message : 'The name of your feature:',
            store   : false
        },{
            type    : 'input',
            name    : 'namespacePrefix',
            message : 'The namespace prefix, including the Helix layer (e.g. YourBrand.Feature):',
            store   : true
        },{
            type    : 'input',
            name    : 'tenantFolderName',
            message : 'The name of the SXA tenant (found under /sitecore/content), also used to group features together:',
            store   : true
        },
        {
            type    : 'input',
            name    : 'baseControllerName',
            message : 'The name of base controller from which the component controller will inherit:',
            default : 'StandardController',
            store   : true
        }];

        return this.prompt(prompts).then(props => { this.model = props; });
    }

    writing() {
        this._populateModel();

        let model = this.model;
        
        let featureRoot = this.destinationPath(`Website/Feature/${model.featureName}/`);
        
        this.registerTransformStream(rename(function(path) {
            for (let [key, value] of Object.entries(model)) {
                let regex = new RegExp(`(_${key}_)`, 'g');
                path.basename = path.basename.replace(regex, value);
                path.dirname = path.dirname.replace(regex, value);
            }
        }));

        this.fs.copyTpl(this.templatePath('**'), featureRoot, model);

        this._modifySolution();

        this._modifyAvailableRenderings();
    }

    _populateModel() {
        if (this.model.namespacePrefix.length && !this.model.namespacePrefix.endsWith('.')) {
            this.model.namespacePrefix = this.model.namespacePrefix + '.';
        }

        this.model.featureNamespace = this.model.namespacePrefix + this.model.featureName;

        this.model = Object.assign(this.model, {
            uuid,
            UUID,
            codeProjectGuid: UUID(),
            tdsProjectGuid: UUID(),
            renderingItemGuid: UUID(),
            templateGuid: UUID(),
            renderingParametersItemGuid: UUID(),
            rootRelativePath: '..\\..\\..\\..\\',

            featureCssClass: this._pascalToHyphen(this.model.featureName),
            controllerReference: `${this.model.featureNamespace}.Controllers.${this.model.featureName}Controller,${this.model.featureNamespace}`,
            datasourceQuery: `query:$site/*[@@templatename='DataFolder']/*[@@templatename='${this.model.featureName}']|query:$sharedSites/*[@@templatename='DataFolder']/*[@@templatename='${this.model.featureName}']`
        });
    }

    _modifySolution() {
        let slnFilePath = this._getSlnFilePath();

        let slnText = this.fs.read(slnFilePath);
        
        slnText = this._ensureSolutionSection(slnText, 'ProjectConfigurationPlatforms', 'postSolution');
        slnText = this._ensureSolutionSection(slnText, 'NestedProjects', 'preSolution');

        let featureFolderGuid = UUID();

        let projectDefinition =
            `Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "${this.model.featureNamespace}", "Website\\Feature\\${this.model.featureName}\\code\\${this.model.featureNamespace}.csproj", "{${this.model.codeProjectGuid}}"\r\n` +
            `EndProject\r\n` +
            `Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "${this.model.featureName}", "${this.model.featureName}", "{${featureFolderGuid}}"\r\n` +
            `EndProject\r\n` +
            `Project("{CAA73BB0-EF22-4D79-A57E-DF67B3BA9C80}") = "${this.model.featureNamespace}.Master", "Website\\Feature\\${this.model.featureName}\\tds\\${this.model.featureNamespace}.Master.scproj", "{${this.model.tdsProjectGuid}}"\r\n` +
            `EndProject`;
        
        let projectBuildConfig = 
            `		{${this.model.codeProjectGuid}}.Debug|Any CPU.ActiveCfg = Debug|Any CPU\r\n` +
            `		{${this.model.codeProjectGuid}}.Debug|Any CPU.Build.0 = Debug|Any CPU\r\n` +
            `		{${this.model.codeProjectGuid}}.Release|Any CPU.ActiveCfg = Release|Any CPU\r\n` +
            `		{${this.model.codeProjectGuid}}.Release|Any CPU.Build.0 = Release|Any CPU\r\n` +
            `		{${this.model.tdsProjectGuid}}.Debug|Any CPU.ActiveCfg = Debug|Any CPU\r\n` +
            `		{${this.model.tdsProjectGuid}}.Debug|Any CPU.Build.0 = Debug|Any CPU\r\n` +
            `		{${this.model.tdsProjectGuid}}.Debug|Any CPU.Deploy.0 = Debug|Any CPU\r\n` +
            `		{${this.model.tdsProjectGuid}}.Release|Any CPU.ActiveCfg = Release|Any CPU\r\n` +
            `		{${this.model.tdsProjectGuid}}.Release|Any CPU.Build.0 = Release|Any CPU\r\n` +
            `		{${this.model.tdsProjectGuid}}.Release|Any CPU.Deploy.0 = Release|Any CPU`;

        slnText = this._ensureSolutionFolder(slnText, "Feature");
        let layerFolderGuid = this._getSolutionFolderGuid(slnText, "Feature");

        let projectNesting =
            `		{${this.model.codeProjectGuid}} = {${featureFolderGuid}}\r\n` +
            `		{${featureFolderGuid}} = {${layerFolderGuid}}\r\n` +
            `		{${this.model.tdsProjectGuid}} = {${featureFolderGuid}}`;

        slnText = slnText.replace(/\r\nMinimumVisualStudioVersion[^\r\n]*\r\n/, `$&${projectDefinition}\r\n`);
        slnText = slnText.replace(/\r\n[^\r\n]*GlobalSection\(ProjectConfigurationPlatforms\)[^\r\n]*\r\n/, `$&${projectBuildConfig}\r\n`);
        slnText = slnText.replace(/\r\n[^\r\n]*GlobalSection\(NestedProjects\)[^\r\n]*\r\n/, `$&${projectNesting}\r\n`);

        this.fs.write(slnFilePath, slnText);
    }

    _ensureSolutionSection(slnText, name, ordering) {
        if(slnText.indexOf(`GlobalSection(${name})` == -1)) {
            let sectionText =
                `	GlobalSection(${name}) = ${ordering}\r\n` +
                `	EndGlobalSection`;

            slnText = slnText.replace(/\r\nGlobal\s*\r\n/, `$&${sectionText}\r\n`);
        }

        return slnText;
    }

    _ensureSolutionFolder(slnText, folderName) {
        let folderGuid = this._getSolutionFolderGuid(slnText, folderName);
        
        if (!folderGuid) {
            folderGuid = UUID();
            
            let folderDefinition = 
                `Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "${folderName}", "${folderName}", "{${folderGuid}}"\r\n` +
                `EndProject`
            
            slnText = slnText.replace(/\r\nMinimumVisualStudioVersion[^\r\n]*\r\n/, `$&${folderDefinition}\r\n`);
        }

        return slnText;
    }

    _getSolutionFolderGuid(slnText, folderName) {
        let regex = new RegExp(`Project\\("{2150E333-8FDC-42A3-9474-1A3956D46DE8}"\\) = "[0-9\. ]*${folderName}", "[0-9\. ]*${folderName}", "{(.+)}"`);
        let matches = slnText.match(regex);

        return matches && matches[1];
    }

    _modifyAvailableRenderings() {
        let paths =
            glob.sync("**/Presentation/Available Renderings/Page Content.item")
                .map(p => this.destinationPath(p));

        if(!paths || paths.length === 0) {
            console.log(chalk.bold.yellow("An 'available renerings' serialized item was not found."));
            console.log(chalk.bold.yellow("If you want new components to be added to the toolbox automatically, add the following item to one of your TDS projects:"));
            console.log(chalk.bold.blue(`    /sitecore/content/${this.model.tenantFolderName}/Shared/Presentation/Available Renderings/Page Content`));
            console.log();
            return;
        }

        for (let path of paths) {
            let itemText = this.fs.read(path);
            let lines = itemText.split('\r\n');
            
            let changed = false;

            for(let i = 0; i < lines.length; i++) {
                if(lines[i] === 'field: {715AE6C0-71C8-4744-AB4F-65362D20AD65}') {
                    lines[i + 5] += `|{${this.model.renderingItemGuid}}`;
                    lines[i + 3] = lines[i + 3].replace(/[0-9]+/, lines[i + 5].length);
                    
                    changed = true;
                    
                    break;
                }
            }

            if (changed) {
                this.fs.write(path, lines.join('\r\n'));
            }
        }
    }

    _getSlnFilePath() {
        let slnFile =
            fs.readdirSync(this.destinationPath())
                .find(_ => _.endsWith('.sln'));

        return slnFile && path.join(this.destinationPath(), slnFile);
    }

    _pascalToHyphen(str) {
        return str
            .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1-$2')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .toLowerCase()
            .trim();
    }
};
