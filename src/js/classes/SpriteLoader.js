class SpriteLoader {
    constructor(){}

    async Load(spritemap){
        let spriteKeys = Object.keys(spritemap);
        let sprites = {};

        for(let i = 0; i < spriteKeys.length; i++){
            sprites[spriteKeys[i]] = await this.LoadImage(spritemap[spriteKeys[i]])
        }

        return sprites
    }

    LoadImage(base64EncodedImageData){
        return new Promise((resolve, reject) => {
            let image = new Image()

            image.onload = () => { resolve(image) }
            image.onerror = () => { resolve(null) }

            image.src = base64EncodedImageData
        })
        
    }
}

export default SpriteLoader