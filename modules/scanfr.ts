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
        return "https://www.scan-fr.cc";
    }

    getSearchLink(mangaName: string): string {
        const mangaFormatted = this.formatUrl(mangaName);

        return "https://www.scan-fr.cc/manga/" + mangaFormatted;
    }

    async searchMangas(searchedLink: string, $: any): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];

        var track: string = this.getLink();
        var source: string = this.getName();

        var link: string = searchedLink;
        var chapterLink: string = searchedLink;
        var thumbnail: string = "/";
        var title: string = "/";
        var description: string = "/";
        var status: string = "/";
        var date: string = "/";
        const categories: string[] = [];
        const autheurs: string[] = [];

        await $('dl.dl-horizontal').each((i, elem) => {
            var keyword = "";
            for(var iInfo = 0; iInfo < elem.children.length && elem.children[iInfo].name != 'br'; iInfo++) {
                //Signifie un espace
                if (iInfo % 2 !== 0) {
                    //Signifie un "dd"
                    if ((iInfo + 1) % 4 === 0) {
                        if (keyword.includes("statut")) {
                            status = elem.children[iInfo].children[1].children[0].data;
                        }

                        if (keyword.includes("auteur")) {
                            autheurs.push(elem.children[iInfo].children[1].children[0].data);
                        }

                        if (keyword.includes("catégorie")) {
                            categories.push(elem.children[iInfo].children[1].children[0].data);
                        }

                        if (keyword.includes("date de sortie")) {
                            date = elem.children[iInfo].children[0].data;
                        }
                    } else { //Signifie un "dt"
                        keyword = elem.children[iInfo].children[0].data.toLowerCase();
                    }
                }
            }
        });

        await $('.container-fluid .row:nth-child(2)').each((i: Number, elem: any) => {
            const mangaDetails = elem.children[1];
            const mangaDescription = elem.children[5]

            title = mangaDetails.children[1].children[0].data;
            thumbnail = mangaDetails.children[5].children[1].children[1].children[1].attribs.src;
            description = mangaDescription.children[1].children[1].children[3].children[0].data;
            
        });

        data.push(new MangaDetails(
            track, source, thumbnail, link, chapterLink, title, description, categories, status, autheurs, date
        ));

        return Promise.resolve(data);
    }

    async searchChapters(searchedLink: string, $: any): Promise<MangaChapter[]> {
        const data: MangaChapter[] = [];

        await $('ul.chapters888 li h5').each((i: Number, elem: any) => {
            data.push(new MangaChapter(
                elem.children[1].children[0].data.trim(),
                elem.children[3].children[0] != undefined ? elem.children[3].children[0].data.trim() : "/",
                elem.children[1].attribs.href
            ));
        });

        return Promise.resolve(data);
    }

    async searchChapterImages(searchedLink: string, $: any): Promise<string[]> {
        const images: string[] = [];

        await $("#all img").each((i: Number, elem: any) => {
            images.push(elem.attribs["data-src"]);
        });

        return Promise.resolve(images);
    }
}

module.exports.class = new ScanFr();