import settings from '../config/settings'

class Input {
    constructor(){
        this.left = false
        this.right = false
        this.up = false
        this.down = false
    }

    Start(){
        document.addEventListener('keydown', (e) => { this.OnKeyDown(e.keyCode, e) })
        document.addEventListener('keyup', (e) => { this.OnKeyUp(e.keyCode, e) })
    }

    OnKeyDown(key, e){
        if(settings.input.up.indexOf(key) !== -1) this.up = true
        if(settings.input.down.indexOf(key) !== -1) this.down = true
        if(settings.input.left.indexOf(key) !== -1) this.left = true
        if(settings.input.right.indexOf(key) !== -1) this.right = true
    }

    OnKeyUp(key, e){
        if(settings.input.up.indexOf(key) !== -1) this.up = false
        if(settings.input.down.indexOf(key) !== -1) this.down = false
        if(settings.input.left.indexOf(key) !== -1) this.left = false
        if(settings.input.right.indexOf(key) !== -1) this.right = false
    }
}

export default Input