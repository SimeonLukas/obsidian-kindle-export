import {
	Buffer
} from "./node_modules/buffer";
import {
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
				let links: Array < string > = [];
				let lang = localStorage.getItem("language");
				let dokument = this.app.workspace.getActiveFile();
				let AllLinks = this.app.fileManager.getAllLinkResolutions();
				for (let i = 0; i < AllLinks.length; i++) {
					if (AllLinks[i].sourceFile.path == dokument.path) {
						links.push(AllLinks[i]);
					}
				}
				let data = await this.app.vault.read(dokument)
				let lines = data.split("\n")
				let result = await this.GetEbook(lines, Inhalt, imagelist, imagename, links);
				Inhalt = result.Inhalt;
				imagelist = result.imagelist;
				imagename = result.imagename;
				let datei = this.app.workspace.getActiveFile().basename;
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
						new Notice("Bitte ergänze die Einstellungen.");
					} else {
						new Notice("Please fill in the settings!");
					}
					return;
				}
				if (lang == "de") {
					new Notice('😃 Dein Dokument ' + datei + ' wird nun exportiert.');
				} else {
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
					});
			}
		});

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async GetEbook(lines: string[], Inhalt: string, imagelist: string[], imagename: string[], links: Array < string > ) {
		for (let i = 0; i < lines.length; i++) {
				let text = lines[i];
				
					if (text.contains('![[') && text.contains(']]') || text.contains('![') && text.contains(')') !&& text.contains('http://') !&& text.contains('https://')) {'))   {
					let LinkFile = links[0];
					let file = LinkFile.resolvedFile;
					links.shift();
				
			
				if (file.extension == "png" || file.extension == "jpg" || file.extension == "jpeg" || file.extension == "gif") {
					let data = await this.app.vault.readBinary(file);
					let base64 = Buffer.from(data).toString('base64');
					imagename.push(file.name);
					imagelist.push(base64);
					Inhalt += '\n<p><img class="image" src="uploads/' + file.name + '"></p>' + '\n';
				}

				if (file.extension == 'md') {
					let links2 : Array < string > = [];		
					let data = await this.app.vault.read(file);
					text = Buffer.from(data).toString('utf8');
					if (text.startsWith('---')) {
						let start = text.indexOf('---');
						let end = text.indexOf('---', start + 3);
						text = text.substring(end + 3);
					}
					let anker = LinkFile.reference.link.split('#');
					
					anker = anker[anker.length - 1];
					
					if (anker != undefined) {
						if (anker.contains("^")) {
							let ankercaret = text.indexOf(anker[i]);
							text = text.substring(0, ankercaret);
							text = text.substring(text.lastIndexOf("\n"));
						} else {
							let pos = text.indexOf(anker);
							if (pos == -1) {
								text = text.substring(pos);
							}else{
							text = text.substring(pos + anker.length);
							}
							let pos2 = text.indexOf('\n#', 30);
							if (pos2 == -1) {
							}
							else{
							text = text.substring(0, pos2);
							}
						}
					}
					text = '<h3><i>' + LinkFile.reference.displayText + '</i></h3>\n' + text;
			
					let AllLinks2 = this.app.fileManager.getAllLinkResolutions();
					for (let i = 0; i < AllLinks2.length; i++) {
						if (AllLinks2[i].sourceFile.path == file.path) {
							links2.push(AllLinks2[i]);
							
						}
					}
					let lines2 = text.split("\n");
				
					let nextmd = await this.GetEbook(lines2, Inhalt, imagelist, imagename, links2);
					Inhalt = nextmd.Inhalt;
					        
				} else {
					
				}

			} else {
				Inhalt += text + "\n";	
			}

		
		}

		return {
			Inhalt,
			imagelist,
			imagename
		};

	}

}