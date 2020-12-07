var fs = require('fs');
const FOLDER = "data";
const cliProgress = require('cli-progress');
var cliColor = require("cli-color");
const fetch = require('node-fetch');
import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

//Import modules
const ScanFr = require('./scanfr');

const services: MainClass[] = [
    ScanFr.class
];

module.exports.search = async function load(manga: string): Promise<MangaDetails[]> {
    const bar = getBar();
    bar.start(services.length, 0);

    const data: MangaDetails[] = [];
    var mangaDetails: MangaDetails;
    var serviceLoaded = 0;

    for(var service of services) {
        const mangasDetails = await service.search(manga);

        for(mangaDetails of mangasDetails) {
            data.push(mangaDetails);
        }

        bar.update(++serviceLoaded);
    }

    bar.stop()

    createFolder();

    var json = JSON.stringify(data);
    fs.writeFile(FOLDER + '/scanfr.json', json, function readFileCallback(err: any) {
        if (err) {
            console.log(err);
        } else {
            //console.log("Data loaded & wrote successful!");
        }
    });

    return Promise.resolve(data);
}

module.exports.getChapters = async function load(mangaDetails: MangaDetails): Promise<MangaChapter[]> {
    var data: MangaChapter[] = [];

    const service = services.find(s => s.getName() == mangaDetails.source);
    
    if (service !== undefined) {
        data = await service.getChapters(mangaDetails);
    }

    return Promise.resolve(data);
}

module.exports.downloadChapters = async function load(mangaDetails: MangaDetails, mangaChapter: MangaChapter): Promise<boolean> {
    //const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    const bar = getBar();
    const service = services.find(s => s.getName() == mangaDetails.source);
    var nbDownloaded = 0;
    
    return new Promise(async(resolve, reject) => {
        if (service !== undefined) {
            const mangaChapters = await service.downloadChapters(mangaChapter);

            const mainFolder = "downloads";
            const mangaName = mangaDetails.title.trim().toLowerCase().replace(/\s/gmi, "-");
            const chapterName = mangaChapter.number.trim().toLowerCase().replace(/\s/gmi, "-");
            const folder = `${mainFolder}/${mangaName}/${chapterName}`;
        
            await createDownloadFolder(folder);

            bar.start(mangaChapters.length, 0);
            for(var img of mangaChapters) {
                await download(img, `${folder}/${nbDownloaded + 1}.jpg`);

                bar.update(++nbDownloaded);
            }
            bar.stop();
    
            resolve(true);
        } else {
            reject("Service not found");
        }
    })
}

function createFolder() {
    if (!fs.existsSync(FOLDER)) {
        fs.mkdirSync(FOLDER);
    }
}

async function download(url: string, filepath: string) {
    const response = await fetch(url);
    const buffer = await response.buffer();

    if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (err) => {
            if (err) throw err;
        });
    }
    
    fs.writeFile(filepath, buffer, (err) => {
        if (err) throw err;
    });
}

async function createDownloadFolder(path: string) {
    const pathCut: string[] = path.split("/");
    if (pathCut.length > 0) {
        var startFolder = "";

        for(var folder of pathCut) {
            if (startFolder !== "") startFolder += "/";
            startFolder += folder;

            if (!fs.existsSync(startFolder)) {
                fs.mkdirSync(startFolder);
            }
        }
    }
}

function getBar() {
    return new cliProgress.SingleBar({
        format: cliColor.cyan('{bar}') + ' | {percentage}% || {value}/{total} || ETA: {eta}s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
}