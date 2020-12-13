const cheerio = require('cheerio');
const got = require('got');

import { MangaDetails } from "../models/mangaDetails";
import { MangaChapter } from "../models/mangaChapter";
import { MainClass } from "../models/sourceModel";

class NiaddFr extends MainClass {
    getName(): string {
        return "Niadd (FR)";
    }

    getLink(): string {
        return "https://fr.niadd.com";
    }

    formatUrl(manga: string): string {
        return manga.trim().toLowerCase().replace(/\s/gmi, "+");
    }

    getSearchLink(mangaName: string): string {
        const mangaFormatted = this.formatUrl(mangaName);

        return "https://fr.niadd.com/search/?search_type=1&name=" + mangaFormatted;
    }

    async searchMangas(searchedLink: string, $: any): Promise<MangaDetails[]> {
        var data: MangaDetails[] = [];

        const track: string = this.getLink();
        const source: string = this.getName();

        const mangas = await $('.manga-list .manga-item .manga-content tbody tr');
        for(var i = 0; i < mangas.length; i++) {
            var mangaFound = mangas.get(i);

            var link: string;
            var chapterLink: string;
            var thumbnail: string = "/";
            var title: string = "/";
            var description: string = "/";
            var status: string = "/";
            var date: string = "/";
            var categories: string[] = [];
            var autheurs: string[] = [];

            link = mangaFound.children[1].children[1].attribs.href;
            chapterLink = link.replace(".html", "/chapters.html");

            var responseManga = await got(link);
            if (responseManga.statusCode === 200) {
                const $ = cheerio.load(responseManga.body);

                await $('.book-headline-content .book-status').each((i: Number, elem: any) => {
                    status = elem.children[0].data.replace('(', '').replace(')', '').trim();
                });

                await $('.book-info-parts .bookside-img-box .bookside-img img').each((i: Number, elem: any) => {
                    thumbnail = elem.attribs.src;
                });

                await $('.book-headline-name').each((i: Number, elem: any) => {
                    title = elem.children[0].data.trim();
                });

                await $('.detail-synopsis').each((i: Number, elem: any) => {
                    description = elem.children[0].data.trim();
                });

                await $('.bookside-bookinfo div:not(.bookside-bookinfo-title)').each((i: Number, elem: any) => {
                    var keyword: string = elem.children[1].children[0].data.trim().toLowerCase();

                    if (keyword.includes("auteur")) {
                        for(var author of elem.children[3].children[0].children[0].data.split(',')) {
                            autheurs.push(author.trim());
                        }
                    }

                    if (keyword.includes("released")) {
                        date = elem.children[3].children[0].children[0].data;
                    }

                    if (keyword.includes("genre")) {
                        for(var catObject of elem.children[3].children) {
                            if (catObject.name === 'a') {
                                categories.push(catObject.children[0].children[0].data.replace(",", "").trim());
                            }
                        }
                    }
                });
            }

            data.push(new MangaDetails(
                track, source, thumbnail, link, chapterLink, title, description, categories, status, autheurs, date
            ));
        }

        return Promise.resolve(data);
    }

    async searchChapters(searchedLink: string, $: any): Promise<MangaChapter[]> {
        const data: MangaChapter[] = [];

        await $('.bookinfo-main-part .chapter-list a').each((i: Number, elem: any) => {
            data.push(new MangaChapter(
                elem.attribs.title,
                "/",
                this.getLink() + elem.attribs.href
            ));
        });

        return Promise.resolve(data);
    }

    async searchChapterImages(searchedLink: string, $: any): Promise<string[]> {
        const images: string[] = [];

        const listPages = await $(".mangaread-top .chp-page-selection + .chp-selection-list div");
        for(var i = 0; i < listPages.length; i++) {
            var pageFound = listPages.get(i);

            var responseChapter = await got(this.getLink() + pageFound.attribs["option_val"]);
            if (responseChapter.statusCode === 200) {
                $ = cheerio.load(responseChapter.body);

                $("img.manga_pic").each((i: Number, elem: any) => {
                    images.push(elem.attribs.src);
                });
            }
        }

        return Promise.resolve(images);
    }
}

module.exports.class = new NiaddFr();