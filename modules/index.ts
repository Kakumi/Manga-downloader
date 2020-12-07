var fs = require('fs');
const FOLDER = "data";
const cliProgress = require('cli-progress');
import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

//Import modules
const ScanFr = require('./scanfr');

const services: MainClass[] = [
    ScanFr.class
];

module.exports.search = async function load(manga: string): Promise<MangaDetails[]> {
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
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
    const data: MangaChapter[] = [];

    const service = services.find(s => s.getName() == mangaDetails.source);
    
    if (service !== undefined) {
        const mangaChapters = await service.getChapters(mangaDetails);
        for(var chapter of mangaChapters) {
            data.push(chapter);
        }
    }

    return Promise.resolve(data);
}

module.exports.downloadChapters = async function load(mangaDetails: MangaDetails, mangaChapter: MangaChapter): Promise<boolean> {
    const service = services.find(s => s.getName() == mangaDetails.source);
    
    return new Promise(async(resolve, reject) => {
        if (service !== undefined) {
            const mangaChapters = await service.downloadChapters(mangaChapter);
    
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