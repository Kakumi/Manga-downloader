var fs = require('fs');
const FOLDER = "data";
const cliProgress = require('cli-progress');
var cliColor = require("cli-color");
const fetch = require('node-fetch');
const LogerUtils = require('../utils/loger');
const loger = new LogerUtils();
import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

//Import modules
const ScanFr = require('./scanfr');
const NiaddFr = require('./niadd.fr');
const MangakakalotEn = require('./mangakakalot.en');

const services: MainClass[] = [
    ScanFr.class,
    NiaddFr.class,
    //MangakakalotEn.class
];

module.exports.search = async function load(manga: string): Promise<MangaDetails[]> {
    const bar = getBar();
    bar.start(services.length, 0);

    const data: MangaDetails[] = [];
    var mangaDetails: MangaDetails;
    var serviceLoaded = 0;

    for(var service of services) {
        const mangasDetails = await service.getMangas(manga);

        for(mangaDetails of mangasDetails) {
            data.push(mangaDetails);
        }

        bar.update(++serviceLoaded);
    }

    bar.stop()

    createFolder();

    var json = JSON.stringify(data);
    fs.writeFile(FOLDER + '/' + manga.trim().replace(" ", "-") + '.json', json, function readFileCallback(err: any) {
        if (err) {
            loger.error(err.message);
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
    const bar = getBar();

    const service = services.find(s => s.getName() == mangaDetails.source);
    
    return new Promise(async(resolve, reject) => {
        if (service !== undefined) {
            var nbImageDownloaded = 0;
            var filePath;
            var extension;

            const mainFolder = "downloads";
            var mangaName = formatForWindows(mangaDetails.title);
            var chapterName = formatForWindows(mangaChapter.number);
            const folder = `${mainFolder}/${mangaName}/${chapterName}`;

            await createDownloadFolder(folder);

            const data = await service.getChaptersImages(mangaChapter);
            bar.start(data.length, 0);

            for(var imgUrl of data) {
                extension = imgUrl.replace(/.+\./gmi, "");
                filePath = `${folder}/${nbImageDownloaded + 1}.${extension}`;
                loger.info(`Downloading ${imgUrl} to ${filePath}...`, service.getName());
                await download(imgUrl, filePath);
                bar.update(++nbImageDownloaded);
            }

            loger.info(`Download finished !`, service.getName());
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

function formatForWindows(text: string): string {
    var textFormatted = text.trim().toLowerCase();
    textFormatted = textFormatted.replace(/</gmi, "-");
    textFormatted = textFormatted.replace(/>/gmi, "-");
    textFormatted = textFormatted.replace(/:/gmi, "-");
    textFormatted = textFormatted.replace(/\|/gmi, "-");
    textFormatted = textFormatted.replace(/\?/gmi, "-");
    textFormatted = textFormatted.replace(/\*/gmi, "-");
    textFormatted = textFormatted.replace(/\./gmi, "-");

    return textFormatted;
}

async function download(url: string, filepath: string) {
    const response = await fetch(url);
    const buffer = await response.buffer();

    if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (err) => {
            if (err) loger.error(err.message);
        });
    }
    
    fs.writeFile(filepath, buffer, (err) => {
        if (err) loger.error(err.message);
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