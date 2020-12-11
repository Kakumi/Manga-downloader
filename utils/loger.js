const fs = require('fs');
const FOLDER = "logs";
const FILE = "logs.log";

class Loger {
    constructor(file = FILE, folder = FOLDER) {
        this.file = file;
        this.folder = folder;
    }

    createFolder() {
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder);
            this.info("Folder created");
        }
    }

    archived() {
        if (fs.existsSync(this.folder + "/" + this.file)) {
            let now = new Date();
            let dateFormat = "" + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
            let names = this.file.match(/(.+)\.(.*)/);
            if (names != null && names.length == 3) {
                let fileRenamed = this.folder + '/' + names[1] + "-" + dateFormat;
                let i = 0;
                
                while (fs.existsSync(fileRenamed + "-" + i + "." + names[2])) {
                    i++;
                }

                let thisObject = this;
        
                fs.renameSync(this.folder + '/' + this.file, fileRenamed + "-" + i + "." + names[2], function(err) {
                    if ( err ) thisObject.error(err);
                    else thisObject.info("File renamed");
                });
            } else {
                this.error("File is not correct");
            }
        } else {
            this.error("File can't be archived");
        }
    }

    async log(message, type, module) {
        this.createFolder();

        var moduleName = "";
        if (module != undefined) {
            moduleName = "[" + module + "] ";
        }

        let now = new Date();
        let dateFormat = now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        let messageFile = "[" + dateFormat + "] " + type + ": " + moduleName + message + "\n";

        let thisObject = this;
    
        fs.appendFile(this.folder + "/" + this.file, messageFile, function(err) {
            if (err) thisObject.error(err);
        });
    }

    info(message, module = undefined) { //Message d'information / garder une trace
        this.log(message, "INFO", module);
    }

    error(message, module = undefined) { //Une erreur importante est arrivée
        this.log(message, "ERROR", module);
    }

    warn(message, module = undefined) { //Pas une erreur mais ça ne devrait pas arrivé en temps normal 
        this.log(message, "WARNING", module);
    }
}

module.exports = Loger;