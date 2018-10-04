const Util = {
    timestamp(){
        return new Date().getTime()
    },

    toInt(value, _default){
        if(value !== null){
            let _value = parseInt(value, 10)
            if(!isNaN(_value)) return _value
        }

        return Util.toInt(_default, 0)
    },

    toFloat(value, _default){
        if(value !== null){
            let _value = parseFloat(value)
            if(!isNaN(_value)) return _value
        }

        return Util.toFloat(_default, 0.0)
    },

    formatTime(dt){
        let minutes = Math.floor(dt / 60);
        let seconds = Math.floor(dt - (minutes * 60));
        let tenthSeconds = Math.floor(10 * (dt - Math.floor(dt)));

        let _minutes = minutes < 10 ? '0' + minutes : minutes
        let _seconds = seconds < 10 ? '0' + seconds : seconds
        
        return `${minutes > 0 ? _minutes : ''}:${ _seconds }:${ tenthSeconds }`
    },


    limit(value, min, max){
        return Math.max(min, Math.min(value, max))
    },

    randomInt(min, max){
        return Math.round(Util.interpolate(min, max, Math.random()))
    },

    randomFloat(min, max){
        return Util.interpolate(min, max, Math.random())
    },

    randomChoice(options){
        return options[Util.randomInt(0, options.length - 1)]
    },

    percentRemaining(n, total){
        return (n % total) / total
    },

    accelerate(v, accel, dt){
        return v + accel * dt
    },

    interpolate(a, b, percent){
        return a + (b - a) * percent
    },

    easeIn(a, b, percent){
        return a + (b - a) * Math.pow(percent, 2)
    },

    easeOut(a, b, percent){
        return a + (b - a) * (1 - Math.pow(1 - percent, 2))
    },

    easeInOut(a, b, percent){
        return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5)
    },

    exponentialFog(distance, density){
        return 1 / (Math.pow(Math.E, (distance * distance * density)))
    },

    increase(start, increment, max){
        let result = start + increment;

        while (result >= max)
            result -= max;

        while (result < 0)
            result += max;
        
        return result;
    },

    project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth){
        p.camera.x = (p.world.x || 0) - cameraX
        p.camera.y = (p.world.y || 0) - cameraY
        p.camera.z = (p.world.z || 0) - cameraZ

        p.screen.scale = cameraDepth / p.camera.z
        
        p.screen.x = Math.round(width / 2 + (p.screen.scale * p.camera.x  * width / 2))
        p.screen.y = Math.round(height / 2) - (p.screen.scale * p.camera.y  * height / 2)
        p.screen.w = Math.round(p.screen.scale * roadWidth * width / 2)
    },

    overlap(x1, w1, x2, w2, percent){
        var half = (percent || 1) / 2;

        var min1 = x1 - w1 * half;
        var max1 = x1 + w1 * half;
        
        var min2 = x2 - w2 * half;
        var max2 = x2 + w2 * half;
        
        return !(max1 < min2 || min1 > max2);
    }
}

export default Util