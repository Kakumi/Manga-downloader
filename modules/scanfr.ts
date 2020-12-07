const cheerio = require('cheerio');
const got = require('got');

import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

class ScanFr extends MainClass {
    getName(): string {
        return "Scan-FR (FR)";
    }

    getLink(): string {
        return "https://www.scan-fr.cc/";
    }

    async search(manga: string): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];
        const mangaFormatted = this.formatUrl(manga);
        
        const categories: string[] = [];
        const autheurs: string[] = [];
        var track: string = this.getLink();
        var source: string = this.getName();
        var thumbnail: string;
        var link: string = "https://www.scan-fr.cc/manga/" + mangaFormatted;
        var title: string;
        var description: string;
        var status: string;
        var date: string;

        const response = await got(link);
        if (response.statusCode === 200) {
            const $ = cheerio.load(response.body);

            await $('.container-fluid .row:nth-child(2)').each((i: Number, elem: any) => {
                const mangaDetails = elem.children[1];
                const mangaSpecificDetails = mangaDetails.children[5].children[3].children[1];
                const mangaDescription = elem.children[5]

                title = mangaDetails.children[1].children[0].data;
                thumbnail = mangaDetails.children[5].children[1].children[1].children[1].attribs.src;
                status = mangaSpecificDetails.children[3].children[1].children[0].data;
                autheurs.push(mangaSpecificDetails.children[7].children[1].children[0].data);
                //FIXME Parfois n'existe pas
                //https://www.scan-fr.cc/manga/bleach
                date = mangaSpecificDetails.children[11].children[0].data;
                categories.push(mangaSpecificDetails.children[15].children[1].children[0].data);
                description = mangaDescription.children[1].children[1].children[3].children[0].data;

                data.push(new MangaDetails(
                    track, source, thumbnail, link, title, description, categories, status, autheurs, date
                ));
            });
        }

        return Promise.resolve(data);
    }

    async getChapters(mangaDetails: MangaDetails): Promise<MangaChapter[]> {
        const data: MangaChapter[] = [];

        const response = await got(mangaDetails.link);
        if (response.statusCode === 200) {
            const $ = cheerio.load(response.body);

            await $('ul.chapters888 li h5').each((i: Number, elem: any) => {
                data.push(new MangaChapter(
                    elem.children[1].children[0].data.trim(),
                    elem.children[3].children[0] != undefined ? elem.children[3].children[0].data.trim() : "/",
                    elem.children[1].attribs.href
                ));
            });
        }

        return Promise.resolve(data);
    }

    async downloadChapters(mangaChapter: MangaChapter): Promise<string[]> {
        const data: string[] = [];

        const response = await got(mangaChapter.link);
        if (response.statusCode === 200) {
            const $ = cheerio.load(response.body);

            await $("#all img").each((i: Number, elem: any) => {
                data.push(elem.attribs["data-src"]);
            });
        }

        return Promise.resolve(data);
    }
}

module.exports.class = new ScanFr();