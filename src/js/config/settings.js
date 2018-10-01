let fps = 60

export default {
    width: 1280,
    height: 720,
    timing: {
        fps: fps,
        tick: 1 / fps
    },

    input: {
        left: [37, 65],
        right: [39, 68],
        up: [38, 87],
        down: [40, 83]
    },
    
    colors: {
        background: '#05a',
        start: {
            road: 'white',
            grass: 'white',
            bump: 'white'
        },
        dark: {
            road: '#565656',
            grass: '#050',
            bump: '#f00',
            lane: '#CCCCCC',
            fog: '#05a'
        },
        light: {
            road: '#565656',
            grass: '#10AA10',
            bump: '#fff',
            fog: '#05a'
        }
    },
    road: {
        bumpLength: 3,
        lanes: 3,
        length: {
            none: 0,
            short: 25,
            medium: 50,
            long: 100
        },
        hill: {
            none: 0,
            low: 20,
            medium: 40,
            high: 60
        },
        curve: {
            none: 0,
            easy: 2,
            medium: 4,
            head: 6
        }
    }
}