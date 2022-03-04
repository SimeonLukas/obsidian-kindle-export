import KindlePlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class KindleSettingTab extends PluginSettingTab {
  plugin: KindlePlugin;

  constructor(app: App, plugin: KindlePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h1", { text: "Kindle Settings" });
    containerEl.createEl("p", { text: "Set your data for your Kindle. Use your Mailadress wich is approved by Amazon." });


    new Setting(containerEl)
      .setName("Author")
      .setDesc("Default author for new documents")
      .addText((text) =>
        text
          .setPlaceholder("Obsidian")
          .setValue(this.plugin.settings.author)
          .onChange(async (value) => {
            this.plugin.settings.author = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );

      new Setting(containerEl)
      .setName("Email")
      .setDesc("Approved Email for your Kindle")
      .addText((text) =>
        text
          .setPlaceholder("you@obsidian.md")
          .setValue(this.plugin.settings.sendmail)	
          .onChange(async (value) => {
            this.plugin.settings.sendmail = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );

      new Setting(containerEl)
      .setName("Kindle Email")
      .setDesc("Your Kindle Email")
      .addText((text) =>
        text
          .setPlaceholder("you@kindle.com")
          .setValue(this.plugin.settings.kindlemail)
          .onChange(async (value) => {
            this.plugin.settings.kindlemail = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );

      new Setting(containerEl)
      .setName("SMTP Host")
      .setDesc("Your SMTP Host (e.g. smtp.gmail.com)")
      .addText((text) =>
        text
          .setPlaceholder("smtp.obsidian.md")
          .setValue(this.plugin.settings.smtphost)
          .onChange(async (value) => {
            this.plugin.settings.smtphost = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );

      new Setting(containerEl)
      .setName("SMTP Port")
      .setDesc("Your SMTP Port (e.g. 587)")
      .addText((text) =>
        text
          .setPlaceholder("465")
          .setValue(this.plugin.settings.port)
          .onChange(async (value) => {
            this.plugin.settings.port = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );
      new Setting(containerEl)
      .setName("SMTP User")
      .setDesc("Username for your SMTP Server e.g. your Mailadress")
      .addText((text) =>
        text
          .setPlaceholder("you@obsidian.md")
          .setValue(this.plugin.settings.user)
          .onChange(async (value) => {
            this.plugin.settings.user = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );



      new Setting(containerEl)
      .setName("SMTP Password")
      .setDesc("Your SMTP Password")
      .addText((text) =>
        text
          .setPlaceholder("********")
          .setValue(this.plugin.settings.pass)
          .onChange(async (value) => {
            this.plugin.settings.pass = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );

      new Setting(containerEl)
      .setName("Backend")
      .setDesc("Your Backendadress (e.g. https://staneks.de/apps/md2mobi/) can be used for free or host your own Backend.")
      .addText((text) =>
        text
          .setPlaceholder("https://ob2ki.com")
          .setValue(this.plugin.settings.backend)
          .onChange(async (value) => {
            this.plugin.settings.backend = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );
      containerEl.createEl("hr");
      containerEl.createEl("p", { text: "Host your own Obsidian2Kindle-Converter."});
      containerEl.createEl("a", { text: "Fork from Github 🔗", href: "https://github.com/SimeonLukas/Obsidian2Kindle"});
      containerEl.createEl("hr");
      containerEl.createEl("h1", { text: "⏳Beta Settings" });
      
      new Setting(containerEl)
      .setName("Generate TOC")
      .setDesc("Generate Table of Contents. This is a beta feature and may not work correctly.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.toc)
          .onChange(async (value) => {
            this.plugin.settings.toc = value;
            await this.plugin.saveSettings();
            console.log(this.plugin.settings);
          })
      );



          
    }
    }