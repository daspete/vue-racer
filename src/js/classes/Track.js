import settings from '../config/settings'
import Util from './helpers/Util'

class Track {
    constructor(){
        this.segments = []

        this.segmentLength = 200
    }

    AddSegment(curve, y){
        let n = this.segments.length

        this.segments.push({
            index: n,
            p1: {
                world: {
                    y: this.LastY(),
                    z: n * this.segmentLength
                },
                camera: {},
                screen: {}
            },
            p2: {
                world: {
                    y: y,
                    z: (n + 1) * this.segmentLength
                },
                camera: {},
                screen: {}
            },
            curve: curve,
            sprites: [],
            cars: [],
            colors: Math.floor(n / settings.road.bumpLength) % 2 ? settings.colors.dark : settings.colors.light
        })
    }

    AddRoad(enter, hold, leave, curve, y){
        let startY = this.LastY()
        let endY = startY + (Util.toInt(y, 0) * this.segmentLength)

        let total = enter + hold + leave

        for(let n = 0; n < enter; n++){
            this.AddSegment(Util.easeIn(0, curve, n / enter), Util.easeInOut(startY, endY, n / total))
        }
        for(let n = 0; n < hold; n++){
            this.AddSegment(curve, Util.easeInOut(startY, endY, (enter + n) / total))
        }
        for(let n = 0; n < leave; n++){
            this.AddSegment(Util.easeInOut(curve, 0, n / leave), Util.easeInOut(startY, endY, (enter + hold + n) / total))
        }
    }

    AddStraight(length){
        length = length || settings.road.length.medium

        this.AddRoad(length, length, length, 0, 0)
    }

    AddHill(length, height) {
        length = length || settings.road.length.medium;
        height = height || settings.road.hill.medium;

        this.AddRoad(length, length, length, 0, settings.height);
    }

    AddCurve(length, curve, height) {
        length = length || settings.road.length.medium;
        curve = curve || settings.road.curve.medium;
        height = height || settings.road.hill.none;

        this.AddRoad(length, length, length, curve, height);
    }

    AddLowRollingHills(length, height) {
        length = length || settings.road.length.short;
        height = height || settings.road.hill.low;

        this.AddRoad(length, length, length, 0, height / 2);
        this.AddRoad(length, length, length, 0, -height);
        this.AddRoad(length, length, length, settings.road.curve.easy, height);
        this.AddRoad(length, length, length, 0, 0);
        this.AddRoad(length, length, length, -settings.road.curve.easy, height / 2);
        this.AddRoad(length, length, length, 0, 0);
    }

    AddSCurves() {
        let length = settings.road.length.medium

        this.AddRoad(length, length, length, -settings.road.curve.easy, settings.road.hill.none);
        this.AddRoad(length, length, length, settings.road.curve.medium, settings.road.hill.medium);
        this.AddRoad(length, length, length, settings.road.curve.easy, -settings.road.hill.low);
        this.AddRoad(length, length, length, -settings.road.curve.easy, settings.road.hill.medium);
        this.AddRoad(length, length, length, -settings.road.curve.medium, -settings.road.hill.medium);
    }

    AddBumps() {
        let length = 10

        this.AddRoad(length, length, length, 0, 5);
        this.AddRoad(length, length, length, 0, -2);
        this.AddRoad(length, length, length, 0, -5);
        this.AddRoad(length, length, length, 0, 8);
        this.AddRoad(length, length, length, 0, 5);
        this.AddRoad(length, length, length, 0, -7);
        this.AddRoad(length, length, length, 0, 5);
        this.AddRoad(length, length, length, 0, -2);
    }

    AddDownhillToEnd(length) {
        length = length || 200;

        this.AddRoad(length, length, length, -settings.road.curve.easy, -this.LastY() / this.segmentLength);
    }

    Reset(){
        this.segments = []
    }

    FindSegment(z) {
        return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
    }

    LastY(){
        let n = this.segments.length

        return n == 0 ? 0 : this.segments[n - 1].p2.world.y
    }
}

export default Track