const sources = require('./modules');
var readline = require('readline');
import("./models/mangaDetails");
import { MangaChapter } from "./models/mangaChapter";
import { MangaDetails } from "./models/mangaDetails";

function askQuestion(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(question, ans => {
        rl.close();
        resolve(ans);
    }))
}

function title(title: string) {
    console.log("==========[ " + title + " ]==========");
}

//TODO Faire une boucle
//TODO Faire une histoire de recherche
async function main() {
    do {
        console.clear();
        title("Manga Download");
        var answer: string;
        var choice: number;
        var mangasDetails: MangaDetails[];
        var mangasChapters: MangaChapter[];
        var selectedMangaDetails: MangaDetails;
        var selectedMangaChapter: MangaChapter;
    
        //const NiaddFr = require('./modules/niadd.fr');
        //NiaddFr.class.downloadChapters(new MangaChapter("1", "/", "https://fr.niadd.com/chapter/One_Piece_Chapitre_998/588877/"));
    
        //Sélection du nom du manga
        answer = await askQuestion("Enter the name of the manga you want to download: ");
        var mangaName = answer.trim().toLowerCase();
    
        console.clear();
    
        mangasDetails = await sources.search(mangaName);
    
        //Sélection du service du manga recherché
        title("Select the manga");
        for(var i = 0; i < mangasDetails.length; i++) {
            var details =  mangasDetails[i];
            console.log((i + 1) + ". " + details.title + " (" + details.source + ")");
        }
    
        do {
            choice = Number.parseInt(await askQuestion("Enter number corresponding to the manga: "));
        } while (isNaN(choice) || choice < 1 || choice > mangasDetails.length);
    
        selectedMangaDetails = mangasDetails[choice - 1];
        console.clear();
    
        //Sélection du chapitre
        mangasChapters = await sources.getChapters(selectedMangaDetails);
        if (mangasChapters.length == 0) {
            console.log("Une erreur est survenue avec le chargement des chapitres de ce service !");
        } else {
            //TODO Permettre de choisir plusieurs chapitre
            //TODO Permettre d'annuler
            title("Select the chapter");
            for(var i = 0; i < mangasChapters.length; i++) {
                var detailsChapter =  mangasChapters[i];
                console.log((i + 1) + ". " + detailsChapter.number + ": " + detailsChapter.name );
            }
    
            do {
                //TODO Permettre d'annuler
                choice = Number.parseInt(await askQuestion("Enter number corresponding to the chapter: "));
            } while (isNaN(choice) || choice < 1 || choice > mangasChapters.length);
    
            selectedMangaChapter = mangasChapters[choice - 1];
            console.clear();
        
            //Téléchargement du chapitre
            await sources.downloadChapters(selectedMangaDetails, selectedMangaChapter);
        }

        //Fini
        console.clear();
        answer = await askQuestion("Do you want to continue ? (Y : continue): "); 
    } while(answer.toUpperCase() === "Y")
}

main();