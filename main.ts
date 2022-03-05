import {
	Buffer
} from "./node_modules/buffer";
import {
	Editor,
	Plugin,
} from "obsidian";
import {
	KindleSettingTab
} from "./settings";

interface KindlePluginSettings {
	author: string;
	sendmail: string;
	kindlemail: string;
	port: string;
	host: string;
	pass: string;
}

const DEFAULT_SETTINGS: Partial < KindlePluginSettings > = {

	author: "",
	sendmail: "",
	kindlemail: "",
	port: "",
	smtphost: "",
	pass: "",
	backend: "https://staneks.de/apps/md2mobi/",


};

export default class Kindle extends Plugin {
	settings: KindlePluginSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new KindleSettingTab(this.app, this));

  


		this.addCommand({
			id: 'Export',
			name: 'Export',
			callback: async () => {
        let Inhalt: string = "";
        let imagelist: string[] = [];
        let imagename: string[] = [];
		let lang = localStorage.getItem("language");
        let dokument = this.app.workspace.getActiveFile();
        let data = await this.app.vault.read(dokument)
        let lines = data.split("\n")
        let result = await this.GetEbook(lines, Inhalt, imagelist, imagename);
        Inhalt = result.Inhalt;
        imagelist = result.imagelist;
        imagename = result.imagename;
				let datei = this.app.workspace.getActiveFile().basename;
				// Coverbild toDo
				// let cover = this.app.workspace.getActiveFile().parent.path + "/cover.png";
				// let base64cover = "";
				// if (cover != undefined) {
				// 	let coverdata = await this.app.vault.adapter.readBinary(cover);
				// 	base64cover = Buffer.from(coverdata).toString('base64');
				// }
				// else{
				// 	base64cover = "false";
				// }
				let host = this.settings.smtphost;
				let port = this.settings.port;
				let pass = this.settings.pass;
				let kindlemail = this.settings.kindlemail;
				let sendmail = this.settings.sendmail;
				let author = this.settings.author;
				let user = this.settings.user;
				let toc = this.settings.toc;
				let backend = this.settings.backend;
				if (host == "" || port == "" || pass == "" || kindlemail == "" || sendmail == "" || author == "" || user == "" || backend == "") {
					if (lang == "de") {
					new Notice("Bitte geben Sie alle Einstellungen ein.");
					}
					else {
					new Notice("Please fill in the settings!");
					}
					return;
				}
				// console.log(datei);
				if (lang == "de") {
				new Notice('😃 Dein Dokument ' + datei +' wird nun exportiert.');
				}
				else {
				new Notice('😃 Your Note ' + datei + ' is being converted to an ebook');
				}
				var url = this.settings.backend;
				var formData = new FormData();
				for (let i = 0; i < imagelist.length; i++) {
					formData.append('file' + i, imagelist[i]);
				}
				// Coverbild toDo
				// formData.append('cover', base64cover);
				// get language
				formData.append('lang', lang);
				formData.append('Bilder', imagename);
				formData.append('text', Inhalt);
				formData.append('title', datei);
				formData.append('author', author);
				formData.append('email', sendmail);
				formData.append('kindle', kindlemail);
				formData.append('port', port);
				formData.append('host', host);
				formData.append('pass', pass);
				formData.append('user', user);
				formData.append('toc', toc);
				fetch(url, {
						method: 'POST',
						body: formData,
					})
					.then(function (response) {
						return response.text();
					})
					.then(function (body) {
						new Notice(body);
						// console.log(body);
					});
			}
		});

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// console.log(this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

  async GetEbook(lines:string[] , Inhalt:string, imagelist:string[], imagename:string[]){ 
    for (let i = 0; i < lines.length; i++) {
      let text = lines[i];
      if (text.contains("![")) {
          let dateiname = text.match(/!\[\[(.*?)\]\]/);		  
          if (dateiname != null) {
        //   console.log(dateiname[1]);
          let anker = dateiname[1].split("#");
          let files = this.app.vault.getFiles().length;
          for (let i = 0; i < files; i++) {
            let file = this.app.vault.getFiles()[i];
            if (file.name == dateiname[1] && file.extension != "md") {
              let data = await this.app.vault.readBinary(file);
              let base64 = Buffer.from(data).toString('base64');
              imagename.push(file.name);
              imagelist.push(base64);
              Inhalt += '\n<p><img class="image" src="uploads/' + file.name + '"></p>' + '\n';
            //   console.log('Bild wurde hinzugefügt!');
            }
            if (file.name == anker[0] + '.md' || file.name == dateiname[1] + '.md') {
              let data = await this.app.vault.read(file);
              text = Buffer.from(data).toString('utf8');
              for (let i = 1; i < anker.length; i++) {
                if (anker[i] != undefined) {
                  if (anker[i].contains("^")) {
                    let ankercaret = text.indexOf(anker[i]);
                    text = text.substring(0, ankercaret);
                    text = text.substring(text.lastIndexOf("\n"));
                    dateiname[0] = dateiname[0].replace('^', "|");       
                  }
                  else{
                  let pos = text.indexOf(anker[i]);
                  text = text.substring(pos + anker[i].length);
                  let pos2 = text.indexOf('\n#', 30);
                  text = text.substring(0, pos2);
                  }
                }                 
              }
              dateiname[0] = dateiname[0].replace('![[', "").replace(']]', "").replace('#', ">");
              text = '<h3><i>' + dateiname[0] + '</i></h3>\n' + text;
            //   console.log(text);
              let lines2 = text.split("\n");
              let nextmd = await this.GetEbook(lines2, Inhalt, imagelist, imagename);
              Inhalt = nextmd.Inhalt;
            //   console.log('Eingebettetes MD wurde hinzugefügt!');              
            } else {
            //   console.log('Datei nicht gefunden!');
            }
            }
          }
        } else {
          Inhalt += text + '\n';

        }
        
    }
    // console.log(Inhalt);
    return {Inhalt, imagelist, imagename};
    
  }

}
