# Project 2: obsidian-kindle-export 
## An Obsidian-plugin which sends your notes to your Kindle as .mobi file
![](https://github.com/SimeonLukas/obsidian-kindle-export/raw/main/files/screenrecord.gif)
[This is the exported .mobi file](https://github.com/SimeonLukas/obsidian-kindle-export/blob/main/files/Export-Test.mobi)

![](https://github.com/SimeonLukas/obsidian-kindle-export/raw/main/files/ebook.jpg)

### Introduction
I was using Calibre and Pandoc-Export plugin, but I was wondering about a short way to export your .md files in one command and add all embedded files. So you dont have to use a .pdf file. The plugin creates a *Kindle: Export* command, which sends all embedded images and .md files to a PHP backend ([Host your own private PHP Backend!](https://github.com/SimeonLukas/Obsidian2Kindle)) which converts it to a .mobi file and sends it via email to your Kindle. If you are not hosting on your own, you will send private data to my server. Please be aware of this. I won't save or read your data!

### To Do's:
- [x] Export images
- [x] Export embedded .md files
- [x] Obsidian cover for the books
- [x] Table of contents *beta*
- [x] ```<div style="page-break-after: always;"></div>``` is working
- [x] ```%%Excludes%%``` are invisible
- [x] External links
- [x] External embedded images
- [x] Exclude metadata
- [x] Become a Communityplugin 🎉 
 - [x] Create workaround for other embedded files
 - [ ] Add ==highlighting==
- [ ] Foldercover or filecover
- [ ] .html export (Archive)
- [ ] .epub export (Pocketbook)
- [ ] .pdf export (would be nice for IOS & Android)

### Just try it!
For embedding local images, please use the following format:
``` ![[image.jpg]] ```

Fill in your data for your Kindle and your mailadress.
Read your notes on your Kindle.

If you have problems with the plugin, please let me know.

<a href="https://www.buymeacoffee.com/simeonlukas" target="_blank" ><img src="https://github.com/SimeonLukas/obsidian-kindle-export/raw/main/files/coffee.jpg" width="75%"></a>




