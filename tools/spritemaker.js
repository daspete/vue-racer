import imageDataURI from 'image-data-uri'
import fs from 'fs'



class SpriteMaker {
    constructor(settings) {
        this.settings = settings;

        this.files = []
        this.sprites = {}

        this.Start()
    }

    async Start() {
        this.files = this.ScanDir(this.settings.spriteDirectory)

        await this.ConvertImages(this.files)
    }

    async ConvertImages(files){
        let sprites = {}

        for(let i = 0; i < files.length; i++){
            try {
                let spritemapName = files[i].path.split('/').slice(-2)[0]
                let spriteName = files[i].filename.split('.').slice(0, -1).join('.')
                
                let sprite = await this.Convert(files[i].path + files[i].filename)

                if(typeof sprites[spritemapName] === 'undefined'){
                    sprites[spritemapName] = {}
                }

                sprites[spritemapName][spriteName] = sprite
            }catch(err){
                console.log(err)
            }
        }

        await fs.writeFileSync('./src/sprites/spritesheet.json', JSON.stringify(sprites))
    }

    async Convert(path) {
        return await imageDataURI.encodeFromFile(path)
    }

    ScanDir(dir, filelist) {
        let files = fs.readdirSync(dir);

        filelist = filelist || [];
        
        files.forEach((file) => {
            if (fs.statSync(dir + file).isDirectory()) {
                filelist = this.ScanDir(dir + file + '/', filelist);
            }
            else {
                filelist.push({
                    path: dir,
                    filename: file
                });
            }
        });
        return filelist;
    }
}

let spriteMaker = new SpriteMaker({
    spriteDirectory: './src/assets/'
})