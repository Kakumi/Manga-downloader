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

    async search(manga: string): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];
        const mangaFormatted = this.formatUrl(manga);
        
        const categories: string[] = [];
        const autheurs: string[] = [];
        var track: string = this.getLink();
        var source: string = this.getName();
        var thumbnail: string = "/";
        var link: string = "https://www.scan-fr.cc/manga/" + mangaFormatted;
        var title: string = "/";
        var description: string = "/";
        var status: string = "/";
        var date: string = "/";

        try {
            this.getLoger().info("Searching on " + link + "...", this.getName());
            const response = await got(link);
            if (response.statusCode === 200) {
                const $ = cheerio.load(response.body);
                
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
                    track, source, thumbnail, link, title, description, categories, status, autheurs, date
                ));

                this.getLoger().info("Search done ! Success !", this.getName());
            } else {
                this.getLoger().warn("Search done ! Response code is not 200 ! (" + response.statusCode + ")", this.getName());
            }
        } catch(e) {
            this.getLoger().error(e.message, this.getName());
        } finally {
            return Promise.resolve(data);
        }
    }

    async getChapters(mangaDetails: MangaDetails): Promise<MangaChapter[]> {
        const data: MangaChapter[] = [];

        this.getLoger().info("Loading chapters list...", this.getName());
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

            this.getLoger().info("Getting chapters list done !", this.getName());
        } else {
            this.getLoger().info("Getting chapters list failed ! Response code is not 200 ! (" + response.statusCode + ")", this.getName());
        }

        return Promise.resolve(data);
    }

    async downloadChapters(mangaChapter: MangaChapter): Promise<string[]> {
        const data: string[] = [];

        this.getLoger().info("Loading chapter...", this.getName());
        const response = await got(mangaChapter.link);
        if (response.statusCode === 200) {
            const $ = cheerio.load(response.body);

            await $("#all img").each((i: Number, elem: any) => {
                this.getLoger().info("Loading image " + elem.attribs.src + "...", this.getName());
                data.push(elem.attribs["data-src"]);
            });

            this.getLoger().info("Getting chapter done !", this.getName());
        } else {
            this.getLoger().info("Getting chapter failed ! Response code is not 200 ! (" + response.statusCode + ")", this.getName());
        }

        return Promise.resolve(data);
    }
}

module.exports.class = new ScanFr();