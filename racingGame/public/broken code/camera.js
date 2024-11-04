class Camera {
    constructor() {
        // Camera world coordinates
        this.x = 0;
        this.y = 1000;  //height above the ground
        this.z = 0;

        // Z-distance between camera and player
        this.distToPlayer = 500;

        // Z-distance between camera and projection plane
        this.distToPlane = null;
    }

    //Initializes camera settings, calculating distance to the projection plane.
    init() {
        this.distToPlane = 1 / (this.y / this.distToPlayer);
        console.log(`Camera initialized with distToPlane: ${this.distToPlane}`);
    }

    //Updates camera position relative to the player.
    update() {
        // Place the camera behind the player at the desired distance
        this.z = -this.distToPlayer;
        console.log(`Camera updated to z: ${this.z}`);
    }
}