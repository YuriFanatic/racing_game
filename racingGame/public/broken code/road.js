camera = new Camera();

class Road {
    constructor(canvas, context) {
        // Reference to canvas and context for drawing
        this.canvas = canvas;
        this.context = context;

        // Array of road segments
        this.segments = [];

        // Single segment length
        this.segmentLength = 100;

        // Total number of road segments
        this.total_segments = null;

        // Number of visible segments to be drawn
        this.visible_segments = 200;

        // Number of segments that form a rumble strip
        this.rumble_segments = 5;

        // Number of road lanes
        this.roadLanes = 3;

        // Road width (actually half of the road)
        this.roadWidth = 1000;

        // Total road length
        this.roadLength = null;
    }

    //Creates the entire environment with road and roadside objects.
    create() {
        console.log("Creating road...");
        // Clear arrays
        this.segments = [];

        // Create a road
        this.createRoad();

        // Colorize first segments in a starting color, and last segments in a finishing color
        for (let n = 0; n < this.rumble_segments; n++) {
            this.segments[n].color.road = '#FFFFFF'; // start
            this.segments[this.segments.length - 1 - n].color.road = '#222222'; // finish
        }

        // Store the total number of segments
        this.total_segments = this.segments.length;

        // Calculate the road length
        this.roadLength = this.total_segments * this.segmentLength;
    }

    //Creates a road.
    createRoad() {
        this.createSection(300);
    }

    //Creates a road section.
    createSection(nSegments) {
        for (let i = 0; i < nSegments; i++) {
            this.createSegment();
        }
    }

    //Creates a new segment.
    createSegment() {
        // Define colors
        const COLORS = {
            LIGHT: { road: '#888888', grass: '#429352', rumble: '#b8312e' },
            DARK: { road: '#666666', grass: '#397d46', rumble: '#DDDDDD', lane: '#FFFFFF' }
        };

        // Get the current number of the segments
        let n = this.segments.length;

        // Add new segment
        this.segments.push({
            index: n,
            point: {
                world: { x: 0, y: 0, z: n * this.segmentLength },
                screen: { x: 0, y: 0, w: 0 },
                scale: -1
            },
            // Alternately color the groups of segments dark and light
            color: Math.floor(n / this.rumble_segments) % 2 ? COLORS.DARK : COLORS.LIGHT
        });
    }

    //Returns a segment at the given Z position.
    getSegment(positionZ) {
        if (positionZ < 0) positionZ += this.roadLength;  // Wrap negative Z values
        var index = Math.floor(positionZ / this.segmentLength) % this.total_segments;
        return this.segments[index];  // Return the segment at the calculated index
    }    

    //Projects a point from its world coordinates to screen coordinates (pseudo 3D view).
    project3D(point, cameraX, cameraY, cameraZ, cameraDepth) {
        // Translating world coordinates to camera coordinates
        let transX = point.world.x - cameraX;
        let transY = point.world.y - cameraY;
        let transZ = point.world.z - cameraZ;

        // Scaling factor based on the law of similar triangles
        point.scale = cameraDepth / transZ;

        // Projecting camera coordinates onto a normalized projection plane
        let projectedX = point.scale * transX;
        let projectedY = point.scale * transY;
        let projectedW = point.scale * this.roadWidth;

        // Scaling projected coordinates to the screen coordinates
        point.screen.x = Math.round((1 + projectedX) * this.canvas.width / 2);
        point.screen.y = Math.round((1 - projectedY) * this.canvas.height / 2);
        point.screen.w = Math.round(projectedW * this.canvas.width / 2);
    }

    //Renders the road by drawing segment by segment (pseudo 3D view).
    render3D(camera) {
        console.log("Rendering Road...");

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Define the clipping bottom line to render only segments above it
        let clipBottomLine = this.canvas.height;

        // Get the base segment
        let baseSegment = this.getSegment(camera.z);
        if (!baseSegment) {
            console.error("Base segment is undefined, camera out of bounds probably");
            return; // Avoid rendering if base segment is not found
        }

        let baseIndex = baseSegment.index;

        for (let n = 0; n < this.visible_segments; n++) {
            // Get the current segment
            let currIndex = (baseIndex + n) % this.total_segments;
            let currSegment = this.segments[currIndex];

            // Get the camera offset-Z to loop back the road
            let offsetZ = (currIndex < baseIndex) ? this.roadLength : 0;

            // Project the segment to the screen space
            this.project3D(currSegment.point, camera.x, camera.y, camera.z + this.roadLength, camera.distToPlane);

            // Draw this segment only if it is above the clipping bottom line
            let currBottomLine = currSegment.point.screen.y;

            if (n > 0 && currBottomLine < clipBottomLine) {
                let prevSegment = this.segments[(currIndex > 0 ? currIndex : this.segments.length) - 1];
                this.drawSegment(
                    prevSegment.point.screen.x, prevSegment.point.screen.y, prevSegment.point.screen.w,
                    currSegment.point.screen.x, currSegment.point.screen.y, currSegment.point.screen.w,
                    currSegment.color
                );

                // Move the clipping bottom line up
                clipBottomLine = currBottomLine;
            }
        }
    }

    //Draws a road segment.
    drawSegment(x1, y1, w1, x2, y2, w2, color) {
        // Draw the grass (full width of the screen)
        context.fillStyle = color.grass;
        context.fillRect(0, y2, canvas.width, y1 - y2);
    
        // Draw the road as a polygon
        context.fillStyle = color.road;
        context.beginPath();
        context.moveTo(x1 - w1, y1);
        context.lineTo(x1 + w1, y1);
        context.lineTo(x2 + w2, y2);
        context.lineTo(x2 - w2, y2);
        context.closePath();
        context.fill();
        
        // Draw rumble strips (optional)
        context.fillStyle = color.rumble;
        let rumbleWidth1 = w1 / 5;
        let rumbleWidth2 = w2 / 5;
        context.fillRect(x1 - w1 - rumbleWidth1, y1, rumbleWidth1, y2 - y1);
        context.fillRect(x1 + w1, y1, rumbleWidth1, y2 - y1);
    }
    

    //Draws a polygon defined with four points and color.
    drawPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color) {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x3, y3);
        this.context.lineTo(x4, y4);
        this.context.closePath();
        this.context.fill();
    }
}
