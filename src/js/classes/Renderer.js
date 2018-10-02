import settings from '../config/settings'
import Util from './helpers/Util'

class Renderer {
    constructor(config){
        this.config = config

        this.ctx = config.ctx;
    }

    DrawPolygon(positions, color){
        // console.log(positions[0].y - positions[2].y)
        if(positions[0].y - positions[2].y < 0.1) return 

        this.ctx.fillStyle = color
        this.ctx.strokeStyle = color
        this.ctx.strokeWidth = 2

        this.ctx.beginPath()

        this.ctx.moveTo(positions[0].x, positions[0].y)

        for(let i = 1; i < positions.length; i++){
            this.ctx.lineTo(positions[i].x, positions[i].y)
        }

        // this.ctx.closePath()

        this.ctx.fill()
        this.ctx.stroke()
    }

    DrawSegment(width, lanes, startPos, endPos, fog, colors){
        let bumpStart = this.GetSideWidth(startPos.pWidth, lanes)
        let bumpEnd = this.GetSideWidth(endPos.pWidth, lanes)
        
        let laneStart = this.GetLaneMarkerWidth(startPos.pWidth, lanes)
        let laneEnd = this.GetLaneMarkerWidth(endPos.pWidth, lanes)
        
        this.ctx.fillStyle = colors.grass
        this.ctx.fillRect(0, endPos.y, width, startPos.y - endPos.y)

        // left bump
        this.DrawPolygon([
            {
                x: startPos.x - startPos.pWidth - bumpStart,
                y: startPos.y
            },
            {
                x: startPos.x - startPos.pWidth,
                y: startPos.y
            },
            {
                x: endPos.x - endPos.pWidth,
                y: endPos.y
            },
            {
                x: endPos.x - endPos.pWidth - bumpEnd,
                y: endPos.y
            },
        ], colors.bump)

        // right bump
        this.DrawPolygon([
            {
                x: startPos.x + startPos.pWidth + bumpStart,
                y: startPos.y
            },
            {
                x: startPos.x + startPos.pWidth,
                y: startPos.y
            },
            {
                x: endPos.x + endPos.pWidth,
                y: endPos.y
            },
            {
                x: endPos.x + endPos.pWidth + bumpEnd,
                y: endPos.y
            },
        ], colors.bump)

        // road
        this.DrawPolygon([
            {
                x: startPos.x - startPos.pWidth,
                y: startPos.y
            },
            {
                x: startPos.x + startPos.pWidth,
                y: startPos.y
            },
            {
                x: endPos.x + endPos.pWidth,
                y: endPos.y
            },
            {
                x: endPos.x - endPos.pWidth,
                y: endPos.y
            },
        ], colors.road)

        if(colors.lane){
            let laneStartPWidth = startPos.pWidth * 2 / lanes
            let laneEndPWidth = endPos.pWidth * 2 / lanes

            let laneStartX = startPos.x - startPos.pWidth + laneStartPWidth
            let laneEndX = endPos.x - endPos.pWidth + laneEndPWidth
            
            for(let lane = 1; lane < lanes; laneStartX += laneStartPWidth, laneEndX += laneEndPWidth, lane++){
                // lanes
                this.DrawPolygon([
                    {
                        x: laneStartX - laneStart / 2,
                        y: startPos.y
                    },
                    {
                        x: laneStartX + laneStart / 2,
                        y: startPos.y
                    },
                    {
                        x: laneEndX + laneEnd / 2,
                        y: endPos.y
                    },
                    {
                        x: laneEndX - laneEnd / 2,
                        y: endPos.y
                    }
                ], colors.lane)
            }
        }

        this.AddFog(0, startPos.y, width, endPos.y - startPos.y, fog, colors.fog)
    }

    DrawPlayer(width, height, resolution, roadWidth, sprites, speedPercent, scale, destX, destY, steer, updown){
        let bounciness = 1.5 * Math.random() * speedPercent * resolution * Util.randomChoice([-1, 1])
        let sprite;
        
        if(steer < 0){
            sprite = sprites.left
        }else if(steer > 0){
            sprite = sprites.right
        }else{
            sprite = sprites.straight
        }

        this.DrawSprite(
            width, 
            height,
            resolution,
            roadWidth,
            sprite,
            scale,
            destX,
            destY,// + bounciness,
            -0.5,
            -1
        )
    }

    DrawSprite(width, height, resolution, roadWidth, sprite, scale, destX, destY, offsetX, offsetY, clipY){
        let spriteScale = 0.2 * 1 / 180;

        let destWidth = (sprite.width * scale * width * 0.5) * (spriteScale * roadWidth)
        let destHeight = (sprite.height * scale * height * 0.66) * (spriteScale * roadWidth)

        destX += destWidth * (offsetX || 0)
        destY += destHeight * (offsetY || 0)

        let clipHeight = clipY ? Math.max(0, destY + destHeight - clipY) : 0

        if(clipHeight < destHeight){
            this.ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height - (sprite.height * clipHeight / destHeight), destX, destY, destWidth, destHeight - clipHeight)
        }
    }

    DrawBackground(){
        this.ctx.fillStyle = settings.colors.background
        this.ctx.fillRect(0, 0, settings.width, settings.height)
    }
    DrawFog(segment){
        let gradient = this.ctx.createLinearGradient(0, 0, 0, settings.height)
        gradient.addColorStop(0.4, 'black')
        gradient.addColorStop(0.7, 'rgba(0,0,0,0)')

        this.ctx.fillStyle = gradient
        this.ctx.fillRect(0, 0, settings.width, segment.p1.screen.y + 100)
    }

    AddFog(x, y, width, height, fog, color){
        // if(fog < 1){
            this.ctx.globalAlpha = 1 - fog

            this.ctx.fillStyle = color
            this.ctx.strokeStyle = color
            // this.ctx.strokeWidth = 2
            this.ctx.fillRect(x, y + 1, width, height - 2)
            // this.ctx.stroke()

            this.ctx.globalAlpha = 1
        // }
    }

    GetSideWidth(projectedRoadWidth, lanes){
        return projectedRoadWidth / 10//Math.max(6, 2 * lanes)
    }

    GetLaneMarkerWidth(projectedRoadWidth, lanes){
        return projectedRoadWidth / 50//Math.max(32, 8 * lanes)
    }

    Clear(){
        this.ctx.clearRect(0, 0, settings.width, settings.height)
    }
}

export default Renderer