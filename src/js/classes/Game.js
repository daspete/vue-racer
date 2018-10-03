import settings from '../config/settings'
import Util from './helpers/Util'
import Input from './Input'
import SpriteLoader from './SpriteLoader'

import sprites from '../../sprites/spritesheet.json'

class Game {
    constructor(config){
        this.track = config.track
        this.stats = config.stats
        this.renderer = config.renderer
        this.canvas = this.renderer.canvas
        this.ctx = this.renderer.ctx

        this.input = new Input()
        this.loader = new SpriteLoader()

        this.camera = {
            depth: 0,
            height: 1000,
            distance: 300,
            fov: 100,
            resolution: 1
        }
        this.camera.depth = 1 / Math.tan((this.camera.fov / 2) * Math.PI / 180)

        this.player = {
            speed: 0,
            trackPosition: 0,
            position: {
                x: 0,
                y: 0,
                z: 0
            }
        }

        this.maxSpeed = this.track.segmentLength / settings.timing.tick
        this.acceleration = this.maxSpeed * 0.2
        this.deceleration = -this.maxSpeed * 0.2
        this.break = -this.maxSpeed
        this.offroadDeceleration = -this.maxSpeed * 0.5
        this.offroadMaxSpeed = this.maxSpeed * 0.25
        this.trackLength = 0
        this.centrifugalForce = 0.3
        this.fogDensity = 5
        this.roadWidth = 2000

        this.maxCars = 100

        this.cars = []
    }

    async LoadSprites(){
        this.sprites = {
            player: await this.loader.Load(sprites.player)
        }
    }

    async Start(){
        await this.LoadSprites()

        console.log('START GAME')
        this.Reset()
        this.input.Start()

        let now = null
        let last = Util.timestamp()

        let dt = 0
        let gdt = 0

        let loop = () => {
            now = Util.timestamp()
            dt = Math.min(1, (now - last) / 1000)
            gdt += dt

            while(gdt > settings.timing.tick){
                gdt -= settings.timing.tick
                this.Update(settings.timing.tick)
            }

            this.Render()
            this.UpdateStats()

            last = now

            requestAnimationFrame(loop, this.renderer.canvas)
        }

        loop()


    }

    UpdateStats(){
        this.stats.speed = this.player.speed
        this.stats.position = this.player.trackPosition
        this.stats.trackLength = this.trackLength
        this.stats.maxSpeed = this.maxSpeed
    }

    Update(dt){
        let playerSegment = this.track.FindSegment(this.player.trackPosition + this.player.position.z)
        let speedPercent = this.player.speed / this.maxSpeed
        let dx = dt * 2 * speedPercent
        let playerWidth = 200 * (0.2 * 1 / 180)

        let startPos = this.player.trackPosition

        this.UpdateCars(dt, playerSegment, playerWidth)

        this.player.trackPosition = Util.increase(this.player.trackPosition, dt * this.player.speed, this.trackLength)

        if(this.input.left){
            this.player.position.x -= dx
        }else if(this.input.right){
            this.player.position.x += dx
        }

        this.player.position.x -= dx * speedPercent * playerSegment.curve * this.centrifugalForce

        if(this.input.up){
            this.player.speed = Util.accelerate(this.player.speed, this.acceleration, dt)
        }else if(this.input.down){
            this.player.speed = Util.accelerate(this.player.speed, this.break, dt)
        }else{
            this.player.speed = Util.accelerate(this.player.speed, this.deceleration, dt)
        }

        if(this.player.position.x < -1 || this.player.position.x > 1){
            if(this.player.speed > this.offroadMaxSpeed){
                this.player.speed = Util.accelerate(this.player.speed, this.offroadDeceleration, dt)
            }

            // TODO: COLLISION DETECTION WITH LANDSCAPE
        }

        // TODO: COLLISION DETECTION WITH CARS

        this.player.position.x = Util.limit(this.player.position.x, -3, 3)
        this.player.speed = Util.limit(this.player.speed, 0, this.maxSpeed)

        if(this.player.trackPosition > this.player.position.z){
            // TODO: TIME TRACKING
        }
    }

    UpdateCars(dt, playerSegment, playerW){
        let car;
        let oldSegment;
        let newSegment;

        for(let n = 0; n < this.cars.length; n++){
            car = this.cars[n]

            oldSegment = this.track.FindSegment(car.z)
            
            car.dir = this.UpdateCarOffset(car, n, oldSegment, playerSegment, playerW)
            car.offset += car.dir
            car.z = Util.increase(car.z, dt * car.speed, this.trackLength)
            car.percent = Util.percentRemaining(car.z, this.track.segmentLength)

            newSegment = this.track.FindSegment(car.z)
            
            if(oldSegment != newSegment){
                let index = oldSegment.cars.indexOf(car)
                oldSegment.cars.splice(index, 1)
                newSegment.cars.push(car)
            }
        }
    }

    UpdateCarOffset(car, index, carSegment, playerSegment, playerW){
        let lookAhead = 20
        let carWidth = 200 * (0.2 * 1 / 180)
        let dir;
        let i;
        let j;
        let otherCar;
        let otherCarWidth;
        let segment;

        // don't do anything when the car is invisible
        if(carSegment.index - playerSegment.index > this.camera.distance) return 0

        for(i = 0; i < lookAhead; i++){
            segment = this.track.segments[(carSegment.index + i) % this.track.segments.length]

            if(segment === playerSegment && car.speed > this.player.speed && Util.overlap(this.player.position.x, playerW, car.offset, carWidth, 1.2)){
                if(this.player.position.x > 0.5){
                    dir = -1
                    
                }else if(this.player.position.x < -0.5){
                    dir = 1
                }else {
                    dir = car.offset > this.player.position.x ? 1 : -1
                }

                return dir * 1 / i * (car.speed - this.player.speed) / this.maxSpeed
            }

            for(j = 0; j < segment.cars.length; j++){
                otherCar = segment.cars[j]
                otherCarWidth = playerW

                if(car.speed > otherCar.speed && Util.overlap(car.offset, carWidth, otherCar.offset, otherCarWidth, 1.2)){
                    if(otherCar.offset > 0.5){
                        dir = -1
                    }else if(otherCar.offset < -0.5){
                        dir = 1
                    }else {
                        dir = car.offset > otherCar.offset ? 1 : -1
                    }

    
                    return dir * 1 / i * (car.speed - otherCar.speed) / this.maxSpeed
                }
            }
        }

        if(car.offset < -0.9){
            return 0.1
        }else if(car.offset > 0.9){
            return -0.1
        }

        return 0
    }

    Render(){
        let baseSegment = this.track.FindSegment(this.player.trackPosition)
        let basePercent = Util.percentRemaining(this.player.trackPosition, this.track.segmentLength)
        let playerSegment = this.track.FindSegment(this.player.trackPosition + this.player.position.z)
        let playerPercent = Util.percentRemaining(this.player.trackPosition + this.player.position.z, this.track.segmentLength)
        
        this.player.position.y = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent)
        let maxY = settings.height

        let x = 0
        let dx = -(baseSegment.curve * basePercent)

        this.renderer.Clear()
        this.renderer.DrawBackground()
        

        let i, n, segment, car, sprite, spriteScale, spriteX, spriteY, currentCarSprite

        for(n = 0; n < this.camera.distance; n++){
            segment = this.track.segments[(baseSegment.index + n) % this.track.segments.length]
            segment.looped = segment.index < baseSegment.index
            segment.fog = Util.exponentialFog(n / this.camera.distance, this.fogDensity)
            segment.clip = maxY

            Util.project(
                segment.p1, 
                this.player.position.x * this.roadWidth - x, 
                this.player.position.y + this.camera.height, 
                this.player.trackPosition - (segment.looped ? this.trackLength : 0),
                this.camera.depth,
                settings.width,
                settings.height,
                this.roadWidth
            )

            Util.project(
                segment.p2, 
                this.player.position.x * this.roadWidth - x - dx, 
                this.player.position.y + this.camera.height, 
                this.player.trackPosition - (segment.looped ? this.trackLength : 0),
                this.camera.depth,
                settings.width,
                settings.height,
                this.roadWidth
            )

            x += dx
            dx += segment.curve

            if(segment.p1.camera.z <= this.camera.depth || segment.p2.screen.y >= segment.p1.screen.y || segment.p2.screen.y >= maxY){
                continue
            }

            this.renderer.DrawSegment(
                settings.width,
                settings.road.lanes,
                {
                    x: segment.p1.screen.x,
                    y: segment.p1.screen.y,
                    pWidth: segment.p1.screen.w
                },
                {
                    x: segment.p2.screen.x,
                    y: segment.p2.screen.y,
                    pWidth: segment.p2.screen.w
                },
                segment.fog,
                segment.colors
            )

            maxY = segment.p1.screen.y
        }




        for(n = this.camera.distance - 1; n > 0; n--){
            segment = this.track.segments[(baseSegment.index + n) % this.track.segments.length]

            // TODO: render cars and environment sprites


            for(i = 0; i < segment.cars.length; i++){
                car = segment.cars[i]
                sprite = car.sprite

                spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
                spriteX = Util.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * this.roadWidth * settings.width / 2);
                spriteY = Util.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);

                currentCarSprite = car.dir < 0 ? car.sprite.left : car.dir > 0 ? car.sprite.right : car.sprite.straight;
                

                this.renderer.DrawSprite(settings.width, settings.height, this.camera.resolution, this.roadWidth, currentCarSprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
            }



            if(segment == playerSegment){
                this.renderer.DrawPlayer(
                    settings.width,
                    settings.height,
                    this.camera.resolution,
                    this.roadWidth,
                    this.sprites.player,
                    this.player.speed / this.maxSpeed,
                    this.camera.depth / this.player.position.z,
                    settings.width * 0.5,
                    settings.height * 0.5 - (
                        this.camera.depth / this.player.position.z * 
                        Util.interpolate(
                            playerSegment.p1.camera.y, 
                            playerSegment.p2.camera.y, 
                            playerPercent
                    ) * settings.height * 0.5),
                    this.player.speed * (this.input.left ? -1 : this.input.right ? 1 : 0),
                    playerSegment.p2.world.y - playerSegment.p1.world.y
                )
            }
        }
    }


    Reset(){
        this.player.position.z = this.camera.depth * this.camera.height

        this.track.Reset()
        this.renderer.Clear()

        this.BuildTrack()

        this.ResetCars()
    }

    BuildTrack(){
        this.track.AddStraight(settings.road.length.short);
        this.track.AddLowRollingHills();
        this.track.AddSCurves();
        this.track.AddCurve(settings.road.length.medium, settings.road.curve.medium, 0);
        this.track.AddBumps();
        this.track.AddLowRollingHills();
        this.track.AddCurve(settings.road.length.long * 2, settings.road.curve.medium, 0);
        this.track.AddStraight();
        this.track.AddCurve(settings.road.length.medium, -settings.road.curve.hard, 0);
        this.track.AddSCurves();
        this.track.AddCurve(settings.road.length.long, -settings.road.curve.medium, 0);
        this.track.AddCurve(settings.road.length.medium, settings.road.curve.hard, 0);
        this.track.AddCurve(settings.road.length.long, -settings.road.curve.medium, 0);
        this.track.AddBumps();
        this.track.AddCurve(settings.road.length.medium, -settings.road.curve.medium, 0);
        this.track.AddStraight();
        this.track.AddSCurves();
        this.track.AddDownhillToEnd();

        this.track.segments[this.track.FindSegment(this.player.position.z).index + 2].colors = settings.colors.start
        this.track.segments[this.track.FindSegment(this.player.position.z).index + 3].colors = settings.colors.start

        for(let n = 0; n < settings.road.bumpLength; n++){

        }

        this.trackLength = this.track.segments.length * this.track.segmentLength
    }

    ResetCars(){
        this.cars = []

        let offset;
        let segment;
        let car;
        let z;
        let sprite;
        let speed;

        for(let n = 0; n < this.maxCars; n++){
            offset = Math.random() * Util.randomChoice([-0.8, 0.8])
            z = Math.floor(Math.random() * this.track.segments.length) * this.track.segmentLength
            sprite = this.sprites.player
            speed = this.maxSpeed * 0.7
            car = {
                offset,
                z,
                sprite,
                speed,
                dir: 0
            }

            segment = this.track.FindSegment(car.z)
            segment.cars.push(car)
            this.cars.push(car)
        }
    }
}

export default Game