<template>
    <div class="game-container" :style="gameContainerStyles">
        <div class="game" :style="gameStyles">
            <canvas ref="gamecanvas"></canvas>
        </div>
        <div class="speedometer">
            <div class="speedometer__needle" :style="speedometerStyles"></div>
            <div class="speedometer__speed">{{ speed }}</div>
        </div>
        <div class="track-progress">
            <div class="track-progress__line" :style="trackProgressStyles"></div>
        </div>
        <!-- {{ parseInt(stats.position) }} / {{ parseInt(stats.trackLength) }} -->
    </div>
    
</template>

<style lang="scss">
body {
    padding: 0;
    margin: 0;
    font-family: Arial, Helvetica, sans-serif
}
.game-container {
    margin: 50px auto;
    position: relative;
}
.game {
    margin: 0 auto;
    background-color: black;
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
}

.track-progress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;

    &__line {
        width: 0;
        height: 4px;
        background-color: yellowgreen
    }
}

.speedometer {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 200px;
    height: 200px;
    background-color: #131313;
    border-radius: 100px;
    box-shadow: 0 0 8px rgba(0,0,0,1);

    &__needle {
        position: absolute;
        top: 100px;
        left: 10px;
        width: 90px;
        height: 4px;
        background-color: red;
    }

    &__speed {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        font-size: 24px;
        font-weight: 700;
        color: white;
        text-align: center
    }
}
</style>


<script>

import Renderer from '../classes/Renderer'
import Track from '../classes/Track'
import Game from '../classes/Game'
import settings from '../config/settings'


export default {

    data(){
        return {
            stats: {
                speed: 0,
                maxSpeed: 0,
                lapTime: 0,
                bestLapTime: 0,
                position: 0,
                trackLength: 0 
            }
        }
    },

    mounted(){
        this.canvas = this.$refs.gamecanvas
        this.canvas.width = settings.width
        this.canvas.height = settings.height

        this.ctx = this.canvas.getContext('2d')

        this.renderer = new Renderer({
            canvas: this.canvas,
            ctx: this.ctx
        })

        this.track = new Track()

        this.game = new Game({
            renderer: this.renderer,
            track: this.track,
            stats: this.stats
        })

        this.game.Start()
    },

    computed: {
        gameContainerStyles(){
            return {
                width: `${ settings.width }px`,
                height: `calc(100vh - 100px)`
            }
        },
        gameStyles(){
            return {
                width: `${ settings.width }px`,
                height: `${ settings.height }px`,
            }
        },

        speedometerStyles(){
            let speed = this.stats.speed * 0.02
            let maxSpeed = this.stats.maxSpeed * 0.02
            let rotation = 0
            let startRotation = -50
            let maxRotation = 280

            if(maxSpeed > 0){
                rotation = startRotation + maxRotation * (speed / maxSpeed)
            }
            
            return {
                transformOrigin: '100% 50%',
                transform: `rotate(${rotation}deg)`
            }
        },

        trackProgressStyles(){
            return {
                width: `${ this.stats.position / this.stats.trackLength * 100 }%`
            }
        },
        
        speed(){
            return parseInt(this.stats.speed * 0.02)
        }
    }

}


</script>

